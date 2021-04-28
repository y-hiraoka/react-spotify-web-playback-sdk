<p align="center"><img src="react-spotify-web-playback-sdk-logo.png"></p>

# react-spotify-web-playback-sdk

[English](README.md)

[Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/)の React ラッパーライブラリです。

このライブラリを使用することで、 Spotify プレイヤーを宣言的に扱うことが可能になります。

## Why?

Spotify Web Playback SDK は npm レジストリに公開されておらず、 CDN からダウンロードすることになります。ですので使用する際は script タグを追加する必要があります。それはあまりうれしくないでしょう。このラッパーライブラリを使用すれば、 html の head に script タグを挿入する必要はありません。

素の SDK は宣言的な API を備えていません。それゆえに、 React アプリで使用するときおそらく苦戦するでしょう。このライブラリを使用すれば、使い慣れたカスタムフックを用いて SDK が提供するデータを処理することができます。

## Getting Started

### インストール

```
npm install react-spotify-web-playback-sdk
```

### `WebPlaybackSDK`

最新の OAuth トークンが用意されていることを仮定します。トークンに必要なスコープは `"streaming"`, `"user-read-email"`, `"user-read-private"` です。 [こちらのページ](https://developer.spotify.com/documentation/web-playback-sdk/quick-start)でもアクセストークンを取得することが可能です。

`WebPlaybackSDK` コンポーネントはこのライブラリのルートコンポーネントです。このライブラリのすべてのカスタムフックは `WebPlaybackSDK` でラップされている必要があります。

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

`props.deviceName` は デバイス名として Spotify の公式アプリに表示される値です。

`props.getOAuthToken` にはアクセストークンを受け取る `callback` 関数を引数に取る関数を渡します。

`props.volume` は 0 から 1 の間の値を渡します。指定されない場合、初期値 1 が設定されます。

### `useSpotifyPlayer`

Spotify プレイヤーのインスタンスを取得します。インスタンスメソッドを呼び出すことで音楽の再生や一時停止を実行することができます。

```tsx
import { useSpotifyPlayer } from "react-spotify-web-playback-sdk";

const TogglePlay: React.VFC = () => {
  const player = useSpotifyPlayer();

  if (player === null) return null;

  return <button onClick={() => player.togglePlay()}>toggle play</button>;
};
```

SDK のセットアップが完了していない間は null が返されるため、null チェックを行います。
ボタンをクリックすると、 `player.togglePlay()` メソッドが実行されます。

### `usePlaybackState`

再生に関する状態を取得します。例えばポーズしているかどうかや再生位置などがプロパティとして含まれます。

```tsx
import { usePlaybackState } from "react-spotify-web-playback-sdk";

const SongTitle: React.VFC = () => {
  const playbackState = usePlaybackState();

  if (playbackState === null) return null;

  return <p>Current song: {playbackState.track_window.current_track.name}</p>;
};
```

Spotify との接続が確立されていない場合は null になるため、 null チェックを行います。

### 再生してみる

`MySpotifyPlayer` を React アプリでレンダリングすると、Spotify モバイルアプリの Spotify Connect に `My awesome Spotify app` が表示されるでしょう。そこで選択した上で、 `toggle play` ボタンをクリックすれば再生が開始されます。

## API

### `WebPlaybackSDK`

SDK をラップした React コンポーネントです。これは React-Naitive の環境では利用できません。

ライブラリに含まれるカスタムフックは、このコンポーネントの内側にないと動作しません。

#### `props`

| prop name                        | type                                        | default value | description                                                                                                                                                          |
| :------------------------------- | :------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deviceName`                     | string                                      | (required)    | Spotify Connect プレイヤーの名前。                                                                                                                                   |
| `getOAuthToken`                  | (callback: (token: string) => void) => void | (required)    | `player.connect()` を呼び出すとき、またはユーザーのアクセストークンの有効期限が切れたときに呼び出される関数。 `useCallback` によって**参照同一性を保証すべき**です。 |
| `volume`                         | number                                      | 1             | ボリューム。0 から 1 の小数を指定します。                                                                                                                            |
| `connectOnInitialized`           | boolean                                     | true          | 初期化と同時に接続をするか。                                                                                                                                         |
| `playbackStateAutoUpdate`        | boolean                                     | true          | `playbackState` を自動で更新するか。                                                                                                                                 |
| `playbackStateUpdateDuration_ms` | number                                      | 1000          | `playbackState` を自動更新する間隔。ミリ秒を指定します。 `playbackStateAutoUpdate` が `false` の場合は無視されます。                                                 |

#### 使用例

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
      connectOnInitialized={true}
      playbackStateAutoUpdate={true}
      playbackStateUpdateDuration_ms={500}>
      <SomeComponentsUsingCustomHook />
    </WebPlaybackSDK>
  );
};
```

### `useWebPlaybackSDKReady`

SDK がダウンロードされて準備が完了したかどうかの真偽値を返すカスタムフックです。

#### 型定義

```ts
function useWebPlaybackSDKReady(): boolean;
```

#### 使用例

```tsx
const MyPlayer = () => {
  const webPlaybackSDKReady = useWebPlaybackSDKReady();

  if (!webPlaybackSDKReady) return <div>Loading...</div>;

  return <div>Spotify App is ready!</div>;
};
```

### `useSpotifyPlayer`

Spotify.Player クラスのインスタンスを返すカスタムフックです。 Spotify.Player クラスが持つメソッドについては [Spotify for Developers のリファレンス](https://developer.spotify.com/documentation/web-playback-sdk/reference/#api-reference) を参照してください。

#### 型定義

```ts
function useSpotifyPlayer(): Spotify.Player | null;
```

#### 使用例

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

プレイヤーの再生状態を表すオブジェクトを取得するカスタムフックです。 オブジェクトが持つプロパティの詳細は[Spotify for Developers のリファレンス](https://developer.spotify.com/documentation/web-playback-sdk/reference/#objects) を参照してください。

#### 型定義

```ts
function usePlaybackState(): Spotify.PlaybackState | null;
```

#### 使用例

```tsx
const SongTitle: React.VFC = () => {
  const playbackState = usePlaybackState();

  if (playbackState === null) return null;

  return <p>Current song: {playbackState.track_window.current_track.name}</p>;
};
```

### `usePlayerDevice`

プレイヤーデバイスの状態を表すオブジェクトを取得するカスタムフックです。 [Spotify for Developers リファレンス](https://developer.spotify.com/documentation/web-playback-sdk/reference/#event-not-ready)に拠れば、インターネット接続がない場合 `"not_ready"` になります。

`device_id` は, 例えば Spotify Web API の再生 API ([参考](https://developer.spotify.com/documentation/web-api/reference/#endpoint-start-a-users-playback))のパラメーターに渡す値として使用できます。

#### 型定義

```ts
type PlayerDevice = {
  device_id: string;
  status: "ready" | "not_ready";
};

function usePlayerDevice(): PlayerDevice | null;
```

#### 使用例

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

エラーが発生した場合に message を含むオブジェクトが返されます。それ以外は null が返されます。

#### 型定義

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

#### 使用例

```tsx
const ErrorState = () => {
  const errorState = useErrorState();

  if (errorState === null) return null;

  return <p>Error: {errorState.message}</p>;
};
```

## LICENSE

MIT
