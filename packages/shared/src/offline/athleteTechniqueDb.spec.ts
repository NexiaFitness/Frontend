/**
 * athleteTechniqueDb.spec.ts — Caché de «Ver técnica»: identidad, cobertura, caducidad y fallos.
 *
 * Contexto: SPEC_H8 §8 (H8-A). La clave es atleta + sesión; el texto se busca por
 * exercise_id y un ejercicio no cubierto no tiene texto; ninguna operación lanza aunque
 * IndexedDB falte o falle (la cola de series nunca depende de esta caché).
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
    TECHNIQUE_CACHE_TTL_MS,
    buildTechniqueCacheEntry,
    clearSessionTechnique,
    isTechniqueCacheExpired,
    loadSessionTechnique,
    saveSessionTechnique,
    techniqueCacheKey,
    techniqueContentFor,
} from "./athleteTechniqueDb";
import type { ExerciseContentOut } from "../types/exerciseContent";

const content = (description: string): ExerciseContentOut => ({
    locale: "es",
    in_english: false,
    description,
    steps: [],
    tips: [],
});

describe("identidad y cobertura", () => {
    it("la clave separa atleta y sesión", () => {
        expect(techniqueCacheKey(7, 41)).toBe("7:41");
        expect(techniqueCacheKey(7, 41)).not.toBe(techniqueCacheKey(8, 41));
    });

    it("el texto se busca por exercise_id; un ejercicio no cubierto no tiene texto", () => {
        const entry = buildTechniqueCacheEntry(
            7,
            41,
            [
                { exercise_id: 98, content: content("Bird dog") },
                { exercise_id: 11, content: content("Sentadilla") },
            ],
            1000
        );
        expect(entry.key).toBe("7:41");
        expect(entry.exerciseIds).toEqual([98, 11]);
        expect(techniqueContentFor(entry, 11)?.description).toBe("Sentadilla");
        expect(techniqueContentFor(entry, 251)).toBeUndefined();
        expect(techniqueContentFor(null, 11)).toBeUndefined();
    });

    it("caduca a las 24 h, como la copia de la sesión", () => {
        const entry = buildTechniqueCacheEntry(7, 41, [], 0);
        expect(isTechniqueCacheExpired(entry, TECHNIQUE_CACHE_TTL_MS)).toBe(false);
        expect(isTechniqueCacheExpired(entry, TECHNIQUE_CACHE_TTL_MS + 1)).toBe(true);
    });
});

describe("un fallo de IndexedDB es caché ausente, nunca una excepción", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const entry = buildTechniqueCacheEntry(7, 41, [{ exercise_id: 1, content: content("x") }], 0);

    it("sin IndexedDB", async () => {
        vi.stubGlobal("indexedDB", undefined);
        await expect(saveSessionTechnique(entry)).resolves.toBe(false);
        await expect(loadSessionTechnique(7, 41)).resolves.toBeNull();
        await expect(clearSessionTechnique(41)).resolves.toBe(false);
    });

    it("si abrir la base lanza", async () => {
        vi.stubGlobal("indexedDB", {
            open: () => {
                throw new Error("blocked");
            },
        });
        await expect(saveSessionTechnique(entry)).resolves.toBe(false);
        await expect(loadSessionTechnique(7, 41)).resolves.toBeNull();
        await expect(clearSessionTechnique(41)).resolves.toBe(false);
    });

    it("si la apertura termina en error", async () => {
        vi.stubGlobal("indexedDB", {
            open: () => {
                const request: { error: Error; onerror?: () => void } = {
                    error: new Error("QuotaExceededError"),
                };
                queueMicrotask(() => request.onerror?.());
                return request;
            },
        });
        await expect(saveSessionTechnique(entry)).resolves.toBe(false);
        await expect(loadSessionTechnique(7, 41)).resolves.toBeNull();
        await expect(clearSessionTechnique(41)).resolves.toBe(false);
    });
});
