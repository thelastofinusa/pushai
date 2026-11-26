import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  minify: true,
  dts: false,
  sourcemap: true,
  banner: { js: "#!/usr/bin/env bun" },
  deps: {
    // Only external npm packages now — no @pushai/* to exclude
    neverBundle: [
      "@inquirer/prompts",
      "@napi-rs/keyring",
      "chalk",
      "commander",
      "ollama",
      "ora",
      "simple-git",
    ],
  },
  alias: {
    "@/core": "./src/core",
    "@/types": "./src/types",
    "@/utils": "./src/utils",
  },
});
