/**
 * env.ts — Configuración dinámica de entorno para Nexia Fitness.
 * Permite cambiar entre backend local y producción sin editar código fuente.
 * Compatible con Web (Vite) y React Native futuro.
 * @author Nexia Team
 * @since v1.0.0
 */

// Helper para acceder a variables de entorno de forma type-safe
const getEnv = (key: string, fallback: string): string => {
  try {
    // Web environment (Vite)
    if (typeof window !== 'undefined') {
      const viteEnv = (import.meta as any).env;
      if (viteEnv && viteEnv[key]) {
        return viteEnv[key];
      }
    }
  } catch {
    // Ignore errors en build de TypeScript
  }
  
  return fallback;
};

export const API_BASE_URL = getEnv(
  'VITE_API_BASE_URL',
  'https://nexiaapp.com/api/v1'
);