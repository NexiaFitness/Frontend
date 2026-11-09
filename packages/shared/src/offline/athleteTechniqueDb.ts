/**
 * athleteTechniqueDb.ts — Texto de «Ver técnica» guardado para leerlo sin red (H8-A).
 *
 * Contexto: SPEC_H8 §8 (ajuste del 2026-11-09). Base IndexedDB propia,
 * `nexia-athlete-technique`, separada de `nexia-athlete-offline` (copia de la sesión y
 * cola de series): así la base del run no cambia de versión y una vuelta atrás del
 * código no la deja sin abrir. La clave es atleta + sesión; el texto se busca por
 * `exercise_id`, nunca por posición.
 * Notas de mantenimiento: ninguna función lanza. Un fallo de IndexedDB (no disponible,
 * cuota, base bloqueada) se trata como caché ausente: el texto es secundario y nunca
 * debe afectar al registro ni a la sincronización de series. Sin dependencia del
 * módulo de la base del run, para no crear un ciclo de imports.
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import type {
    AthleteExerciseContentItemOut,
    ExerciseContentOut,
} from "../types/exerciseContent";

const DB_NAME = "nexia-athlete-technique";
const DB_VERSION = 1;
const STORE = "sessionTechnique";
const INDEX_SESSION = "sessionId";

/** Igual que la copia de la sesión (SNAPSHOT_TTL_MS de athleteSessionSync). */
export const TECHNIQUE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface AthleteTechniqueCacheEntry {
    key: string;
    clientId: number;
    sessionId: number;
    /** Ejercicios que cubre la respuesta guardada. */
    exerciseIds: number[];
    contents: Record<number, ExerciseContentOut>;
    savedAt: number;
}

export function techniqueCacheKey(clientId: number, sessionId: number): string {
    return `${clientId}:${sessionId}`;
}

/** Entrada lista para guardar a partir de la respuesta del servidor (pura). */
export function buildTechniqueCacheEntry(
    clientId: number,
    sessionId: number,
    items: readonly AthleteExerciseContentItemOut[],
    savedAt: number
): AthleteTechniqueCacheEntry {
    const contents: Record<number, ExerciseContentOut> = {};
    for (const item of items) contents[item.exercise_id] = item.content;
    return {
        key: techniqueCacheKey(clientId, sessionId),
        clientId,
        sessionId,
        exerciseIds: items.map((item) => item.exercise_id),
        contents,
        savedAt,
    };
}

/**
 * Texto de un ejercicio en una entrada, o undefined si la entrada no lo cubre (p. ej. el
 * entrenador añadió el ejercicio después de guardarla). Pura.
 */
export function techniqueContentFor(
    entry: AthleteTechniqueCacheEntry | null,
    exerciseId: number
): ExerciseContentOut | undefined {
    if (!entry || !entry.exerciseIds.includes(exerciseId)) return undefined;
    return entry.contents[exerciseId];
}

export function isTechniqueCacheExpired(entry: AthleteTechniqueCacheEntry, now: number): boolean {
    return now - entry.savedAt > TECHNIQUE_CACHE_TTL_MS;
}

function openTechniqueDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("IndexedDB not available"));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error ?? new Error("IDB open failed"));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE)) {
                const store = db.createObjectStore(STORE, { keyPath: "key" });
                store.createIndex(INDEX_SESSION, "sessionId", { unique: false });
            }
        };
    });
}

function settle<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IDB request failed"));
    });
}

/** Guarda la entrada. false si no se pudo; nunca lanza. */
export async function saveSessionTechnique(entry: AthleteTechniqueCacheEntry): Promise<boolean> {
    try {
        const db = await openTechniqueDb();
        try {
            await settle(db.transaction(STORE, "readwrite").objectStore(STORE).put(entry));
            return true;
        } finally {
            db.close();
        }
    } catch {
        return false;
    }
}

/** La entrada de este atleta y esta sesión, o null si no hay, caducó o falló; nunca lanza. */
export async function loadSessionTechnique(
    clientId: number,
    sessionId: number,
    now: number = Date.now()
): Promise<AthleteTechniqueCacheEntry | null> {
    try {
        const db = await openTechniqueDb();
        try {
            const key = techniqueCacheKey(clientId, sessionId);
            const found = await settle(db.transaction(STORE, "readonly").objectStore(STORE).get(key));
            const entry = (found as AthleteTechniqueCacheEntry | undefined) ?? null;
            return entry && !isTechniqueCacheExpired(entry, now) ? entry : null;
        } finally {
            db.close();
        }
    } catch {
        return null;
    }
}

/** Borra la técnica guardada de una sesión, de cualquier atleta. false si falló; nunca lanza. */
export async function clearSessionTechnique(sessionId: number): Promise<boolean> {
    try {
        const db = await openTechniqueDb();
        try {
            const tx = db.transaction(STORE, "readwrite");
            const cursorRequest = tx
                .objectStore(STORE)
                .index(INDEX_SESSION)
                .openCursor(IDBKeyRange.only(sessionId));
            // Delete inside the cursor callbacks: an await between requests could let the
            // transaction commit early (same pattern as clearSessionOfflineData).
            cursorRequest.onsuccess = () => {
                const cursor = cursorRequest.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
            await new Promise<void>((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error ?? new Error("IDB clear failed"));
                tx.onabort = () => reject(tx.error ?? new Error("IDB clear aborted"));
            });
            return true;
        } finally {
            db.close();
        }
    } catch {
        return false;
    }
}
