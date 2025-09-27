import { expect, vi, describe, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { PlaybackStateProvider, usePlaybackState } from "../src/playbackState";
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
          <PlaybackStateProvider>{children}</PlaybackStateProvider>
        </SpotifyPlayerProvider>
      </WebPlaybackSDKReadyProvider>
    );
  };
};

describe("usePlaybackState", () => {
  const { makeSDKReady } = setupMockSpotifyPlayer();

  it("should throw an error if not wrapped in a provider", () => {
    expect(() => renderHook(() => usePlaybackState())).toThrow(
      Error(MUST_BE_WRAPPED_MESSAGE),
    );
  });

  it("should return null if SDK is not ready", () => {
    const { result } = renderHook(() => usePlaybackState(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeNull();
  });

  it("should register an event listener for playback state changes", () => {
    const { result } = renderHook(
      () => {
        const playbackState = usePlaybackState();
        const player = useSpotifyPlayer();

        return {
          playbackState,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    expect(
      result.current.player.listeners.get("player_state_changed")?.size,
    ).toBe(1);
  });

  it("should unregister the event listener on unmount", () => {
    const { result, unmount } = renderHook(
      () => {
        const playbackState = usePlaybackState();
        const player = useSpotifyPlayer();

        return {
          playbackState,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    expect(
      result.current.player.listeners.get("player_state_changed")?.size,
    ).toBe(1);

    unmount();

    expect(
      result.current.player.listeners.get("player_state_changed")?.size,
    ).toBe(0);
  });

  it("should update the playback state when the event is triggered", () => {
    const { result, unmount } = renderHook(
      () => {
        const playbackState = usePlaybackState();
        const player = useSpotifyPlayer();

        return {
          playbackState,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    expect(result.current.playbackState).toBeNull();

    act(() => {
      result.current.player.fireEvent("player_state_changed", {
        timestamp: 100,
      } as Spotify.PlaybackState);
    });

    expect(result.current.playbackState).toEqual({ timestamp: 100 });
  });

  it("should not update the playbackState automatically when 'interval' is false", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(
      () => {
        const playbackState = usePlaybackState(false);
        const player = useSpotifyPlayer();

        return {
          playbackState,
          player: player as MockSpotifyPlayer,
        };
      },
      { wrapper: createWrapper() },
    );

    act(() => makeSDKReady());

    act(() => {
      result.current.player.fireEvent("player_state_changed", {
        timestamp: 100,
      } as Spotify.PlaybackState);
    });

    expect(result.current.playbackState).toEqual({ timestamp: 100 });

    result.current.player.setCurrentStateForTesting({
      timestamp: 200,
    } as Spotify.PlaybackState);

    vi.advanceTimersByTime(5000);

    expect(result.current.playbackState).toEqual({ timestamp: 100 });
  });

  it("should update the playbackState every specified number of milliseconds", async () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ durationMS }) => {
        const playbackState = usePlaybackState(true, durationMS);
        const player = useSpotifyPlayer();

        return {
          playbackState,
          player: player as MockSpotifyPlayer,
        };
      },
      {
        wrapper: createWrapper(),
        initialProps: { durationMS: undefined as number | undefined },
      },
    );

    act(() => makeSDKReady());

    act(() => {
      result.current.player.fireEvent("player_state_changed", {
        timestamp: 100,
      } as Spotify.PlaybackState);
    });

    expect(result.current.playbackState).toEqual({ timestamp: 100 });

    result.current.player.setCurrentStateForTesting({
      timestamp: 200,
    } as Spotify.PlaybackState);

    await act(() => vi.advanceTimersByTime(1000));

    expect(result.current.playbackState).toEqual({ timestamp: 200 });

    rerender({ durationMS: 500 });

    result.current.player.setCurrentStateForTesting({
      timestamp: 300,
    } as Spotify.PlaybackState);

    await act(() => vi.advanceTimersByTime(500));

    expect(result.current.playbackState).toEqual({ timestamp: 300 });

    result.current.player.setCurrentStateForTesting({
      timestamp: 400,
    } as Spotify.PlaybackState);

    await act(() => vi.advanceTimersByTime(500));

    expect(result.current.playbackState).toEqual({ timestamp: 400 });
  });
});

let addedEventListener: ((state: Spotify.PlaybackState) => void) | undefined =
  undefined;

const mockPlayerAddListener = vi
  .fn()
  .mockImplementation(
    (eventname: string, listener: (state: Spotify.PlaybackState) => void) => {
      addedEventListener = listener;
    },
  );
const mockPlayerRemoveListener = vi.fn(() => {
  addedEventListener = undefined;
});
