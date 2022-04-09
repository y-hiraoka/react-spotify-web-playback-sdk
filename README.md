<p align="center"><img src="react-spotify-web-playback-sdk-logo.png"></p>

# react-spotify-web-playback-sdk

[日本語](README-ja.md)

This is a React wrapper for [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/).

By using this library, you can use declaratively handle the Spotify player.

## Why?

Spotify Web Playback SDK will be not published in npm registory and downloaded from CDN.
So when you use it, you must add a script tag. But it's not desirable.
If you use this wrapper library, you don't have to add script tag to head of html.

The plain SDK does not have a declarative API. So, when you use it in your React app, you will probably find it hard to do. Using this library, you can handle the data provided by the SDK with custom hooks that you are used to.

## Getting Started

### Install

```
npm install react-spotify-web-playback-sdk
```

### `WebPlaybackSDK`

Assume that you have the latest oauth token. Required scopes that the token have are `"streaming"`, `"user-read-email"` and `"user-read-private"`. You can also get an access token [here](https://developer.spotify.com/documentation/web-playback-sdk/quick-start).

`WebPlaybackSDK` component is a root of this library. So you must wrap any custom-hooks in this library with it.

```tsx
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk";

const AUTH_TOKEN = "your token here!";

const MySpotifyPlayer: React.VFC = () => {
  const getOAuthToken = useCallback(callback => callback(AUTH_TOKEN), []);

  return (
    <WebPlaybackSDK
      deviceName="My awesome Spotify app"
      getOAuthToken={getOAuthToken}
      volume={0.5}>
      {/* `TogglePlay` and `SongTitle` will be defined later. */}
      <TogglePlay />
      <SongTitle />
    </WebPlaybackSDK>
  );
};
```

`props.deviceName` is a value that will be displayed in the official Spotify app as the device name.

`props.getOAuthToken` is a function that takes a `callback` function as an argument to receive the access token.

`props.volume` is a value between 0 and 1. If not specified, it will be set to the default value of 1.

The `props.volume` can be a value between 0 and 1. If not specified, `1` will be set as the default value.

### `useSpotifyPlayer`

Gets the playback status. For example, there are properties such as whether it is paused or not, and the playback position.

```tsx
import { usePlaybackState } from "react-spotify-web-playback-sdk";

const SongTitle: React.VFC = () => {
  const playbackState = usePlaybackState();

  if (playbackState === null) return null;

  return <p>Current song: {playbackState.track_window.current_track.name}</p>;
};
```

If the connection with Spotify has not been established, it will be null, so perform a null check.

### Try to play

When you render `MySpotifyPlayer` in your React app, you will see `My awesome Spotify app` in Spotify Connect in your Spotify mobile app. Select it there and click the `toggle play` button to start playing.

## API

### `WebPlaybackSDK`

This is a React component that wraps the SDK. This is not available in the React-Naitive environment.

The custom hooks included in the library will not work unless they are inside this component.

#### `props`

| prop name              | type                                        | default value | description                                                                                   |
| :--------------------- | :------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------- |
| `initialDeviceName`    | string                                      | (required)    | an initial value of Spotify Connect player name.                                              |
| `getOAuthToken`        | (callback: (token: string) => void) => void | (required)    | a function called when `player.connect()` is called, or when the user's access token expires. |
| `initialVolume`        | number                                      | 1             | a initial value of volume. specified as a decimal number between 0 and 1.                     |
| `connectOnInitialized` | boolean                                     | true          | Whether to make a connection at the same time as initialization.                              |

#### usage

```tsx
const MyPlayer = () => {
  const getOAuthToken = useCallback(callback => {
    const token = fetchNewSpotifyToken();
    callback(token);
  }, []);

  return (
    <WebPlaybackSDK
      deviceName="My Spotify App"
      getOAuthToken={getOAuthToken}
      volume={0.5}
      connectOnInitialized={true}>
      <SomeComponentsUsingCustomHook />
    </WebPlaybackSDK>
  );
};
```

### `useWebPlaybackSDKReady`

A custom hook that returns a boolean value whether the SDK has been downloaded and is ready or not.

#### type definition

```ts
function useWebPlaybackSDKReady(): boolean;
```

#### usage

```tsx
const MyPlayer = () => {
  const webPlaybackSDKReady = useWebPlaybackSDKReady();

  if (!webPlaybackSDKReady) return <div>Loading...</div>;

  return <div>Spotify App is ready!</div>;
};
```

### `useSpotifyPlayer`

A custom hook that returns an object with functions to manipulate the player, such as `resume()` or `seek(pos)`.

#### type definition

```ts
function useSpotifyPlayer(): Spotify.Player | null;
```

#### usage

```tsx
const PauseResumeButton = () => {
  const player = useSpotifyPlayer();

  if (player === null) return null;

  return (
    <div>
      <button onClick={() => player.pause()}>pause</button>
      <button onClick={() => player.resume()}>resume</button>
    </div>
  );
};
```

### `usePlaybackState`

A custom hook to get an object representing the player's playback state. See [the Spotify for Developers reference](https://developer.spotify.com/documentation/web-playback-sdk/reference/#objects) for more information on the properties that the object has.

If `interval` is `true`, state updates will occur during playback at the interval specified by `durationMS`. Even if it is `false`, state updates by `SpotifyPlayer.pause` and `SpotifyPlayer.resume` will occur.

#### type definition

```ts
function usePlaybackState(
  interval?: boolean = false,
  durationMS?: number = 1000,
): Spotify.PlaybackState | null;
```

#### usage

```tsx
const SongTitle: React.VFC = () => {
  const playbackState = usePlaybackState();

  if (playbackState === null) return null;

  return <p>Current song: {playbackState.track_window.current_track.name}</p>;
};
```

### `usePlayerDevice`

A custom hook that retrieves an object that represents the state of the player device. According to [the Spotify for Developers reference](https://developer.spotify.com/documentation/web-playback-sdk/reference/#event-not-ready), it will be `"not_ready"` when there is no internet connection.

The `device_id` can be used as a parameter to, for example, the Spotify Web API's playback API ([for reference](https://developer.spotify.com/documentation/web-api/reference/#endpoint-start-a-users-playback)).

#### type definition

```ts
type PlayerDevice = {
  device_id: string;
  status: "ready" | "not_ready";
};

function usePlayerDevice(): PlayerDevice | null;
```

#### ussage

```tsx
const SPOTIFY_URI = "spotify:track:7xGfFoTpQ2E7fRF5lN10tr";

const PlayCarlyRaeJepsen = () => {
  const device = usePlayerDevice();

  const playCarlyRaeJepsen = () => {
    if (device === null) return;

    fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
      {
        method: "PUT",
        body: JSON.stringify({ uris: [SPOTIFY_URI] }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      },
    );
  };

  if (device === null) return null;

  return <button onClick={playCarlyRaeJepsen}>Play Carly Rae Jepsen</button>;
};
```

### `useErrorState`

If an error occurs, an object containing the message will be returned. Otherwise, null is returned.

#### type definition

```ts
type ErrorState = {
  message: string;
  type:
    | "account_error"
    | "authentication_error"
    | "initialization_error"
    | "playback_error";
};

function useErrorState(): ErrorState | null;
```

#### usage

```tsx
const ErrorState = () => {
  const errorState = useErrorState();

  if (errorState === null) return null;

  return <p>Error: {errorState.message}</p>;
};
```

## LICENSE

MIT

## Demo app

A minimal demo app:

https://react-spotify-web-playback-sdk.vercel.app/

A complete demo app:

https://github.com/y-hiraoka/next-spotify-app
