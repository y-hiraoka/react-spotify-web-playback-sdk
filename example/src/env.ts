import * as v from "valibot";

const EnvSchema = v.object({
  AUTH_SPOTIFY_CLIENT_ID: v.string(),
  AUTH_SPOTIFY_CLIENT_SECRET: v.string(),
  AUTH_SECRET: v.string(),
});

export const env = v.parse(EnvSchema, {
  AUTH_SPOTIFY_CLIENT_ID: process.env.AUTH_SPOTIFY_CLIENT_ID,
  AUTH_SPOTIFY_CLIENT_SECRET: process.env.AUTH_SPOTIFY_CLIENT_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
} satisfies Record<keyof typeof EnvSchema.entries, unknown>);
