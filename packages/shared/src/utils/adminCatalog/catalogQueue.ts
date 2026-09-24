/**
 * catalogQueue.ts — Cola de PK para «Revisado y siguiente» (listado → ficha).
 *
 * Persistencia en sessionStorage para sobrevivir navegación entre fichas.
 * El listado admin (bloque 2) escribirá la cola al abrir una ficha.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

const QUEUE_STORAGE_KEY = "nexia.adminCatalog.queueIds";

function canUseSessionStorage(): boolean {
    return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function setAdminCatalogQueue(ids: number[]): void {
    if (!canUseSessionStorage()) return;
    try {
        window.sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // silenciar cuota / modo privado
    }
}

export function getAdminCatalogQueue(): number[] {
    if (!canUseSessionStorage()) return [];
    try {
        const raw = window.sessionStorage.getItem(QUEUE_STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
    } catch {
        return [];
    }
}

export function clearAdminCatalogQueue(): void {
    if (!canUseSessionStorage()) return;
    try {
        window.sessionStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch {
        // silenciar
    }
}

/** Siguiente PK en la cola tras `currentPk`, o null si no hay más. */
export function getNextCatalogQueuePk(currentPk: number): number | null {
    const queue = getAdminCatalogQueue();
    const idx = queue.indexOf(currentPk);
    if (idx < 0) return null;
    const next = queue[idx + 1];
    return typeof next === "number" ? next : null;
}
