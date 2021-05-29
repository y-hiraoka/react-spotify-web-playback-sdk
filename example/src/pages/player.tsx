import { useCallback, useState } from "react";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import {
  SPOTIFY_API_TOKEN_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
} from "../common/constant";
import styles from "../styles/player.module.css";
import { PlayerHeader } from "../components/PlayerHeader";
import { PlayerContent } from "../components/PlayerContent";

type Props = { token: TokenObject };

const Player: React.VFC<Props> = ({ token }) => {
  const getOAuthToken: Spotify.PlayerInit["getOAuthToken"] = useCallback(
    callback => callback(token.access_token),
    [token.access_token],
  );

  const [deviceName, setDeviceName] = useState("Spotify Player on Next.js");

  return (
    <WebPlaybackSDK
      deviceName={deviceName}
      getOAuthToken={getOAuthToken}
      connectOnInitialized={true}
      volume={0.5}>
      <div className={styles.root}>
        <div className={styles.header}>
          <PlayerHeader deviceName={deviceName} deviceNameOnChange={setDeviceName} />
        </div>
        <main className={styles.player}>
          <PlayerContent access_token={token.access_token} />
        </main>
      </div>
    </WebPlaybackSDK>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
  req,
}) => {
  const stateFromCookies = nookies.get({ req }).state;
  const stateFromRequest = query.state;

  if (
    typeof stateFromCookies === "string" &&
    typeof stateFromRequest === "string" &&
    stateFromCookies === stateFromRequest &&
    typeof query.code === "string"
  ) {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: query.code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    });

    const response = await fetch(SPOTIFY_API_TOKEN_URL, {
      method: "POST",
      body: params,
    }).then(res => res.json());

    if (isTokenObject(response)) {
      return {
        props: { token: response },
      };
    }
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};

export default Player;

type TokenObject = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

function isTokenObject(value: any): value is TokenObject {
  return (
    value != undefined &&
    typeof value.access_token === "string" &&
    typeof value.token_type === "string" &&
    typeof value.scope === "string" &&
    typeof value.expires_in === "number" &&
    typeof value.refresh_token === "string"
  );
}
