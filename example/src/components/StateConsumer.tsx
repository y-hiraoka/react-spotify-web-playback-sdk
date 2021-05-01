import { memo, useEffect } from "react";
import {
  usePlaybackState,
  usePlayerDevice,
  useErrorState,
  useWebPlaybackSDKReady,
} from "react-spotify-web-playback-sdk";
import styles from "./StateConsumer.module.css";
import { StateSummary } from "./StateSummary";

export const StateConsumer: React.VFC<{ access_token: string }> = memo(
  ({ access_token }) => {
    const playbackState = usePlaybackState();
    const playerDevice = usePlayerDevice();
    const errorState = useErrorState();
    const webPlaybackSDKReady = useWebPlaybackSDKReady();

    useEffect(() => {
      if (playerDevice?.device_id === undefined) return;

      // https://developer.spotify.com/documentation/web-api/reference/#endpoint-transfer-a-users-playback
      fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        body: JSON.stringify({ device_ids: [playerDevice.device_id], play: false }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      });
    }, [playerDevice?.device_id]);

    return (
      <div className={styles.root}>
        <StateSummary summary="webPlaybackSDKReady" state={webPlaybackSDKReady} />
        <StateSummary summary="playbackState" state={playbackState} />
        <StateSummary summary="playerDevice" state={playerDevice} />
        <StateSummary summary="errorState" state={errorState} />
      </div>
    );
  },
);
