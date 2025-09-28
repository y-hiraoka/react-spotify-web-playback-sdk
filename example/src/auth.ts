import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";
import { env } from "./env";
import { JWT } from "next-auth/jwt";

const SpotifyAuthorizeURL = new URL("https://accounts.spotify.com/authorize");
SpotifyAuthorizeURL.searchParams.append(
  "scope",
  [
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
  ].join(" "),
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.AUTH_SECRET,
  providers: [
    Spotify({
      clientId: env.AUTH_SPOTIFY_CLIENT_ID,
      clientSecret: env.AUTH_SPOTIFY_CLIENT_SECRET,
      authorization: SpotifyAuthorizeURL.toString(),
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    authorized: ({ auth }) => {
      return !!auth;
    },
    jwt: async ({ token, account }) => {
      if (account) {
        if (account.access_token == null || account.expires_at == null) {
          return null;
        }

        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        } satisfies JWT;
      } else if (Date.now() < token.expires_at * 1000) {
        return token;
      } else {
        if (!token.refresh_token) {
          throw new TypeError("Missing refresh_token");
        }

        try {
          const response = await fetch(
            "https://accounts.spotify.com/api/token",
            {
              method: "POST",
              body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: env.AUTH_SPOTIFY_CLIENT_ID,
                client_secret: env.AUTH_SPOTIFY_CLIENT_SECRET,
                refresh_token: token.refresh_token,
              }),
            },
          );

          const tokenOrError = await response.json();

          if (!response.ok) {
            throw tokenOrError;
          }

          const newTokens = tokenOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    session: async ({ session, token }) => {
      session.error = token.error;
      session.access_token = token.access_token;
      session.expires_at = token.expires_at;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    error?: "RefreshTokenError";
    access_token: string;
    expires_at: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    error?: "RefreshTokenError";
  }
}
