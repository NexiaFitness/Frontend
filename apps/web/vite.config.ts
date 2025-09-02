import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../../packages/shared"),
      "@ui": path.resolve(__dirname, "../../packages/ui-web"),
    },
  },
  css: {
    postcss: path.resolve(__dirname, "../../packages/ui-web/postcss.config.js"),
  },
});
