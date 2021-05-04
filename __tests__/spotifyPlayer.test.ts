const mockUseWebPlaybackSDKReady = jest.fn();
jest.mock("../src/webPlaybackSDKReady", () => {
  return {
    useWebPlaybackSDKReady: mockUseWebPlaybackSDKReady,
  };
});

import { renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { SpotifyPlayerProvider, useSpotifyPlayer } from "../src/spotifyPlayer";

type MockSpotifyPlayer = Pick<
  Spotify.SpotifyPlayer,
  "connect" | "togglePlay" | "setName" | "setVolume"
>;

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
const mockPlayerConnect = jest.fn();
const mockPlayerTogglePlay = jest.fn();
const mockPlayerSetName = jest.fn();
const mockPlayerSetVolume = jest.fn();
Object.defineProperty(window, "Spotify", {
  writable: true,
  value: {
    Player: jest.fn<MockSpotifyPlayer, [Spotify.PlayerInit]>(arg => {
      return {
        connect: mockPlayerConnect,
        togglePlay: mockPlayerTogglePlay,
        setName: mockPlayerSetName,
        setVolume: mockPlayerSetVolume,
      };
    }),
  },
});

test("useSpotifyPlayer is not wrapped with Provider", () => {
  const { result } = renderHook(() => useSpotifyPlayer());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});

test("In case web playback SDK is not loaded yet", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(false);
  const { result } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "SpotifyPlayer test device",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(result.current).toBeNull();
});

test("SpotifyPlayer does not connect on initialized.", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(true);
  renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "SpotifyPlayer test device",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: false,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(mockPlayerConnect.mock.calls.length).toBe(0);
});

test("SpotifyPlayer connects on initialized.", () => {
  renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "SpotifyPlayer test device",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(mockPlayerConnect.mock.calls.length).toBe(1);
});

jest.useFakeTimers();
test("Update deviceName after initialized", () => {
  const { rerender } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "deviceName",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  jest.advanceTimersByTime(1000);

  expect(mockPlayerSetName.mock.calls.length).toBe(0);

  rerender({
    deviceName: "deviceName updated",
    connectOnInitialized: true,
    getOAuthToken: () => {},
    volume: 1,
  });

  jest.advanceTimersByTime(1000);

  expect(mockPlayerSetName.mock.calls.length).toBe(1);
  expect(mockPlayerSetName.mock.calls[0][0]).toBe("deviceName updated");
});

test("set undefined to volume prop after initialized", () => {
  const { rerender } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "deviceName",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(mockPlayerSetVolume.mock.calls.length).toBe(0);

  rerender({
    deviceName: "deviceName",
    connectOnInitialized: true,
    getOAuthToken: () => {},
    volume: undefined,
  });

  expect(mockPlayerSetVolume.mock.calls.length).toBe(0);
});

test("Update volume after initialized", () => {
  const { rerender } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "deviceName",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(mockPlayerSetVolume.mock.calls.length).toBe(0);

  rerender({
    deviceName: "deviceName",
    connectOnInitialized: true,
    getOAuthToken: () => {},
    volume: 0.5,
  });

  expect(mockPlayerSetVolume.mock.calls.length).toBe(1);
  expect(mockPlayerSetVolume.mock.calls[0][0]).toBe(0.5);
});
