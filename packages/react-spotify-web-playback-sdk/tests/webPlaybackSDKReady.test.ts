import { test, expect, describe, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { MUST_BE_WRAPPED_MESSAGE } from "../src/constant";
import {
  WebPlaybackSDKReadyProvider,
  useWebPlaybackSDKReady,
} from "../src/webPlaybackSDKReady";
import { setupMockSpotifyPlayer } from "./setup-spotify-mock";

describe("WebPlaybackSDKReady", () => {
  const { makeSDKReady } = setupMockSpotifyPlayer();

  it("should return false initially", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useWebPlaybackSDKReady(), {
      wrapper: WebPlaybackSDKReadyProvider,
    });

    expect(result.current).toBe(false);

    act(() => makeSDKReady());

    expect(result.current).toBe(true);
  });

  test("should throw an error if not wrapped in Provider", () => {
    expect(() => renderHook(() => useWebPlaybackSDKReady())).toThrow(
      Error(MUST_BE_WRAPPED_MESSAGE),
    );
  });
});
