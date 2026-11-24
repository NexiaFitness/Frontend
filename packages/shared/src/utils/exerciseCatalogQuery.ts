/**
 * exerciseCatalogQuery.ts — Lógica pura de las lecturas del catálogo de ejercicios.
 *
 * Contexto: GET /exercises/ (una página, todas las páginas) y GET /exercises/lookup
 * (nombres por ids). Los endpoints RTK Query de `hooks/exercises` delegan aquí para que
 * la paginación, la deduplicación y el troceo se prueben sin red.
 * Notas de mantenimiento: el catálogo no tiene tope (PERF-7 §0.3). Ningún consumidor
 * pasa un límite sobre el catálogo; el tamaño de página y el de troceo son por petición.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import type {
    ExerciseCatalogAll,
    ExerciseCatalogPage,
    ExerciseListQueryFilters,
    ExerciseLookupOut,
    ExerciseLookupResponse,
} from "../types/exerciseCatalogRead";
import { exerciseDisplayName } from "./exerciseNames";

/** Resultado de una petición, con la forma de RTK Query (`data` o `error`). */
export type CatalogFetchResult<T, E> = { data: T } | { error: E };

/** Añade los filtros de GET /exercises/ con los nombres y la repetición del backend. */
export function appendExerciseListFilters(
    params: URLSearchParams,
    filters: ExerciseListQueryFilters
): void {
    if (filters.tipo) params.append("tipo", filters.tipo);
    if (filters.nivel) params.append("nivel", filters.nivel);
    if (filters.equipo) params.append("equipo", filters.equipo);
    if (filters.patron_movimiento) {
        params.append("patron_movimiento", filters.patron_movimiento);
    }
    if (filters.tipo_carga) params.append("tipo_carga", filters.tipo_carga);
    if (filters.search) params.append("search", filters.search);
    for (const id of filters.muscle_group_ids ?? []) {
        params.append("muscle_group_ids", id.toString());
    }
    for (const id of filters.equipment_ids ?? []) {
        params.append("equipment_ids", id.toString());
    }
    if (filters.movement_pattern_ids?.length) {
        for (const id of filters.movement_pattern_ids) {
            params.append("movement_pattern_ids", id.toString());
        }
        params.append("movement_pattern_role", filters.movement_pattern_role ?? "primary");
    }
    if (filters.client_id != null) params.append("client_id", String(filters.client_id));
    if (filters.contract) params.append("contract", filters.contract);
}

/**
 * Pide páginas de `pageSize` hasta `has_more=false` y las une en el orden del servidor,
 * sin duplicados (una alta entre páginas puede repetir una fila). Si una página falla
 * devuelve ese error: nunca una lista parcial como si fuera completa.
 */
export async function collectAllCatalogPages<T extends { id: number }, E>(
    fetchPage: (skip: number, limit: number) => Promise<CatalogFetchResult<ExerciseCatalogPage<T>, E>>,
    pageSize: number
): Promise<CatalogFetchResult<ExerciseCatalogAll<T>, E>> {
    const seen = new Set<number>();
    const exercises: T[] = [];
    let equipmentFilterApplied: ExerciseCatalogAll<T>["equipment_filter_applied"] = "none";
    for (let skip = 0; ; skip += pageSize) {
        const result = await fetchPage(skip, pageSize);
        if ("error" in result) return { error: result.error };
        const page = result.data;
        if (skip === 0) equipmentFilterApplied = page.equipment_filter_applied ?? "none";
        for (const row of page.exercises) {
            if (seen.has(row.id)) continue;
            seen.add(row.id);
            exercises.push(row);
        }
        // Página vacía con has_more: bajas entre peticiones; no hay más que pedir.
        if (!page.has_more || page.exercises.length === 0) break;
    }
    return { data: { exercises, equipment_filter_applied: equipmentFilterApplied } };
}

/** Ids enteros positivos, sin repetir y ordenados: la clave de caché no depende del orden. */
export function normalizeExerciseIds(ids: readonly (number | null | undefined)[]): number[] {
    const unique = new Set<number>();
    for (const id of ids) {
        if (typeof id === "number" && Number.isInteger(id) && id > 0) unique.add(id);
    }
    return [...unique].sort((a, b) => a - b);
}

/** Parte `items` en trozos de `size` como máximo. */
export function chunkItems<T>(items: readonly T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
    return chunks;
}

/** Query string de GET /exercises/lookup (`ids` repetido). */
export function exerciseLookupQuery(ids: readonly number[]): string {
    const params = new URLSearchParams();
    for (const id of ids) params.append("ids", String(id));
    return params.toString();
}

/**
 * Resuelve `ids` en trozos de `chunkSize` en paralelo y une el resultado ordenado por id.
 * Si un trozo falla devuelve ese error. Sin ids no hace ninguna petición.
 */
export async function collectLookupChunks<E>(
    ids: readonly number[],
    chunkSize: number,
    fetchChunk: (chunk: number[]) => Promise<CatalogFetchResult<ExerciseLookupResponse, E>>
): Promise<CatalogFetchResult<ExerciseLookupResponse, E>> {
    const results = await Promise.all(chunkItems(ids, chunkSize).map(fetchChunk));
    const exercises: ExerciseLookupOut[] = [];
    for (const result of results) {
        if ("error" in result) return { error: result.error };
        exercises.push(...result.data.exercises);
    }
    exercises.sort((a, b) => a.id - b.id);
    return { data: { exercises } };
}

/** Mapas id → nombre visible e id → fila, para pintar contenido guardado. */
export function exerciseLookupMaps(rows: readonly ExerciseLookupOut[] | undefined): {
    namesById: ReadonlyMap<number, string>;
    exercisesById: ReadonlyMap<number, ExerciseLookupOut>;
} {
    const namesById = new Map<number, string>();
    const exercisesById = new Map<number, ExerciseLookupOut>();
    for (const row of rows ?? []) {
        namesById.set(row.id, exerciseDisplayName(row));
        exercisesById.set(row.id, row);
    }
    return { namesById, exercisesById };
}

/** Tags de caché de una lista de ejercicios: uno por id y la lista. */
export function exerciseListTags(
    rows: readonly { id: number }[] | undefined
): Array<{ type: "Exercise"; id: number | "LIST" }> {
    const listTag = { type: "Exercise" as const, id: "LIST" as const };
    if (!rows) return [listTag];
    return [...rows.map(({ id }) => ({ type: "Exercise" as const, id })), listTag];
}
