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
          // Recharts - biblioteca pesada de gráficos (267 KB)
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

          // React y React DOM - core de React
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-vendor";
          }

          // Otros node_modules grandes
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Separar componentes de planning (tienen gráficos pesados)
          if (id.includes("/components/trainingPlans/planning/")) {
            return "planning-components";
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Aumentado temporalmente, pero optimizamos con code-splitting
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
  },
});