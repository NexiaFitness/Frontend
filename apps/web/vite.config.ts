/**
 * Vite Configuration - Setup para desarrollo y testing
 * 
 * Configuración combinada para Vite + Vitest que incluye aliases,
 * optimizaciones y setup de testing environment.
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@nexia/shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`,
        
        manualChunks: (id) => {
          // ELIMINADO: React y React DOM - dejar que Vite lo maneje automáticamente
          // La separación manual causaba errores de inicialización
          
          // Recharts - biblioteca pesada de gráficos
          if (id.includes("node_modules/recharts")) {
            return "recharts-vendor";
          }

          // Redux Toolkit y React-Redux - state management
          if (id.includes("node_modules/@reduxjs/toolkit") || id.includes("node_modules/react-redux")) {
            return "redux-vendor";
          }

          // React Router - routing
          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }

          // Otros node_modules grandes (incluirá React automáticamente)
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
  },
});