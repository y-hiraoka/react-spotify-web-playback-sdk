import { test, describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { SpotifyPlayerProvider, useSpotifyPlayer } from "../src/spotifyPlayer";
import { setupMockSpotifyPlayer } from "./setup-spotify-mock";
import { WebPlaybackSDKReadyProvider } from "../src/webPlaybackSDKReady";
import { act } from "react";

const createWrapper = (
  props: React.ComponentProps<typeof SpotifyPlayerProvider>,
): React.FC<{ children: React.ReactNode }> => {
  return function CreatedWrapper({ children }) {
    return (
      <WebPlaybackSDKReadyProvider>
        <SpotifyPlayerProvider {...props}>{children}</SpotifyPlayerProvider>
      </WebPlaybackSDKReadyProvider>
    );
  };
};

describe("useSpotifyPlayer", () => {
  const { makeSDKReady } = setupMockSpotifyPlayer();

  it("should throw an error if not wrapped in Provider", () => {
    expect(() => renderHook(() => useSpotifyPlayer())).toThrow(
      Error(MUST_BE_WRAPPED_MESSAGE),
    );
  });

  it("should return null if web playback SDK is not loaded yet", () => {
    const { result } = renderHook(() => useSpotifyPlayer(), {
      wrapper: createWrapper({
        initialDeviceName: "SpotifyPlayer test device",
        initialVolume: 1,
        getOAuthToken: () => {},
        connectOnInitialized: true,
      }),
    });

    expect(result.current).toBeNull();
  });

  it("should return a player instance after SDK is ready.", async () => {
    const { result } = renderHook(() => useSpotifyPlayer(), {
      wrapper: createWrapper({
        initialDeviceName: "SpotifyPlayer test device",
        initialVolume: 1,
        getOAuthToken: () => {},
        connectOnInitialized: false,
      }),
    });

    act(() => makeSDKReady());

    expect(result.current).instanceOf(window.Spotify.Player);
    expect(result.current?.connect).toBeCalledTimes(0); // check connect is not called
  });

  test("should return a connected player instance.", async () => {
    const { result } = renderHook(() => useSpotifyPlayer(), {
      wrapper: createWrapper({
        initialDeviceName: "SpotifyPlayer test device",
        initialVolume: 1,
        getOAuthToken: () => {},
        connectOnInitialized: true,
      }),
    });

    act(() => makeSDKReady());

    expect(result.current?.connect).toHaveBeenCalledTimes(1);
  });

  test("should disconnect player instance on unmount.", async () => {
    const { result, unmount } = renderHook(() => useSpotifyPlayer(), {
      wrapper: createWrapper({
        initialDeviceName: "SpotifyPlayer test device",
        initialVolume: 1,
        getOAuthToken: () => {},
        connectOnInitialized: true,
      }),
    });

    act(() => makeSDKReady());

    expect(result.current?.disconnect).toHaveBeenCalledTimes(0);

    unmount();

    expect(result.current?.disconnect).toHaveBeenCalledTimes(1);
  });
});
