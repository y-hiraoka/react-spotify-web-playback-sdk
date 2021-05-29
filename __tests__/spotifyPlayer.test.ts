const mockUseWebPlaybackSDKReady = jest.fn();
jest.mock("../src/webPlaybackSDKReady", () => {
  return {
    useWebPlaybackSDKReady: mockUseWebPlaybackSDKReady,
  };
});

import { renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import {
  SpotifyPlayerProvider,
  useSpotifyPlayerRawInstance,
  useSpotifyPlayer,
} from "../src/spotifyPlayer";

type MockSpotifyPlayerRawInstance = Pick<
  Spotify.Player,
  | "connect"
  | "disconnect"
  | "getCurrentState"
  | "nextTrack"
  | "pause"
  | "previousTrack"
  | "resume"
  | "seek"
  | "togglePlay"
  | "setName"
  | "setVolume"
>;

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
const mockPlayerConnect = jest.fn();
const mockPlayerDisconnect = jest.fn();
const mockPlayerGetCurrentState = jest.fn();
const mockPlayerNextTrack = jest.fn();
const mockPlayerPause = jest.fn();
const mockPlayerPreviousTrack = jest.fn();
const mockPlayerResume = jest.fn();
const mockPlayerSeek = jest.fn();
const mockPlayerTogglePlay = jest.fn();
const mockPlayerSetName = jest.fn();
const mockPlayerSetVolume = jest.fn();
Object.defineProperty(window, "Spotify", {
  writable: true,
  value: {
    Player: jest.fn<MockSpotifyPlayerRawInstance, [Spotify.PlayerInit]>(arg => {
      return {
        connect: mockPlayerConnect,
        disconnect: mockPlayerDisconnect,
        getCurrentState: mockPlayerGetCurrentState,
        nextTrack: mockPlayerNextTrack,
        pause: mockPlayerPause,
        previousTrack: mockPlayerPreviousTrack,
        resume: mockPlayerResume,
        seek: mockPlayerSeek,
        togglePlay: mockPlayerTogglePlay,
        setName: mockPlayerSetName,
        setVolume: mockPlayerSetVolume,
      };
    }),
  },
});

test("useSpotifyPlayerRawInstance is not wrapped with Provider", () => {
  const { result } = renderHook(() => useSpotifyPlayerRawInstance());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});

test("In case web playback SDK is not loaded yet", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(false);
  const { result } = renderHook(() => useSpotifyPlayerRawInstance(), {
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
  renderHook(() => useSpotifyPlayerRawInstance(), {
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
  renderHook(() => useSpotifyPlayerRawInstance(), {
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
  const { rerender } = renderHook(() => useSpotifyPlayerRawInstance(), {
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
  const { rerender } = renderHook(() => useSpotifyPlayerRawInstance(), {
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
  const { rerender } = renderHook(() => useSpotifyPlayerRawInstance(), {
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

test("useSpotifyPlayer is not wrapped with Provider", () => {
  const { result } = renderHook(() => useSpotifyPlayer());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});

test("useSpotifyPlayer returns null", () => {});

test("useSpotifyPlayer returns null In case web playback SDK is not loaded yet", () => {
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

test("useSpotifyPlayer returns memoized instance.", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(true);
  const { rerender, result } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      deviceName: "SpotifyPlayer test device",
      volume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  mockPlayerConnect.mockReturnValueOnce("connect");
  expect(result.current?.connect()).toBe("connect");

  mockPlayerDisconnect.mockReturnValueOnce("disconnect");
  expect(result.current?.disconnect()).toBe("disconnect");

  mockPlayerGetCurrentState.mockReturnValueOnce("getCurrentState");
  expect(result.current?.getCurrentState()).toBe("getCurrentState");

  mockPlayerNextTrack.mockReturnValueOnce("nextTrack");
  expect(result.current?.nextTrack()).toBe("nextTrack");

  mockPlayerPause.mockReturnValueOnce("pause");
  expect(result.current?.pause()).toBe("pause");

  mockPlayerPreviousTrack.mockReturnValueOnce("previousTrack");
  expect(result.current?.previousTrack()).toBe("previousTrack");

  mockPlayerResume.mockReturnValueOnce("resume");
  expect(result.current?.resume()).toBe("resume");

  mockPlayerSeek.mockReturnValueOnce("seek");
  expect(result.current?.seek(100)).toBe("seek");

  mockPlayerTogglePlay.mockReturnValueOnce("togglePlay");
  expect(result.current?.togglePlay()).toBe("togglePlay");

  const beforeRendering = result.current;
  rerender();
  const afterRendering = result.current;
  expect(beforeRendering).toBe(afterRendering);
});
