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
    // Excluir lucide-react de optimizeDeps para evitar pre-bundling con React
    // Esto previene conflictos de contexto de módulo en producción
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // PRIORIDAD 1: React y React DOM - vendor core (debe cargarse PRIMERO)
          // Verificar PRIMERO para evitar que lucide-react se incluya aquí
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            // Excluir explícitamente lucide-react del chunk de React
            if (id.includes("lucide-react")) {
              return "lucide-vendor";
            }
            return "react-vendor";
          }

          // PRIORIDAD 2: lucide-react - chunk dedicado (después de React)
          // Debe estar en su propio chunk para evitar conflictos de contexto
          if (id.includes("node_modules/lucide-react")) {
            return "lucide-vendor";
          }

          // Recharts - biblioteca pesada de gráficos (se carga bajo demanda)
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

          // Otros node_modules grandes
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 500, // Mantener el warning para detectar futuros problemas
  },
  // TypeScript reconocerá la propiedad 'test'
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
  },
});