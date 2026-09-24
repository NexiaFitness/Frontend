/**
 * adminCatalogApi.ts — RTK Query Admin catálogo (bundle, review, history).
 *
 * Endpoints M4 disponibles (Swagger local):
 * - POST /exercises/catalog
 * - GET|PUT /exercises/{id}/catalog
 * - POST /admin/catalog/exercises/{pk}/review
 * - GET /admin/catalog/exercises/{pk}/history
 *
 * Listado / import / reactivate: bloque FE posterior (M4.4–M4.6).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { baseApi } from "./baseApi";
import type {
    CatalogExerciseOut,
    CatalogReviewStatusOut,
    ExerciseCatalogBundleCreateIn,
    ExerciseCatalogBundleUpdateIn,
    ExerciseCatalogHistoryOut,
} from "../types/adminCatalog";

export const adminCatalogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getExerciseCatalog: builder.query<CatalogExerciseOut, number>({
            query: (exercisePk) => ({
                url: `/exercises/${exercisePk}/catalog`,
                method: "GET",
            }),
            providesTags: (_result, _error, exercisePk) => [
                { type: "AdminCatalog", id: exercisePk },
                { type: "Exercise", id: exercisePk },
            ],
        }),

        createExerciseCatalog: builder.mutation<
            CatalogExerciseOut,
            ExerciseCatalogBundleCreateIn
        >({
            query: (body) => ({
                url: "/exercises/catalog",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "AdminCatalog", id: "LIST" },
                { type: "Exercise", id: "LIST" },
            ],
        }),

        updateExerciseCatalog: builder.mutation<
            CatalogExerciseOut,
            { exercisePk: number; body: ExerciseCatalogBundleUpdateIn }
        >({
            query: ({ exercisePk, body }) => ({
                url: `/exercises/${exercisePk}/catalog`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { exercisePk }) => [
                { type: "AdminCatalog", id: exercisePk },
                { type: "Exercise", id: exercisePk },
                { type: "Exercise", id: "LIST" },
            ],
        }),

        markCatalogExerciseReviewed: builder.mutation<CatalogReviewStatusOut, number>({
            query: (exercisePk) => ({
                url: `/admin/catalog/exercises/${exercisePk}/review`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, exercisePk) => [
                { type: "AdminCatalog", id: exercisePk },
                { type: "Exercise", id: exercisePk },
            ],
        }),

        getCatalogExerciseHistory: builder.query<ExerciseCatalogHistoryOut, number>({
            query: (exercisePk) => ({
                url: `/admin/catalog/exercises/${exercisePk}/history`,
                method: "GET",
            }),
            providesTags: (_result, _error, exercisePk) => [
                { type: "AdminCatalog", id: `HISTORY-${exercisePk}` },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetExerciseCatalogQuery,
    useLazyGetExerciseCatalogQuery,
    useCreateExerciseCatalogMutation,
    useUpdateExerciseCatalogMutation,
    useMarkCatalogExerciseReviewedMutation,
    useGetCatalogExerciseHistoryQuery,
    useLazyGetCatalogExerciseHistoryQuery,
} = adminCatalogApi;
