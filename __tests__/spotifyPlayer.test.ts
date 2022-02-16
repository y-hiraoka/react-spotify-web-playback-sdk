const mockUseWebPlaybackSDKReady = jest.fn();
jest.mock("../src/webPlaybackSDKReady", () => {
  return {
    useWebPlaybackSDKReady: mockUseWebPlaybackSDKReady,
  };
});

import { renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { SpotifyPlayerProvider, useSpotifyPlayer } from "../src/spotifyPlayer";

// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
const mockPlayerAddListener = jest.fn();
const mockPlayerRemoveListener = jest.fn();
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
const mockPlayerGetVolume = jest.fn();
const mockPlayerSetVolume = jest.fn();
Object.defineProperty(window, "Spotify", {
  writable: true,
  value: {
    Player: jest.fn<Spotify.Player, [Spotify.PlayerInit]>(arg => {
      return {
        _options: { ...arg, id: "device_id" },
        on: mockPlayerAddListener,
        addListener: mockPlayerAddListener,
        removeListener: mockPlayerRemoveListener,
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
        getVolume: mockPlayerGetVolume,
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
      initialDeviceName: "SpotifyPlayer test device",
      initialVolume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(result.current).toBeNull();
});

test("SpotifyPlayer will not connect on initialized.", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(true);
  renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      initialDeviceName: "SpotifyPlayer test device",
      initialVolume: 1,
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
      initialDeviceName: "SpotifyPlayer test device",
      initialVolume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(mockPlayerConnect.mock.calls.length).toBe(1);
});

jest.useFakeTimers();

test("useSpotifyPlayer returns null if web playback SDK is not loaded yet", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(false);
  const { result } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      initialDeviceName: "SpotifyPlayer test device",
      initialVolume: 1,
      getOAuthToken: () => {},
      connectOnInitialized: true,
    },
    wrapper: SpotifyPlayerProvider,
  });

  expect(result.current).toBeNull();
});

test("useSpotifyPlayer returns a player instance.", () => {
  mockUseWebPlaybackSDKReady.mockReturnValue(true);
  const { rerender, result } = renderHook(() => useSpotifyPlayer(), {
    initialProps: {
      initialDeviceName: "SpotifyPlayer test device",
      initialVolume: 1,
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
});
