const mockUseSpotifyPlayer = jest.fn();
jest.mock("../src/spotifyPlayer", () => {
  return {
    useSpotifyPlayer: mockUseSpotifyPlayer,
  };
});

import { act, renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { PlaybackStateProvider, usePlaybackState } from "../src/playbackState";

type MockSpotifyPlayer = Pick<
  Spotify.SpotifyPlayer,
  "addListener" | "removeListener" | "getCurrentState"
>;

let addedEventListener:
  | ((state: Spotify.PlaybackState) => void)
  | undefined = undefined;

const mockPlayerAddListener = jest
  .fn()
  .mockImplementation(
    (eventname: string, listener: (state: Spotify.PlaybackState) => void) => {
      addedEventListener = listener;
    },
  );
const mockPlayerRemoveListener = jest.fn(() => {
  addedEventListener = undefined;
});

const mockCurrentState = {
  paused: false,
  track_window: {},
} as Spotify.PlaybackState;
const mockPlayerGetCurrentState = jest.fn().mockReturnValue(mockCurrentState);

const mockPlayer: MockSpotifyPlayer = {
  addListener: mockPlayerAddListener,
  removeListener: mockPlayerRemoveListener,
  getCurrentState: mockPlayerGetCurrentState,
};

test("usePlaybackState is not wrapped with Provider", () => {
  const { result } = renderHook(() => usePlaybackState());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});

test("In case useSpotifyPlayer returns null", () => {
  mockUseSpotifyPlayer.mockReturnValue(null);
  const { result } = renderHook(() => usePlaybackState(), {
    initialProps: {
      playbackStateAutoUpdate: true,
      playbackStateUpdateDuration_ms: 1000,
    },
    wrapper: PlaybackStateProvider,
  });

  expect(result.current).toBeNull();
});

test("Add and remove eventLister for setPlaybackState.", () => {
  mockUseSpotifyPlayer.mockReturnValue(mockPlayer);
  const mockPlaybackState = { paused: true };

  const { unmount, result } = renderHook(() => usePlaybackState(), {
    initialProps: {
      playbackStateAutoUpdate: true,
      playbackStateUpdateDuration_ms: 1000,
    },
    wrapper: PlaybackStateProvider,
  });

  expect(mockPlayerAddListener.mock.calls.length).toBe(1);

  act(() => addedEventListener && addedEventListener(mockPlaybackState as any));

  expect(result.current).toBe(mockPlaybackState);

  unmount();

  expect(mockPlayerRemoveListener.mock.calls.length).toBe(1);
});

jest.useFakeTimers();
test("playbackState is updated automatically.", async () => {
  // props.playbackStateAutoUpdate is false
  const { rerender, result, waitForNextUpdate } = renderHook(
    () => usePlaybackState(),
    {
      initialProps: {
        playbackStateAutoUpdate: false,
        playbackStateUpdateDuration_ms: 1000,
      },
      wrapper: PlaybackStateProvider,
    },
  );

  expect(window.setInterval).toHaveBeenCalledTimes(0);

  // Spotify.Player instance is null
  mockUseSpotifyPlayer.mockReturnValue(null);
  rerender({
    playbackStateAutoUpdate: true,
    playbackStateUpdateDuration_ms: 1000,
  });

  expect(window.setInterval).toHaveBeenCalledTimes(0);

  // current playbackState is null
  mockUseSpotifyPlayer.mockReturnValue(mockPlayer);
  rerender();

  // playbackState.paused is true
  act(() => addedEventListener && addedEventListener({ paused: true } as any));
  expect(window.setInterval).toHaveBeenCalledTimes(0);

  // playbackState will be update automatically.
  act(() => addedEventListener && addedEventListener({ paused: false } as any));
  expect(window.setInterval).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(1000);
  await waitForNextUpdate();
  expect(mockPlayerGetCurrentState).toHaveBeenCalledTimes(1);
  expect(result.current).toBe(mockCurrentState);
});
