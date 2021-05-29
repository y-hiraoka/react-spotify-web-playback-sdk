import React, { createContext, useContext, useEffect, useState } from "react";
import { MUST_BE_WRAPPED_MESSAGE } from "./constant";
import { useSpotifyPlayerRawInstance } from "./spotifyPlayer";

const PlaybackStateContext = createContext<Spotify.PlaybackState | null | undefined>(
  undefined,
);

export const PlaybackStateProvider: React.FC = ({ children }) => {
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState | null>(
    null,
  );

  const player = useSpotifyPlayerRawInstance();

  useEffect(() => {
    if (player === null) return;

    const playerStateChanged = (state: Spotify.PlaybackState) => {
      setPlaybackState(state);
    };

    player.addListener("player_state_changed", playerStateChanged);

    return () => player.removeListener("player_state_changed", playerStateChanged);
  }, [player]);

  return <PlaybackStateContext.Provider value={playbackState} children={children} />;
};

export function usePlaybackState(interval?: false): Spotify.PlaybackState | null;
export function usePlaybackState(
  interval: true,
  durationMS?: number,
): Spotify.PlaybackState | null;
export function usePlaybackState(
  interval?: boolean,
  durationMS = 1000,
): Spotify.PlaybackState | null {
  const fromContext = useContext(PlaybackStateContext);

  if (fromContext === undefined) throw new Error(MUST_BE_WRAPPED_MESSAGE);

  const [playbackState, setPlaybackState] = useState(fromContext);

  const player = useSpotifyPlayerRawInstance();

  useEffect(() => setPlaybackState(fromContext), [fromContext]);

  const playbackStateIsNull = playbackState === null;
  useEffect(() => {
    if (!interval) return;
    if (player === null) return;
    if (playbackStateIsNull) return;

    if (playbackState!.paused) return;

    const intervalId = window.setInterval(async () => {
      const newState = await player.getCurrentState();
      setPlaybackState(newState);
    }, durationMS);

    return () => window.clearInterval(intervalId);
  }, [interval, player, playbackStateIsNull, playbackState?.paused, durationMS]);

  return playbackState;
}
