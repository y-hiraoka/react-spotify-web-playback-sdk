"use client";

import { getSession } from "next-auth/react";
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import styles from "../../styles/player.module.css";
import { PlayerHeader } from "@/components/PlayerHeader";
import { PlayerContent } from "@/components/PlayerContent";
import { useCallback } from "react";

export const PlayerPageClient: React.FC = () => {
  const getOAuthToken: Spotify.PlayerInit["getOAuthToken"] = useCallback(
    async (callback) => {
      const session = await getSession();
      if (session == null) return;
      callback(session.access_token);
    },
    [],
  );

  return (
    <WebPlaybackSDK
      initialDeviceName="Spotify Player on Next.js"
      getOAuthToken={getOAuthToken}
      connectOnInitialized={true}
      initialVolume={0.5}
    >
      <div className={styles.root}>
        <div className={styles.header}>
          <PlayerHeader />
        </div>
        <main className={styles.player}>
          <PlayerContent />
        </main>
      </div>
    </WebPlaybackSDK>
  );
};
