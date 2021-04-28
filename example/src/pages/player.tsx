import { useCallback, useState } from "react";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import {
  WebPlaybackSDK,
  usePlaybackState,
  useSpotifyPlayer,
  usePlayerDevice,
  useErrorState,
  useWebPlaybackSDKReady,
} from "react-spotify-web-playback-sdk";
import {
  SPOTIFY_API_TOKEN_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI,
} from "../common/constant";

type Props = { token: TokenObject };

const Player: React.VFC<Props> = ({ token }) => {
  const getOAuthToken: Spotify.PlayerInit["getOAuthToken"] = useCallback(
    callback => callback(token.access_token),
    [token.access_token],
  );

  const [deviceName, setDeviceName] = useState("Spotify Player on Next.js");

  return (
    <div>
      <input value={deviceName} onChange={e => setDeviceName(e.target.value)} />
      <WebPlaybackSDK
        deviceName={deviceName}
        getOAuthToken={getOAuthToken}
        connectOnInitialized={true}
        playbackStateAutoUpdate
        volume={0.5}>
        <PlayerButton />
        <StateViewer />
      </WebPlaybackSDK>
    </div>
  );
};

const PlayerButton: React.VFC = () => {
  const player = useSpotifyPlayer();

  if (player === null) return null;

  return (
    <div>
      <div>
        <button onClick={() => player.previousTrack()}>player.previousTrack</button>
        <button onClick={() => player.togglePlay()}>player.togglePlay</button>
        <button onClick={() => player.nextTrack()}>player.nextTrack</button>
        <button onClick={() => player.pause()}>player.pause</button>
        <button onClick={() => player.resume()}>player.resume</button>
      </div>
      <div>
        <button onClick={() => player.connect()}>player.connect</button>
        <button onClick={() => player.disconnect()}>player.disconnect</button>
      </div>
    </div>
  );
};

const StateViewer: React.VFC = () => {
  const [show, setShow] = useState({
    playbackState: true,
    playerDevice: true,
    errorState: true,
    webPlaybackSDKReady: true,
  });

  const onChecked = (key: keyof typeof show) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setShow(prevState => ({
      ...prevState,
      [key]: e.target.checked,
    }));
  };

  const playbackState = usePlaybackState();
  const playerDevice = usePlayerDevice();
  const errorState = useErrorState();
  const webPlaybackSDKReady = useWebPlaybackSDKReady();

  return (
    <div>
      <div>
        <label>
          webPlaybackSDKReady
          <input
            type="checkbox"
            checked={show.webPlaybackSDKReady}
            onChange={onChecked("webPlaybackSDKReady")}
          />
        </label>
        <label>
          playbackState
          <input
            type="checkbox"
            checked={show.playbackState}
            onChange={onChecked("playbackState")}
          />
        </label>
        <label>
          playerDevice
          <input
            type="checkbox"
            checked={show.playerDevice}
            onChange={onChecked("playerDevice")}
          />
        </label>
        <label>
          errorState
          <input
            type="checkbox"
            checked={show.errorState}
            onChange={onChecked("errorState")}
          />
        </label>
      </div>
      {show.webPlaybackSDKReady && (
        <div>
          <h2>
            <code>webPlaybackSDKReady</code>
          </h2>
          <div>
            <pre>{JSON.stringify(webPlaybackSDKReady, null, 2)}</pre>
          </div>
        </div>
      )}
      {show.playbackState && (
        <div>
          <h2>
            <code>playbackState</code>
          </h2>
          <div>
            <pre>{JSON.stringify(playbackState, null, 2)}</pre>
          </div>
        </div>
      )}
      {show.playerDevice && (
        <div>
          <h2>
            <code>playerDevice</code>
          </h2>
          <div>
            <pre>{JSON.stringify(playerDevice, null, 2)}</pre>
          </div>
        </div>
      )}
      {show.errorState && (
        <div>
          <h2>
            <code>errorState</code>
          </h2>
          <div>
            <pre>{JSON.stringify(errorState, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

type Params = {};

export const getServerSideProps: GetServerSideProps<Props, Params> = async ({
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
