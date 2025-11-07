/**
 * env.ts — Configuración dinámica de entorno para Nexia Fitness.
 * Permite alternar automáticamente entre backend local y producción.
 * Prioriza variable de entorno VITE_API_BASE_URL (Vercel) y aplica fallback inteligente.
 * Compatible con Web (Vite) y futuras integraciones React Native.
 * @author Nexia Team
 * @since v1.1.1
 */

// Detección automática del entorno
const isProduction =
  typeof window !== 'undefined'
    ? !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1')
    : (import.meta as any).env?.MODE === 'production';

// URL por defecto según entorno
const getDefaultApiUrl = (): string =>
  isProduction
    ? 'https://api.nexiaapp.com/api/v1' // producción (backend real)
    : 'http://127.0.0.1:8000/api/v1'; // desarrollo local

// URL final de API — acceso estático para que Vite lo reemplace correctamente en build
export const API_BASE_URL: string =
  (import.meta as any).env.VITE_API_BASE_URL || getDefaultApiUrl();
