/**
 * env.ts — Configuración dinámica de entorno para Nexia Fitness.
 * Permite alternar automáticamente entre backend local y producción.
 * Prioriza variable de entorno VITE_API_BASE_URL (Vercel) y aplica fallback inteligente.
 * Compatible con Web (Vite) y futuras integraciones React Native.
 * @author Nexia Team
 * @since v1.1.0
 */

// Helper para obtener variables de entorno de forma segura
const getEnv = (key: string): string | undefined => {
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[key]) return viteEnv[key];
  } catch {
    // Ignorar errores durante compilación
  }
  return undefined;
};

// Detección automática del entorno
const isProduction =
  typeof window !== 'undefined'
    ? !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    : (import.meta as any).env?.MODE === 'production';

// URL por defecto según entorno
const getDefaultApiUrl = (): string =>
  isProduction
    ? 'https://nexiaapp.com/api/v1' // producción
    : 'http://127.0.0.1:8000/api/v1'; // desarrollo

// URL final de API — usa variable de entorno si existe, o fallback inteligente
export const API_BASE_URL: string =
  getEnv('VITE_API_BASE_URL') || getDefaultApiUrl();

