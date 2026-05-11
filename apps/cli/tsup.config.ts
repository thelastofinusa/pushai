import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  dts: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  onSuccess: "chmod +x dist/index.js",
});
