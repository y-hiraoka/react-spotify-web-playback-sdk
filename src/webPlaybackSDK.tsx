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
};

export const WebPlaybackSDK: React.FC<WebPlaybackSDKProps> = ({
  children,
  deviceName,
  getOAuthToken,
  volume,
  connectOnInitialized = true,
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
        <PlaybackStateProvider>
          <DeviceProvider>
            <ErrorStateProvider>{children}</ErrorStateProvider>
          </DeviceProvider>
        </PlaybackStateProvider>
      </SpotifyPlayerProvider>
    </WebPlaybackSDKReadyProvider>
  );
};
