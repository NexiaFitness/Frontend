/**
 * pwaSessionRunRoute.ts — Detección de la ruta de ejecución guiada del atleta.
 * Contexto: el banner de actualización PWA no debe interrumpir el modo guiado.
 * @author Frontend Team
 * @since v5.x
 */

/** Coincide con App.tsx `path="sessions/:id/run"` bajo `/dashboard`. */
export function isAthleteSessionRunPath(pathname: string): boolean {
  return /^\/dashboard\/sessions\/\d+\/run\/?$/.test(pathname);
}
