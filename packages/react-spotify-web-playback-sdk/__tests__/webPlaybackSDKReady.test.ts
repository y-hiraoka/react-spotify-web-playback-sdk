import { act, renderHook } from "@testing-library/react-hooks";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import {
  WebPlaybackSDKReadyProvider,
  useWebPlaybackSDKReady,
} from "../src/webPlaybackSDKReady";

test("webPlaybackSDKReady", () => {
  const { result } = renderHook(() => useWebPlaybackSDKReady(), {
    wrapper: WebPlaybackSDKReadyProvider,
  });

  expect(result.current).toBe(false);

  act(() => window.onSpotifyWebPlaybackSDKReady());

  expect(result.current).toBe(true);
});

test("useWebPlaybackSDKReady is not wrapped with Provider", () => {
  const { result } = renderHook(() => useWebPlaybackSDKReady());

  expect(result.error).toEqual(Error(MUST_BE_WRAPPED_MESSAGE));
});
