/**
 * useExerciseNamesByIds.ts — Nombres de los ejercicios de contenido ya guardado.
 *
 * Contexto: PERF-7 §7.B. Sesiones, plantillas, sesiones sueltas y cargas guardan ids de
 * ejercicio. Este hook pide solo esos ids a GET /exercises/lookup (troceado de 200 en
 * 200) en lugar de descargar el catálogo, y resuelve también los ejercicios que el admin
 * desactivó después (`exercisesById.get(id)?.is_active === false`).
 * Notas de mantenimiento: solo para pintar lo guardado. Las listas para elegir
 * ejercicios usan el listado (useGetExercisePickerLibraryQuery), que oculta los
 * inactivos. Los ids se normalizan (orden y repetidos no cambian la clave de caché).
 * Mientras cambian los ids se conservan los nombres ya resueltos (sin parpadeo).
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import { useMemo } from "react";
import type { ExerciseLookupOut } from "../../types/exerciseCatalogRead";
import { exerciseLookupMaps, normalizeExerciseIds } from "../../utils/exerciseCatalogQuery";
import { useGetExercisesByIdsQuery } from "./exerciseLibraryApi";

export interface UseExerciseNamesByIdsResult {
    /** id → nombre visible (`exerciseDisplayName`). */
    namesById: ReadonlyMap<number, string>;
    /** id → fila completa del lookup (incluye `is_active`). */
    exercisesById: ReadonlyMap<number, ExerciseLookupOut>;
    /** Primera carga en curso (sin datos todavía). */
    isLoading: boolean;
    /** Alguna petición falló; los nombres ya resueltos se mantienen. */
    isError: boolean;
}

export function useExerciseNamesByIds(
    ids: readonly (number | null | undefined)[]
): UseExerciseNamesByIdsResult {
    const key = normalizeExerciseIds(ids).join(",");
    const normalizedIds = useMemo(() => (key ? key.split(",").map(Number) : []), [key]);

    const { data, isLoading, isError } = useGetExercisesByIdsQuery(normalizedIds, {
        skip: normalizedIds.length === 0,
    });

    const maps = useMemo(() => exerciseLookupMaps(data?.exercises), [data]);

    return { ...maps, isLoading, isError };
}
