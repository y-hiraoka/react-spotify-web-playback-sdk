import React, { createContext, useContext, useEffect, useState } from "react";
import { MUST_BE_WRAPPED_MESSAGE } from "./constant";
import { useSpotifyPlayer } from "./spotifyPlayer";

const PlaybackStateContext = createContext<Spotify.PlaybackState | null | undefined>(
  undefined,
);

type ProviderProps = {
  playbackStateAutoUpdate: boolean;
  playbackStateUpdateDuration_ms: number;
};

export const PlaybackStateProvider: React.FC<ProviderProps> = ({
  children,
  playbackStateAutoUpdate,
  playbackStateUpdateDuration_ms,
}) => {
  const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState | null>(
    null,
  );

  const player = useSpotifyPlayer();

  useEffect(() => {
    if (player === null) return;

    const playerStateChanged = (state: Spotify.PlaybackState) => {
      setPlaybackState(state);
    };

    player.addListener("player_state_changed", playerStateChanged);

    return () => player.removeListener("player_state_changed", playerStateChanged);
  }, [player]);

  // setup automatic playbackState updates
  const playbackStateIsNull = playbackState === null;
  useEffect(() => {
    if (!playbackStateAutoUpdate) return;
    if (player === null) return;
    if (playbackStateIsNull) return;
    if (playbackState!.paused) return;

    const intervalId = window.setInterval(async () => {
      const newState = await player.getCurrentState();
      setPlaybackState(newState);
    }, playbackStateUpdateDuration_ms);

    return () => window.clearInterval(intervalId);
  }, [
    playbackStateAutoUpdate,
    player,
    playbackStateIsNull,
    playbackState?.paused,
    playbackStateUpdateDuration_ms,
  ]);

  return <PlaybackStateContext.Provider value={playbackState} children={children} />;
};

export function usePlaybackState() {
  const value = useContext(PlaybackStateContext);

  if (value === undefined) throw new Error(MUST_BE_WRAPPED_MESSAGE);

  return value;
}
