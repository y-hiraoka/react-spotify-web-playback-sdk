function isString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("value is not string");
}

export const SPOTIFY_SCOPES = [
  // "ugc-image-upload",
  // "user-read-recently-played",
  // "user-top-read",
  // "user-read-playback-position",
  // "user-read-playback-state",
  "user-modify-playback-state",
  // "user-read-currently-playing",
  // "app-remote-control",
  "streaming",
  // "playlist-modify-public",
  // "playlist-modify-private",
  // "playlist-read-private",
  // "playlist-read-collaborative",
  // "user-follow-modify",
  // "user-follow-read",
  // "user-library-modify",
  // "user-library-read",
  "user-read-email",
  "user-read-private",
] as const;

isString(process.env.SPOTIFY_CLIENT_ID);
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

isString(process.env.SPOTIFY_CLIENT_SECRET);
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export const SPOTIFY_REDIRECT_URI =
  process.env.NODE_ENV !== "production"
    ? `http://localhost:3000/player`
    : "https://react-spotify-web-playback-sdk.vercel.app/player";

export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";

export const SPOTIFY_API_TOKEN_URL = "https://accounts.spotify.com/api/token";
