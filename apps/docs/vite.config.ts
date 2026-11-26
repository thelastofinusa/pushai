import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { vocs } from "vocs/vite";

export default defineConfig({
  plugins: [react(), vocs()],
  resolve: {
    // This forces Vite to use a single copy of React and React DOM,
    // fixing the duplicate React problem that breaks hydration in monorepos.
    dedupe: ["react", "react-dom"],
  },
});
