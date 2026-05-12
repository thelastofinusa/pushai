import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/pAi.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  dts: false,
  minify: true,
  splitting: false,
  sourcemap: true,
  onSuccess: "chmod +x dist/pAi.js 2>/dev/null || true",
});
