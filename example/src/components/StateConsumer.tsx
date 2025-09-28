import { memo, useEffect } from "react";
import {
  usePlaybackState,
  usePlayerDevice,
  useErrorState,
  useWebPlaybackSDKReady,
} from "react-spotify-web-playback-sdk";
import styles from "./StateConsumer.module.css";
import { StateSummary } from "./StateSummary";
import { useSession } from "next-auth/react";

export const StateConsumer: React.FC = memo(() => {
  const playbackState = usePlaybackState(true, 100);
  const playerDevice = usePlayerDevice();
  const errorState = useErrorState();
  const webPlaybackSDKReady = useWebPlaybackSDKReady();
  const session = useSession({ required: true });

  useEffect(() => {
    if (playerDevice?.device_id === undefined) return;
    if (session.status !== "authenticated") return;

    // https://developer.spotify.com/documentation/web-api/reference/#endpoint-transfer-a-users-playback
    fetch(`https://api.spotify.com/v1/me/player`, {
      method: "PUT",
      body: JSON.stringify({
        device_ids: [playerDevice.device_id],
        play: false,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.access_token}`,
      },
    });
  }, [playerDevice?.device_id, session]);

  return (
    <div className={styles.root}>
      <p className={styles.warning}>
        If playback does not start, you may need to click the{" "}
        <code>player.activateElement</code> button. See{" "}
        <a
          href="https://developer.spotify.com/documentation/web-playback-sdk/reference#spotifyplayeractivateelement"
          target="_blank"
        >
          the documentation
        </a>
        .
      </p>
      <StateSummary
        summary="useWebPlaybackSDKReady"
        state={webPlaybackSDKReady}
      />
      <StateSummary summary="usePlaybackState" state={playbackState} />
      <StateSummary summary="usePlayerDevice" state={playerDevice} />
      <StateSummary summary="useErrorState" state={errorState} />
    </div>
  );
});
