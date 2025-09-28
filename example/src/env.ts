import * as v from "valibot";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    AUTH_SPOTIFY_CLIENT_ID: v.string(),
    AUTH_SPOTIFY_CLIENT_SECRET: v.string(),
    AUTH_SECRET: v.string(),
  },
  runtimeEnv: {
    AUTH_SPOTIFY_CLIENT_ID: process.env.AUTH_SPOTIFY_CLIENT_ID,
    AUTH_SPOTIFY_CLIENT_SECRET: process.env.AUTH_SPOTIFY_CLIENT_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
});
