/**
 * exerciseCatalogQuery.spec.ts — Lógica pura de las lecturas del catálogo (PERF-7).
 *
 * Contexto: parámetros de GET /exercises/ (mismos nombres, orden y repetición que antes
 * de extraerlos de useExercises.ts) y tags de caché.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import { describe, expect, it } from "vitest";
import type {
    ExerciseCatalogPage,
    ExerciseLookupOut,
    ExerciseLookupResponse,
} from "../types/exerciseCatalogRead";
import {
    appendExerciseListFilters,
    chunkItems,
    collectAllCatalogPages,
    collectLookupChunks,
    exerciseListTags,
    exerciseLookupMaps,
    exerciseLookupQuery,
    normalizeExerciseIds,
    type CatalogFetchResult,
} from "./exerciseCatalogQuery";

type Row = { id: number; nombre: string };

/** Servidor simulado de GET /exercises/: corta `rows` por skip/limit como el backend. */
function pagedServer(rows: Row[], overrides: Record<number, Row[]> = {}) {
    const calls: Array<{ skip: number; limit: number }> = [];
    const fetchPage = async (
        skip: number,
        limit: number
    ): Promise<CatalogFetchResult<ExerciseCatalogPage<Row>, string>> => {
        calls.push({ skip, limit });
        const exercises = overrides[skip] ?? rows.slice(skip, skip + limit);
        return {
            data: {
                exercises,
                has_more: skip + limit < rows.length,
                equipment_filter_applied: "active",
            },
        };
    };
    return { fetchPage, calls };
}

const rows = (n: number): Row[] =>
    Array.from({ length: n }, (_, i) => ({ id: i + 1, nombre: `E${i + 1}` }));

describe("collectAllCatalogPages (T-CAT-3)", () => {
    it("catálogo mayor que la página: todas, en orden, sin duplicados ni huecos", async () => {
        const server = pagedServer(rows(23));
        const result = await collectAllCatalogPages(server.fetchPage, 7);
        expect(server.calls).toEqual([
            { skip: 0, limit: 7 },
            { skip: 7, limit: 7 },
            { skip: 14, limit: 7 },
            { skip: 21, limit: 7 },
        ]);
        expect(result).toEqual({
            data: { exercises: rows(23), equipment_filter_applied: "active" },
        });
    });

    it("catálogo justo de una página: una sola petición", async () => {
        const server = pagedServer(rows(7));
        const result = await collectAllCatalogPages(server.fetchPage, 7);
        expect(server.calls).toHaveLength(1);
        expect("data" in result && result.data.exercises).toHaveLength(7);
    });

    it("un alta entre páginas repite una fila: se deduplica por id", async () => {
        const all = rows(10);
        const server = pagedServer(all, { 5: [all[4] as Row, ...all.slice(5, 9)] });
        const result = await collectAllCatalogPages(server.fetchPage, 5);
        const ids = "data" in result ? result.data.exercises.map((r) => r.id) : [];
        expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("página vacía con has_more: para sin bucle infinito", async () => {
        const server = pagedServer(rows(10), { 5: [] });
        const result = await collectAllCatalogPages(server.fetchPage, 5);
        expect(server.calls).toHaveLength(2);
        expect("data" in result && result.data.exercises).toHaveLength(5);
    });

    it("si una página falla devuelve el error, no una lista parcial", async () => {
        const server = pagedServer(rows(23));
        const failing = async (skip: number, limit: number) =>
            skip === 14 ? { error: "boom" } : server.fetchPage(skip, limit);
        expect(await collectAllCatalogPages(failing, 7)).toEqual({ error: "boom" });
    });

    it("sin equipment_filter_applied en la primera página: none", async () => {
        const result = await collectAllCatalogPages(
            async () => ({ data: { exercises: [], has_more: false } }),
            7
        );
        expect(result).toEqual({ data: { exercises: [], equipment_filter_applied: "none" } });
    });
});

describe("normalizeExerciseIds (T-CAT-4)", () => {
    it("la clave no depende del orden ni de los repetidos", () => {
        expect(normalizeExerciseIds([5, 3, 5, 1])).toEqual(normalizeExerciseIds([1, 3, 5]));
        expect(normalizeExerciseIds([5, 3, 5, 1])).toEqual([1, 3, 5]);
    });

    it("descarta nulos, no enteros y no positivos", () => {
        expect(normalizeExerciseIds([null, undefined, 0, -2, 1.5, Number.NaN, 4])).toEqual([4]);
    });
});

describe("collectLookupChunks (T-CAT-4)", () => {
    const lookupServer = () => {
        const calls: number[][] = [];
        const fetchChunk = async (
            chunk: number[]
        ): Promise<CatalogFetchResult<ExerciseLookupResponse, string>> => {
            calls.push(chunk);
            return {
                data: {
                    exercises: [...chunk]
                        .reverse()
                        .map((id) => ({ id, nombre: `E${id}`, is_active: id !== 2 })),
                },
            };
        };
        return { calls, fetchChunk };
    };

    it("450 ids: 3 peticiones (200, 200, 50) y resultado unido por id", async () => {
        const server = lookupServer();
        const ids = Array.from({ length: 450 }, (_, i) => i + 1);
        const result = await collectLookupChunks(ids, 200, server.fetchChunk);
        expect(server.calls.map((c) => c.length)).toEqual([200, 200, 50]);
        const got = "data" in result ? result.data.exercises.map((e) => e.id) : [];
        expect(got).toEqual(ids);
    });

    it("sin ids no hace ninguna petición", async () => {
        const server = lookupServer();
        expect(await collectLookupChunks([], 200, server.fetchChunk)).toEqual({
            data: { exercises: [] },
        });
        expect(server.calls).toHaveLength(0);
    });

    it("si un trozo falla devuelve el error", async () => {
        const server = lookupServer();
        const failing = async (chunk: number[]) =>
            chunk[0] === 201 ? { error: "boom" } : server.fetchChunk(chunk);
        const ids = Array.from({ length: 300 }, (_, i) => i + 1);
        expect(await collectLookupChunks(ids, 200, failing)).toEqual({ error: "boom" });
    });
});

describe("lookup: query y mapas", () => {
    it("ids repetidos en la URL", () => {
        expect(exerciseLookupQuery([1, 22])).toBe("ids=1&ids=22");
    });

    it("chunkItems respeta el tamaño", () => {
        expect(chunkItems([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(chunkItems([], 2)).toEqual([]);
    });

    it("mapas con nombre visible y fila (incluido inactivo)", () => {
        const retired: ExerciseLookupOut = { id: 9, nombre: "  Press viejo ", is_active: false };
        const { namesById, exercisesById } = exerciseLookupMaps([retired]);
        expect(namesById.get(9)).toBe("Press viejo");
        expect(exercisesById.get(9)?.is_active).toBe(false);
        expect(exerciseLookupMaps(undefined).namesById.size).toBe(0);
    });
});

function query(filters: Parameters<typeof appendExerciseListFilters>[1]): string {
    const params = new URLSearchParams();
    appendExerciseListFilters(params, filters);
    return params.toString();
}

describe("appendExerciseListFilters", () => {
    it("sin filtros no añade nada", () => {
        expect(query({})).toBe("");
    });

    it("todos los filtros, en el orden y con la repetición del backend", () => {
        expect(
            query({
                tipo: "multiarticular",
                nivel: "intermediate",
                equipo: "barbell",
                patron_movimiento: "squat",
                tipo_carga: "external",
                search: "press banca",
                muscle_group_ids: [1, 2],
                equipment_ids: [3],
                movement_pattern_ids: [4, 5],
                client_id: 78,
                contract: "complete",
            })
        ).toBe(
            "tipo=multiarticular&nivel=intermediate&equipo=barbell&patron_movimiento=squat" +
                "&tipo_carga=external&search=press+banca&muscle_group_ids=1&muscle_group_ids=2" +
                "&equipment_ids=3&movement_pattern_ids=4&movement_pattern_ids=5" +
                "&movement_pattern_role=primary&client_id=78&contract=complete"
        );
    });

    it("el rol del patrón solo viaja si hay patrones", () => {
        expect(query({ movement_pattern_role: "any" })).toBe("");
        expect(query({ movement_pattern_ids: [9], movement_pattern_role: "any" })).toBe(
            "movement_pattern_ids=9&movement_pattern_role=any"
        );
    });

    it("client_id 0 se envía; listas vacías no", () => {
        expect(query({ client_id: 0, equipment_ids: [], muscle_group_ids: [] })).toBe(
            "client_id=0"
        );
    });
});

describe("exerciseListTags", () => {
    it("un tag por id y el de lista", () => {
        expect(exerciseListTags([{ id: 1 }, { id: 2 }])).toEqual([
            { type: "Exercise", id: 1 },
            { type: "Exercise", id: 2 },
            { type: "Exercise", id: "LIST" },
        ]);
    });

    it("sin datos, solo el de lista", () => {
        expect(exerciseListTags(undefined)).toEqual([{ type: "Exercise", id: "LIST" }]);
    });
});
