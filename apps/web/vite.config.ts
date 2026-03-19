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
          // Separada porque solo se usa en páginas específicas (charts)
          if (id.includes("node_modules/recharts")) {
            return "recharts-vendor";
          }

          // Redux Toolkit y React-Redux - state management
          // Separado pero cargado early porque lo usa toda la app
          if (id.includes("node_modules/@reduxjs/toolkit") || id.includes("node_modules/react-redux")) {
            return "redux-vendor";
          }

          // React Router - routing
          // Separado pero cargado early porque lo usa toda la app
          if (id.includes("node_modules/react-router")) {
            return "router-vendor";
          }

          // React y React DOM - CRÍTICO: NO separar
          // Debe estar en el mismo chunk vendor que otras dependencias
          // para evitar condiciones de carrera en inicialización
          // React ahora va al chunk "vendor" principal

          // Otros node_modules (INCLUYENDO React)
          // React DEBE estar aquí para estar disponible cuando vendor.js lo necesite
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
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
  },
});