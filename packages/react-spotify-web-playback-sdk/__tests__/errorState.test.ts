const mockUseSpotifyPlayer = jest.fn();
jest.mock("../src/spotifyPlayer", () => {
  return {
    useSpotifyPlayer: mockUseSpotifyPlayer,
  };
});

import { act, renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import {
  ErrorStateProvider,
  useErrorState,
  ErrorState,
} from "../src/errorState";

type MockSpotifyPlayer = Pick<Spotify.Player, "addListener" | "removeListener">;

let addedInitializationErrorListener:
  | ((state: ErrorState) => void)
  | undefined = undefined;
let addedAuthenticationErrorListener:
  | ((state: ErrorState) => void)
  | undefined = undefined;
let addedAccountErrorListener: ((state: ErrorState) => void) | undefined =
  undefined;
let addedPlaybackErrorListener: ((state: ErrorState) => void) | undefined =
  undefined;

const mockPlayerAddListener = jest
  .fn()
  .mockImplementation(
    (eventname: Spotify.ErrorTypes, listener: (state: ErrorState) => void) => {
      if (eventname === "initialization_error") {
        addedInitializationErrorListener = listener;
      } else if (eventname === "authentication_error") {
        addedAuthenticationErrorListener = listener;
      } else if (eventname === "account_error") {
        addedAccountErrorListener = listener;
      } else {
        addedPlaybackErrorListener = listener;
      }
    },
  );
const mockPlayerRemoveListener = jest.fn((eventname: Spotify.ErrorTypes) => {
  if (eventname === "initialization_error") {
    addedInitializationErrorListener = undefined;
  } else if (eventname === "authentication_error") {
    addedAuthenticationErrorListener = undefined;
  } else if (eventname === "account_error") {
    addedAccountErrorListener = undefined;
  } else {
    addedPlaybackErrorListener = undefined;
  }
});

const mockPlayer: MockSpotifyPlayer = {
  addListener: mockPlayerAddListener,
  removeListener: mockPlayerRemoveListener,
};

test("useErrorState is not wrapped with Provider", () => {
  const { result } = renderHook(() => useErrorState());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});

test("In case useSpotifyPlayer returns null", () => {
  mockUseSpotifyPlayer.mockReturnValue(null);

  const { result } = renderHook(() => useErrorState(), {
    wrapper: ErrorStateProvider,
  });

  expect(result.current).toBeNull();
});

test("Add and remove eventListers for errorState.", () => {
  mockUseSpotifyPlayer.mockReturnValue(mockPlayer);

  const { unmount, result } = renderHook(() => useErrorState(), {
    wrapper: ErrorStateProvider,
  });

  expect(mockPlayerAddListener.mock.calls.length).toBe(4);

  act(
    () =>
      addedInitializationErrorListener &&
      addedInitializationErrorListener({
        type: "initialization_error",
        message: "initialization error",
      }),
  );

  expect(result.current).toEqual({
    type: "initialization_error",
    message: "initialization error",
  });

  act(
    () =>
      addedAuthenticationErrorListener &&
      addedAuthenticationErrorListener({
        type: "authentication_error",
        message: "authentication error",
      }),
  );

  expect(result.current).toEqual({
    type: "authentication_error",
    message: "authentication error",
  });

  act(
    () =>
      addedAccountErrorListener &&
      addedAccountErrorListener({
        type: "account_error",
        message: "account error",
      }),
  );

  expect(result.current).toEqual({
    type: "account_error",
    message: "account error",
  });

  act(
    () =>
      addedPlaybackErrorListener &&
      addedPlaybackErrorListener({
        type: "playback_error",
        message: "playback error",
      }),
  );

  expect(result.current).toEqual({
    type: "playback_error",
    message: "playback error",
  });

  unmount();

  expect(addedInitializationErrorListener).toBeUndefined();
  expect(addedAuthenticationErrorListener).toBeUndefined();
  expect(addedAccountErrorListener).toBeUndefined();
  expect(addedPlaybackErrorListener).toBeUndefined();
});
