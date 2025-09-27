import { defineConfig } from "tsup";

export default defineConfig([
  {
    format: ["esm", "cjs"],
    entry: ["src/index.ts"],
    bundle: true,
    minify: false,
    dts: true,
    sourcemap: true,
  },
]);
