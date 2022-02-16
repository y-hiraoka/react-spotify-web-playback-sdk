const mockUseSpotifyPlayer = jest.fn();
jest.mock("../src/spotifyPlayer", () => {
  return {
    useSpotifyPlayer: mockUseSpotifyPlayer,
  };
});

import { act, renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import { DeviceProvider, usePlayerDevice, PlayerDevice } from "../src/device";

type MockSpotifyPlayer = Pick<Spotify.Player, "addListener" | "removeListener">;

let addedReadyListener: ((state: PlayerDevice) => void) | undefined = undefined;
let addedNotReadyListener: ((state: PlayerDevice) => void) | undefined = undefined;

const mockPlayerAddListener = jest
  .fn()
  .mockImplementation(
    (eventname: "ready" | "not_ready", listener: (state: PlayerDevice) => void) => {
      if (eventname === "ready") {
        addedReadyListener = listener;
      } else {
        addedNotReadyListener = listener;
      }
    },
  );
const mockPlayerRemoveListener = jest.fn((eventname: "ready" | "not_ready") => {
  if (eventname === "ready") {
    addedReadyListener = undefined;
  } else {
    addedNotReadyListener = undefined;
  }
});

const mockPlayer: MockSpotifyPlayer = {
  addListener: mockPlayerAddListener,
  removeListener: mockPlayerRemoveListener,
};

test("usePlayerDevice is not wrapped with Provider", () => {
  const { result } = renderHook(() => usePlayerDevice());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});

test("In case useSpotifyPlayer returns null", () => {
  mockUseSpotifyPlayer.mockReturnValue(null);
  const { result } = renderHook(() => usePlayerDevice(), {
    initialProps: {
      playbackStateAutoUpdate: true,
      playbackStateUpdateDuration_ms: 1000,
    },
    wrapper: DeviceProvider,
  });

  expect(result.current).toBeNull();
});

test("Add and remove eventListers for playerDevice.", () => {
  mockUseSpotifyPlayer.mockReturnValue(mockPlayer);

  const { unmount, result } = renderHook(() => usePlayerDevice(), {
    wrapper: DeviceProvider,
  });

  expect(mockPlayerAddListener.mock.calls.length).toBe(2);

  act(
    () =>
      addedReadyListener &&
      addedReadyListener({ device_id: "device_id", status: "ready" }),
  );

  expect(result.current).toEqual({ device_id: "device_id", status: "ready" });

  act(
    () =>
      addedNotReadyListener &&
      addedNotReadyListener({ device_id: "device_id", status: "not_ready" }),
  );

  expect(result.current).toEqual({ device_id: "device_id", status: "not_ready" });

  unmount();

  expect(addedReadyListener).toBeUndefined();
  expect(addedNotReadyListener).toBeUndefined();
});
