/**
 * lazyWithRetry.ts ? Carga diferida de rutas con recuperaci?n ante chunks obsoletos.
 * Contexto: las rutas de App.tsx se cargan con import() din?mico. Tras un despliegue en Vercel,
 * una pesta?a abierta con la versi?n anterior pide archivos con hash que ya no existen
 * (o que la PWA ya purg?) y el ErrorBoundary muestra "Error al cargar la p?gina". Este m?dulo
 * detecta ese caso concreto y recarga la p?gina una sola vez para bajar la versi?n nueva.
 * Colabora con App.tsx (lazyWithRetry), main.tsx (registerPreloadErrorRecovery) y
 * components/errors/ErrorBoundary.tsx (fallback cuando la recarga no es posible).
 * Notas de mantenimiento: no se reintenta el import() en la misma p?gina porque el navegador
 * cachea el fallo del m?dulo; la recuperaci?n fiable es recargar. La protecci?n anti-bucle usa
 * sessionStorage con una ventana de tiempo; si sessionStorage no est? disponible NO se recarga
 * (preferimos mostrar el fallback a entrar en un bucle de recargas). Solo aplica al navegador.
 * @author Frontend Team
 * @since v5.x
 */

import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const STALE_CHUNK_RELOAD_KEY = "nexia:stale-chunk-reload-at";
export const STALE_CHUNK_RELOAD_WINDOW_MS = 30_000;

const CHUNK_ERROR_PATTERNS: readonly RegExp[] = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /loading (css )?chunk [\w-]+ failed/i,
  /unable to preload css/i,
];

export interface StaleChunkReloadOptions {
  /** Marca de tiempo actual en ms. Solo se inyecta en tests. */
  now?: number;
  /** Acci?n de recarga. Por defecto window.location.reload(). Solo se inyecta en tests. */
  reload?: () => void;
  /** Cuando no se puede recargar (anti-bucle o sin storage). */
  onFallback?: (event: Event) => void;
}

/** Indica si el error corresponde a un fallo al descargar un chunk o m?dulo din?mico. */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === "ChunkLoadError") {
    return true;
  }
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));
}

/**
 * Recarga la p?gina como m?ximo una vez por ventana de tiempo.
 * Devuelve true si dispar? la recarga y false si no (ya se recarg? hace poco o no hay storage).
 */
export function reloadOnceForStaleChunk(options: StaleChunkReloadOptions = {}): boolean {
  const now = options.now ?? Date.now();
  const reload = options.reload ?? ((): void => window.location.reload());

  try {
    const raw = window.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY);
    const lastReloadAt = raw === null ? Number.NaN : Number(raw);
    if (Number.isFinite(lastReloadAt) && now - lastReloadAt < STALE_CHUNK_RELOAD_WINDOW_MS) {
      return false;
    }
    window.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(now));
  } catch {
    // Sin sessionStorage no se puede garantizar que no haya bucle: no recargar.
    return false;
  }

  reload();
  return true;
}

/**
 * Escucha el evento vite:preloadError (fallo al precargar un chunk) y recarga una vez.
 * Devuelve la funci?n que desregistra el listener.
 */
export function registerPreloadErrorRecovery(options: StaleChunkReloadOptions = {}): () => void {
  const handler = (event: Event): void => {
    if (reloadOnceForStaleChunk(options)) {
      event.preventDefault();
      return;
    }
    options.onFallback?.(event);
  };
  window.addEventListener("vite:preloadError", handler);
  return (): void => window.removeEventListener("vite:preloadError", handler);
}

/**
 * Equivalente a React.lazy que, ante un chunk obsoleto, recarga la p?gina una sola vez.
 * Si la recarga ya se hizo o no es posible, el error llega al ErrorBoundary como antes.
 * (El nombre conserva "Retry" por historial; la recuperaci?n es recarga, no re-import.)
 */
export function lazyWithRetry<T extends ComponentType>(
  factory: () => Promise<{ default: T }>,
  options: StaleChunkReloadOptions = {},
): LazyExoticComponent<T> {
  return lazy(async (): Promise<{ default: T }> => {
    try {
      return await factory();
    } catch (error) {
      if (isChunkLoadError(error) && reloadOnceForStaleChunk(options)) {
        // La p?gina se est? recargando: promesa pendiente para que Suspense mantenga su fallback.
        return new Promise<{ default: T }>(() => undefined);
      }
      throw error;
    }
  });
}
