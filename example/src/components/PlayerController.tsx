import { memo } from "react";
import { useSpotifyPlayer } from "react-spotify-web-playback-sdk";
import styles from "./PlayerController.module.css";
import { signOut } from "next-auth/react";

export const PlayerController: React.FC = memo(() => {
  const player = useSpotifyPlayer();

  if (player === null) return null;

  return (
    <div className={styles.root}>
      <div className={styles.buttons}>
        <button
          className={styles.action}
          onClick={() => player.previousTrack()}
        >
          <code>player.previousTrack</code>
        </button>
        <button className={styles.action} onClick={() => player.togglePlay()}>
          <code>player.togglePlay</code>
        </button>
        <button className={styles.action} onClick={() => player.nextTrack()}>
          <code>player.nextTrack</code>
        </button>
        <button className={styles.action} onClick={() => player.pause()}>
          <code>player.pause</code>
        </button>
        <button className={styles.action} onClick={() => player.resume()}>
          <code>player.resume</code>
        </button>
        <button
          className={styles.action}
          onClick={() => player.activateElement()}
        >
          <code>player.activateElement</code>
        </button>
        <button className={styles.action} onClick={() => player.connect()}>
          <code>player.connect</code>
        </button>
        <button className={styles.action} onClick={() => player.disconnect()}>
          <code>player.disconnect</code>
        </button>
        <button className={styles.action} onClick={() => signOut()}>
          <code>sign out</code>
        </button>
      </div>
    </div>
  );
});
