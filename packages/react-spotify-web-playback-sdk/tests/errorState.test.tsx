import { expect, describe, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { ErrorStateProvider, useErrorState } from "../src/errorState";
import { WebPlaybackSDKReadyProvider } from "../src/webPlaybackSDKReady";
import { SpotifyPlayerProvider, useSpotifyPlayer } from "../src/spotifyPlayer";
import {
  MockSpotifyPlayer,
  setupMockSpotifyPlayer,
} from "./setup-spotify-mock";

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  return function CreatedWrapper({ children }) {
    return (
      <WebPlaybackSDKReadyProvider>
        <SpotifyPlayerProvider
          connectOnInitialized
          initialDeviceName="test device"
          getOAuthToken={() => {}}
        >
          <ErrorStateProvider>{children}</ErrorStateProvider>
        </SpotifyPlayerProvider>
      </WebPlaybackSDKReadyProvider>
    );
  };
};

describe("useErrorState", () => {
  const { makeSDKReady } = setupMockSpotifyPlayer();

  it("should throw an error if not wrapped in Provider", () => {
    expect(() => renderHook(() => useErrorState())).toThrow(
      Error(MUST_BE_WRAPPED_MESSAGE),
    );
  });

  it("should return null if SDK is not ready", () => {
    const { result } = renderHook(() => useErrorState(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeNull();
  });

  it("should register event listeners when player is available", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = useErrorState();
        const player = useSpotifyPlayer();

        return {
          playerDevice,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    expect(
      result.current.player.listeners.get("initialization_error")?.size,
    ).toBe(1);
    expect(
      result.current.player.listeners.get("authentication_error")?.size,
    ).toBe(1);
    expect(result.current.player.listeners.get("account_error")?.size).toBe(1);
    expect(result.current.player.listeners.get("playback_error")?.size).toBe(1);
  });

  it("should unregister event listeners on unmount", () => {
    const { result, unmount } = renderHook(
      () => {
        const playerDevice = useErrorState();
        const player = useSpotifyPlayer();

        return {
          playerDevice,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    unmount();

    expect(
      result.current.player.listeners.get("initialization_error")?.size,
    ).toBe(0);
    expect(
      result.current.player.listeners.get("authentication_error")?.size,
    ).toBe(0);
    expect(result.current.player.listeners.get("account_error")?.size).toBe(0);
    expect(result.current.player.listeners.get("playback_error")?.size).toBe(0);
  });

  it("should return 'initialization_error' when initialization error is fired", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = useErrorState();
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
      result.current.player.fireEvent("initialization_error", {
        message: "test initialization error",
      } as Spotify.Error),
    );

    expect(result.current.playerDevice).toEqual({
      type: "initialization_error",
      message: "test initialization error",
    });
  });

  it("should return 'authentication_error' when authentication error is fired", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = useErrorState();
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
      result.current.player.fireEvent("authentication_error", {
        message: "test authentication error",
      } as Spotify.Error),
    );

    expect(result.current.playerDevice).toEqual({
      type: "authentication_error",
      message: "test authentication error",
    });
  });

  it("should return 'account_error' when account error is fired", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = useErrorState();
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
      result.current.player.fireEvent("account_error", {
        message: "test account error",
      } as Spotify.Error),
    );

    expect(result.current.playerDevice).toEqual({
      type: "account_error",
      message: "test account error",
    });
  });

  it("should return 'playback_error' when playback error is fired", () => {
    const { result } = renderHook(
      () => {
        const playerDevice = useErrorState();
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
      result.current.player.fireEvent("playback_error", {
        message: "test playback error",
      } as Spotify.Error),
    );

    expect(result.current.playerDevice).toEqual({
      type: "playback_error",
      message: "test playback error",
    });
  });
});
