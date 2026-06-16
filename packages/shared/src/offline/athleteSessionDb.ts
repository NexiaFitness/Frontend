/**
 * athleteSessionDb.ts — IndexedDB wrapper para offline atleta (F1).
 */

import type {
    AthleteSessionSnapshot,
    PendingExerciseLog,
    PendingSessionComplete,
} from "./athleteSessionTypes";

const DB_NAME = "nexia-athlete-offline";
const DB_VERSION = 1;

const STORE_SNAPSHOTS = "sessionSnapshots";
const STORE_PENDING_LOGS = "pendingLogs";
const STORE_PENDING_COMPLETES = "pendingCompletes";

export function isIndexedDbAvailable(): boolean {
    return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!isIndexedDbAvailable()) {
            reject(new Error("IndexedDB not available"));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error ?? new Error("IDB open failed"));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
                db.createObjectStore(STORE_SNAPSHOTS, { keyPath: "sessionId" });
            }
            if (!db.objectStoreNames.contains(STORE_PENDING_LOGS)) {
                const store = db.createObjectStore(STORE_PENDING_LOGS, { keyPath: "id" });
                store.createIndex("sessionId", "sessionId", { unique: false });
            }
            if (!db.objectStoreNames.contains(STORE_PENDING_COMPLETES)) {
                db.createObjectStore(STORE_PENDING_COMPLETES, { keyPath: "sessionId" });
            }
        };
    });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("IDB request failed"));
    });
}

export async function saveSessionSnapshot(snapshot: AthleteSessionSnapshot): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(STORE_SNAPSHOTS, "readwrite");
    await requestToPromise(tx.objectStore(STORE_SNAPSHOTS).put(snapshot));
    db.close();
}

export async function getSessionSnapshot(
    sessionId: number
): Promise<AthleteSessionSnapshot | null> {
    const db = await openDb();
    const tx = db.transaction(STORE_SNAPSHOTS, "readonly");
    const result = await requestToPromise(tx.objectStore(STORE_SNAPSHOTS).get(sessionId));
    db.close();
    return (result as AthleteSessionSnapshot | undefined) ?? null;
}

export async function addPendingLog(log: PendingExerciseLog): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(STORE_PENDING_LOGS, "readwrite");
    await requestToPromise(tx.objectStore(STORE_PENDING_LOGS).put(log));
    db.close();
}

export async function getPendingLogs(sessionId?: number): Promise<PendingExerciseLog[]> {
    const db = await openDb();
    const tx = db.transaction(STORE_PENDING_LOGS, "readonly");
    const store = tx.objectStore(STORE_PENDING_LOGS);
    const result =
        sessionId != null
            ? await requestToPromise(store.index("sessionId").getAll(sessionId))
            : await requestToPromise(store.getAll());
    db.close();
    return (result as PendingExerciseLog[]) ?? [];
}

export async function removePendingLog(id: string): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(STORE_PENDING_LOGS, "readwrite");
    await requestToPromise(tx.objectStore(STORE_PENDING_LOGS).delete(id));
    db.close();
}

export async function addPendingComplete(entry: PendingSessionComplete): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(STORE_PENDING_COMPLETES, "readwrite");
    await requestToPromise(tx.objectStore(STORE_PENDING_COMPLETES).put(entry));
    db.close();
}

export async function getPendingCompletes(): Promise<PendingSessionComplete[]> {
    const db = await openDb();
    const tx = db.transaction(STORE_PENDING_COMPLETES, "readonly");
    const result = await requestToPromise(tx.objectStore(STORE_PENDING_COMPLETES).getAll());
    db.close();
    return (result as PendingSessionComplete[]) ?? [];
}

export async function removePendingComplete(sessionId: number): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(STORE_PENDING_COMPLETES, "readwrite");
    await requestToPromise(tx.objectStore(STORE_PENDING_COMPLETES).delete(sessionId));
    db.close();
}

export async function clearSessionOfflineData(sessionId: number): Promise<void> {
    const db = await openDb();
    const tx = db.transaction(
        [STORE_SNAPSHOTS, STORE_PENDING_LOGS, STORE_PENDING_COMPLETES],
        "readwrite"
    );
    tx.objectStore(STORE_SNAPSHOTS).delete(sessionId);
    tx.objectStore(STORE_PENDING_COMPLETES).delete(sessionId);

    const logStore = tx.objectStore(STORE_PENDING_LOGS);
    const index = logStore.index("sessionId");
    await new Promise<void>((resolve, reject) => {
        const req = index.openCursor(IDBKeyRange.only(sessionId));
        req.onsuccess = () => {
            const cursor = req.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            } else {
                resolve();
            }
        };
        req.onerror = () => reject(req.error ?? new Error("IDB cursor failed"));
    });

    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("IDB clear failed"));
    });
    db.close();
}

export async function countPendingForSession(sessionId: number): Promise<number> {
    const logs = await getPendingLogs(sessionId);
    const completes = await getPendingCompletes();
    const hasComplete = completes.some((c) => c.sessionId === sessionId);
    return logs.length + (hasComplete ? 1 : 0);
}
