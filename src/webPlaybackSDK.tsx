import React, { useEffect } from "react";
import { SPOTIFY_WEB_PLAYBACK_SDK_URL } from "./constant";
import { DeviceProvider } from "./device";
import { ErrorStateProvider } from "./errorState";
import { PlaybackStateProvider } from "./playbackState";
import { SpotifyPlayerProvider } from "./spotifyPlayer";
import { WebPlaybackSDKReadyProvider } from "./webPlaybackSDKReady";

export type WebPlaybackSDKProps = {
  deviceName: Spotify.PlayerInit["name"];
  getOAuthToken: Spotify.PlayerInit["getOAuthToken"];
  volume?: Spotify.PlayerInit["volume"];
  connectOnInitialized?: boolean;
  playbackStateAutoUpdate?: boolean;
  playbackStateUpdateDuration_ms?: number;
};

export const WebPlaybackSDK: React.FC<WebPlaybackSDKProps> = ({
  children,
  deviceName,
  getOAuthToken,
  volume,
  connectOnInitialized = true,
  playbackStateAutoUpdate = true,
  playbackStateUpdateDuration_ms = 1000,
}) => {
  useEffect(() => {
    // load Web Playback SDK.
    const script = document.createElement("script");
    script.src = SPOTIFY_WEB_PLAYBACK_SDK_URL;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <WebPlaybackSDKReadyProvider>
      <SpotifyPlayerProvider
        deviceName={deviceName}
        getOAuthToken={getOAuthToken}
        volume={volume}
        connectOnInitialized={connectOnInitialized}>
        <PlaybackStateProvider
          playbackStateAutoUpdate={playbackStateAutoUpdate}
          playbackStateUpdateDuration_ms={playbackStateUpdateDuration_ms}>
          <DeviceProvider>
            <ErrorStateProvider>{children}</ErrorStateProvider>
          </DeviceProvider>
        </PlaybackStateProvider>
      </SpotifyPlayerProvider>
    </WebPlaybackSDKReadyProvider>
  );
};
