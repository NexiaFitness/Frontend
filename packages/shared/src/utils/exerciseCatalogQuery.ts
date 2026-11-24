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

import type { ExerciseListQueryFilters } from "../types/exerciseCatalogRead";

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

/** Tags de caché de una lista de ejercicios: uno por id y la lista. */
export function exerciseListTags(
    rows: readonly { id: number }[] | undefined
): Array<{ type: "Exercise"; id: number | "LIST" }> {
    const listTag = { type: "Exercise" as const, id: "LIST" as const };
    if (!rows) return [listTag];
    return [...rows.map(({ id }) => ({ type: "Exercise" as const, id })), listTag];
}
