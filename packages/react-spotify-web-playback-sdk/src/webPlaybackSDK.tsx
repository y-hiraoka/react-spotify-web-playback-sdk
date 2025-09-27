import React, { useEffect } from "react";
import { SPOTIFY_WEB_PLAYBACK_SDK_URL } from "./constant";
import { DeviceProvider } from "./device";
import { ErrorStateProvider } from "./errorState";
import { PlaybackStateProvider } from "./playbackState";
import { SpotifyPlayerProvider } from "./spotifyPlayer";
import { WebPlaybackSDKReadyProvider } from "./webPlaybackSDKReady";

export type WebPlaybackSDKProps = {
  initialDeviceName: Spotify.PlayerInit["name"];
  getOAuthToken: Spotify.PlayerInit["getOAuthToken"];
  initialVolume?: Spotify.PlayerInit["volume"];
  connectOnInitialized?: boolean;
  children?: React.ReactNode;
};

export const WebPlaybackSDK: React.FC<WebPlaybackSDKProps> = ({
  children,
  initialDeviceName,
  getOAuthToken,
  initialVolume,
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
        initialDeviceName={initialDeviceName}
        getOAuthToken={getOAuthToken}
        initialVolume={initialVolume}
        connectOnInitialized={connectOnInitialized}
      >
        <PlaybackStateProvider>
          <DeviceProvider>
            <ErrorStateProvider>{children}</ErrorStateProvider>
          </DeviceProvider>
        </PlaybackStateProvider>
      </SpotifyPlayerProvider>
    </WebPlaybackSDKReadyProvider>
  );
};
