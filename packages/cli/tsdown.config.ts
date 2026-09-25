import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  minify: true,
  dts: false,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env bun",
  },
  deps: {
    neverBundle: [
      "@pushai/core",
      "@pushai/types",
      "@pushai/utils",
      "@inquirer/prompts",
      "chalk",
      "commander",
      "ollama",
      "ora",
    ],
  },
});
