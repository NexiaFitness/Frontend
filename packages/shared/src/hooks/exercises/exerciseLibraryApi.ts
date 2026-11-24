/**
 * exerciseLibraryApi.ts — Lecturas del catálogo sin tope: todas las páginas y nombres por ids.
 *
 * Contexto: separado de useExercises.ts (regla de tamaño, agent.md §7.1), que contiene
 * GET /exercises/ por página. PERF-7 §0.3: el catálogo no tiene tope.
 * - getExerciseLibrary / getExercisePickerLibrary: GET /exercises/ (`view=full` /
 *   `view=picker`) página a página hasta has_more=false, con los filtros del listado.
 *   El listado oculta los ejercicios inactivos: es la única fuente de las listas para
 *   elegir ejercicios (selector de sesión).
 * - getExercisesByIds: GET /exercises/lookup troceado de EXERCISE_LOOKUP_MAX_IDS en
 *   EXERCISE_LOOKUP_MAX_IDS. Devuelve también los inactivos: solo sirve para pintar el
 *   nombre de contenido ya guardado, nunca para ofrecer ejercicios.
 * Notas de mantenimiento: la paginación, la deduplicación y el troceo viven en
 * utils/exerciseCatalogQuery.ts (probados sin red).
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { baseApi } from "../../api/baseApi";
import { EXERCISE_LOOKUP_MAX_IDS, EXERCISES_LIST_MAX_LIMIT } from "../../config/constants";
import type {
    ExerciseCatalogAll,
    ExerciseCatalogPage,
    ExerciseListQueryFilters,
    ExerciseLookupResponse,
    ExercisePickerOut,
} from "../../types/exerciseCatalogRead";
import {
    appendExerciseListFilters,
    collectAllCatalogPages,
    collectLookupChunks,
    exerciseListTags,
    exerciseLookupQuery,
    normalizeExerciseIds,
} from "../../utils/exerciseCatalogQuery";
import type { Exercise } from "./useExercises";

type FetchWithBaseQuery = (
    arg: FetchArgs
) => PromiseLike<{ data?: unknown; error?: unknown }> | { data?: unknown; error?: unknown };

function libraryPageUrl(
    view: "full" | "picker",
    filters: ExerciseListQueryFilters,
    skip: number,
    limit: number
): string {
    const params = new URLSearchParams();
    params.append("skip", String(skip));
    params.append("limit", String(limit));
    params.append("view", view);
    appendExerciseListFilters(params, filters);
    return `/exercises/?${params.toString()}`;
}

function fetchAllLibraryPages<T extends { id: number }>(
    fetchWithBQ: FetchWithBaseQuery,
    view: "full" | "picker",
    filters: ExerciseListQueryFilters
) {
    return collectAllCatalogPages<T, FetchBaseQueryError>(async (skip, limit) => {
        const res = await fetchWithBQ({
            url: libraryPageUrl(view, filters, skip, limit),
            method: "GET",
        });
        if (res.error) return { error: res.error as FetchBaseQueryError };
        return { data: res.data as ExerciseCatalogPage<T> };
    }, EXERCISES_LIST_MAX_LIMIT);
}

const exerciseLibraryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /** Catálogo completo con ficha (`view=full`). */
        getExerciseLibrary: builder.query<
            ExerciseCatalogAll<Exercise>,
            ExerciseListQueryFilters | void
        >({
            queryFn: (filters, _api, _extraOptions, fetchWithBQ) =>
                fetchAllLibraryPages<Exercise>(fetchWithBQ, "full", filters ?? {}),
            providesTags: (result) => exerciseListTags(result?.exercises),
        }),
        /** Catálogo completo para el selector de sesión (`view=picker`: id y nombres). */
        getExercisePickerLibrary: builder.query<
            ExerciseCatalogAll<ExercisePickerOut>,
            ExerciseListQueryFilters
        >({
            queryFn: (filters, _api, _extraOptions, fetchWithBQ) =>
                fetchAllLibraryPages<ExercisePickerOut>(fetchWithBQ, "picker", filters),
            providesTags: (result) => exerciseListTags(result?.exercises),
        }),
        /** Ejercicios referenciados por id, activos o no. Usar vía useExerciseNamesByIds. */
        getExercisesByIds: builder.query<ExerciseLookupResponse, readonly number[]>({
            queryFn: (ids, _api, _extraOptions, fetchWithBQ) =>
                collectLookupChunks<FetchBaseQueryError>(
                    normalizeExerciseIds(ids),
                    EXERCISE_LOOKUP_MAX_IDS,
                    async (chunk) => {
                        const res = await fetchWithBQ({
                            url: `/exercises/lookup?${exerciseLookupQuery(chunk)}`,
                            method: "GET",
                        });
                        if (res.error) return { error: res.error as FetchBaseQueryError };
                        return { data: res.data as ExerciseLookupResponse };
                    }
                ),
            providesTags: (result) => exerciseListTags(result?.exercises),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetExerciseLibraryQuery,
    useGetExercisePickerLibraryQuery,
    useGetExercisesByIdsQuery,
} = exerciseLibraryApi;
