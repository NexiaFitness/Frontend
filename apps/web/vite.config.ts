import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@nexia/ui-shared": path.resolve(__dirname, "../../packages/ui-shared/src"),
      "@ui": path.resolve(__dirname, "../../packages/ui-web/src"),
    },
  },
  css: {
    postcss: path.resolve(__dirname, "../../packages/ui-web/postcss.config.js"),
  },
});