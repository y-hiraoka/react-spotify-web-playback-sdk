import React, { createContext, useContext, useEffect, useState } from "react";
import { MUST_BE_WRAPPED_MESSAGE } from "./constant";
import { useSpotifyPlayer } from "./spotifyPlayer";

export type ErrorState = Spotify.Error & { type: Spotify.ErrorTypes };

const ErrorStateContext = createContext<ErrorState | null | undefined>(undefined);

export const ErrorStateProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const player = useSpotifyPlayer();

  useEffect(() => {
    if (player === null) return;

    const onInitializationError = (error: Spotify.Error) => {
      setErrorState({ ...error, type: "initialization_error" });
    };

    const onAuthenticationError = (error: Spotify.Error) => {
      setErrorState({ ...error, type: "authentication_error" });
    };

    const onAccountError = (error: Spotify.Error) => {
      setErrorState({ ...error, type: "account_error" });
    };

    const onPlaybackError = (error: Spotify.Error) => {
      setErrorState({ ...error, type: "playback_error" });
    };

    player.addListener("initialization_error", onInitializationError);
    player.addListener("authentication_error", onAuthenticationError);
    player.addListener("account_error", onAccountError);
    player.addListener("playback_error", onPlaybackError);

    return () => {
      player.removeListener("initialization_error", onInitializationError);
      player.removeListener("authentication_error", onAuthenticationError);
      player.removeListener("account_error", onAccountError);
      player.removeListener("playback_error", onPlaybackError);
    };
  }, [player]);

  return <ErrorStateContext.Provider value={errorState} children={children} />;
};

export function useErrorState() {
  const value = useContext(ErrorStateContext);

  if (value === undefined) throw new Error(MUST_BE_WRAPPED_MESSAGE);

  return value;
}
