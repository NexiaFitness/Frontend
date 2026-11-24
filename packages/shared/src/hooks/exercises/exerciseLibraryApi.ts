/**
 * exerciseLibraryApi.ts — Lecturas del catálogo completo de ejercicios.
 *
 * Contexto: separado de useExercises.ts (regla de tamaño, agent.md §7.1), que contiene
 * GET /exercises/ por página. Aquí vive la carga de todas las páginas.
 * Notas de mantenimiento: el backend rechaza limit>1000 (422); se pagina con
 * EXERCISES_LIST_MAX_LIMIT.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { baseApi } from "../../api/baseApi";
import { EXERCISES_LIST_MAX_LIMIT } from "../../config/constants";
import { exerciseListTags } from "../../utils/exerciseCatalogQuery";
import type { Exercise, ExerciseListResponse } from "./useExercises";

const exerciseLibraryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Biblioteca completa: pagina con limit=EXERCISES_LIST_MAX_LIMIT hasta has_more=false.
         * El backend rechaza limit>1000 (422); este endpoint evita una sola petición inválida.
         */
        getExerciseLibrary: builder.query<ExerciseListResponse, void>({
            async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
                const pageSize = EXERCISES_LIST_MAX_LIMIT;
                const merged: Exercise[] = [];
                let skip = 0;
                let reportedTotal = 0;

                for (;;) {
                    const res = await fetchWithBQ({
                        url: `/exercises/?skip=${skip}&limit=${pageSize}`,
                        method: "GET",
                    });
                    if (res.error) {
                        return { error: res.error as FetchBaseQueryError };
                    }
                    const page = res.data as ExerciseListResponse;
                    if (skip === 0) {
                        reportedTotal = page.total;
                    }
                    merged.push(...page.exercises);
                    if (!page.has_more || page.exercises.length === 0) {
                        break;
                    }
                    skip += pageSize;
                    if (skip > reportedTotal + pageSize) {
                        break;
                    }
                }

                return {
                    data: {
                        exercises: merged,
                        total: reportedTotal,
                        skip: 0,
                        limit: merged.length,
                        has_more: false,
                    },
                };
            },
            providesTags: (result) => exerciseListTags(result?.exercises),
        }),
    }),
    overrideExisting: false,
});

export const { useGetExerciseLibraryQuery } = exerciseLibraryApi;
