import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MUST_BE_WRAPPED_MESSAGE } from "./constant";
import { useWebPlaybackSDKReady } from "./webPlaybackSDKReady";

const PlayerContext = createContext<Spotify.Player | null | undefined>(
  undefined,
);

type ProviderProps = {
  initialDeviceName: Spotify.PlayerInit["name"];
  getOAuthToken: Spotify.PlayerInit["getOAuthToken"];
  initialVolume?: Spotify.PlayerInit["volume"];
  connectOnInitialized: boolean;
  children?: React.ReactNode;
};

export const SpotifyPlayerProvider: React.FC<ProviderProps> = ({
  children,
  initialDeviceName,
  getOAuthToken,
  initialVolume,
  connectOnInitialized,
}) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const webPlaybackSDKReady = useWebPlaybackSDKReady();

  // to get the latest function.
  const getOAuthTokenRef = useRef(getOAuthToken);
  getOAuthTokenRef.current = getOAuthToken;

  // create Spotify.Player instance.
  useEffect(
    () => {
      if (webPlaybackSDKReady) {
        const player = new Spotify.Player({
          name: initialDeviceName,
          getOAuthToken: (callback) => getOAuthTokenRef.current(callback),
          volume: initialVolume,
        });

        setPlayer(player);

        if (connectOnInitialized) {
          player.connect();
        }

        return () => player.disconnect();
      }
    },
    // `deviceName` and `volume` are intentionally not passed.
    // When they are changed, they will be applied with the following useUpdateEffect.
    [connectOnInitialized, webPlaybackSDKReady],
  );

  return <PlayerContext.Provider value={player} children={children} />;
};

export function useSpotifyPlayer() {
  const value = useContext(PlayerContext);

  if (value === undefined) throw new Error(MUST_BE_WRAPPED_MESSAGE);

  return value;
}
