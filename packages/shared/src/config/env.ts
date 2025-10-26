/**
 * env.ts — Configuración dinámica de entorno para Nexia Fitness.
 * Permite cambiar entre backend local y producción sin editar código fuente.
 * @author Nexia Team
 * @since v1.0.0
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://nexiaapp.com/api/v1';
