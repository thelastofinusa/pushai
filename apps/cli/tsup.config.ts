import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/pai.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  dts: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  onSuccess: "chmod +x dist/pai.js",
});
