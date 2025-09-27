import { describe, it } from "vitest";
import { expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { DeviceProvider, usePlayerDevice } from "../src/device";
import { WebPlaybackSDKReadyProvider } from "../src/webPlaybackSDKReady";
import {
  MockSpotifyPlayer,
  setupMockSpotifyPlayer,
} from "./setup-spotify-mock";
import { SpotifyPlayerProvider, useSpotifyPlayer } from "../src/spotifyPlayer";

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  return function CreatedWrapper({ children }) {
    return (
      <WebPlaybackSDKReadyProvider>
        <SpotifyPlayerProvider
          connectOnInitialized
          initialDeviceName="test device"
          getOAuthToken={() => {}}
        >
          <DeviceProvider>{children}</DeviceProvider>
        </SpotifyPlayerProvider>
      </WebPlaybackSDKReadyProvider>
    );
  };
};

describe("usePlayerDevice", () => {
  const { makeSDKReady } = setupMockSpotifyPlayer();

  it("should throw an error if not wrapped in Provider", () => {
    expect(() => renderHook(() => usePlayerDevice())).toThrow(
      Error(MUST_BE_WRAPPED_MESSAGE),
    );
  });

  it("should return null if SDK is not ready", () => {
    const { result } = renderHook(() => usePlayerDevice(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeNull();
  });

  it("should register event listeners when player is available", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = usePlayerDevice();
        const player = useSpotifyPlayer();

        return {
          playerDevice,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    expect(result.current.player.listeners.get("ready")?.size).toBe(1);
    expect(result.current.player.listeners.get("not_ready")?.size).toBe(1);
  });

  it("should return device info when 'ready' event is fired", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = usePlayerDevice();
        const player = useSpotifyPlayer();

        return {
          playerDevice,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    act(() =>
      result.current.player.fireEvent("ready", { device_id: "device_id" }),
    );

    expect(result.current.playerDevice).toEqual({
      device_id: "device_id",
      status: "ready",
    });
  });

  it("should return device info when 'not_ready' event is fired", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = usePlayerDevice();
        const player = useSpotifyPlayer();

        return {
          playerDevice,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    act(() =>
      result.current.player.fireEvent("not_ready", { device_id: "device_id" }),
    );

    expect(result.current.playerDevice).toEqual({
      device_id: "device_id",
      status: "not_ready",
    });
  });

  it("should unregister event listeners on unmount", () => {
    const { result, unmount } = renderHook(
      () => {
        const playerDevice = usePlayerDevice();
        const player = useSpotifyPlayer();

        return {
          playerDevice,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    expect(result.current.player.listeners.get("ready")?.size).toBe(1);
    expect(result.current.player.listeners.get("not_ready")?.size).toBe(1);

    unmount();

    expect(result.current.player.listeners.get("ready")?.size).toBe(0);
    expect(result.current.player.listeners.get("not_ready")?.size).toBe(0);
  });
});
