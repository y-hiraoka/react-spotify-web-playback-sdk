import { afterEach, beforeEach, vi } from "vitest";

export class MockSpotifyPlayer implements Spotify.Player {
  _options: Spotify.PlayerInit & { id: string };

  constructor(options: Spotify.PlayerInit) {
    this._options = { ...options, id: "test_device_id" };
  }

  connect = vi.fn(() => Promise.resolve(true));
  disconnect = vi.fn();

  private _currentState: Spotify.PlaybackState | null = null;
  setCurrentStateForTesting(state: Spotify.PlaybackState | null) {
    this._currentState = state;
  }
  getCurrentState = vi.fn(() => Promise.resolve(this._currentState));
  getVolume = vi.fn(() => Promise.resolve(1));
  nextTrack = vi.fn();

  listeners = new Map<
    string,
    Set<
      | Spotify.PlaybackInstanceListener
      | Spotify.EmptyListener
      | Spotify.PlaybackStateListener
      | Spotify.ErrorListener
    >
  >();

  addListener = vi.fn((event: string, callback) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  });
  on = this.addListener;

  fireEvent(
    event: "ready" | "not_ready",
    instance: Spotify.WebPlaybackInstance,
  ): void;
  fireEvent(event: "autoplay_failed"): void;
  fireEvent(event: "player_state_changed", state: Spotify.PlaybackState): void;
  fireEvent(event: Spotify.ErrorTypes, error: Spotify.Error): void;
  fireEvent(event: string, arg?: any): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;
    listeners.forEach((listener) => listener(arg));
  }

  removeListener = vi.fn((event: string, callback) => {
    if (!this.listeners.has(event)) return;
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  });

  pause = vi.fn();
  previousTrack = vi.fn();
  resume = vi.fn();
  seek = vi.fn();
  setName = vi.fn();
  setVolume = vi.fn();
  togglePlay = vi.fn();

  activateElement = vi.fn();
}

export const setupMockSpotifyPlayer = () => {
  const makeSDKReady = () => window.onSpotifyWebPlaybackSDKReady();

  beforeEach(() => {
    vi.stubGlobal("Spotify", {
      Player: MockSpotifyPlayer,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  return { makeSDKReady };
};
