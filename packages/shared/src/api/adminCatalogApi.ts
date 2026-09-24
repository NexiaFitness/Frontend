/**
 * adminCatalogApi.ts — RTK Query Admin catálogo (bundle, review, history).
 *
 * Endpoints M4 disponibles (Swagger local):
 * - POST /exercises/catalog
 * - GET|PUT /exercises/{id}/catalog
 * - DELETE /exercises/{id} (soft delete admin)
 * - GET /admin/catalog/exercises
 * - POST /admin/catalog/exercises/{pk}/review
 * - POST /admin/catalog/exercises/{pk}/reactivate
 * - GET /admin/catalog/exercises/{pk}/history
 * - GET /admin/catalog/export (xlsx)
 * - POST /admin/catalog/import/validate | /confirm (multipart)
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { baseApi } from "./baseApi";
import type {
    AdminCatalogExerciseListOut,
    AdminCatalogExportParams,
    AdminCatalogListParams,
    CatalogExerciseOut,
    CatalogImportConfirmOut,
    CatalogImportValidateOut,
    CatalogReviewStatusOut,
    ExerciseCatalogBundleCreateIn,
    ExerciseCatalogBundleUpdateIn,
    ExerciseCatalogHistoryOut,
} from "../types/adminCatalog";

/** Multipart body de import validate/confirm (campo `file` del backend). */
function catalogImportFormData(file: File): FormData {
    const body = new FormData();
    body.append("file", file);
    return body;
}

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

        listAdminCatalogExercises: builder.query<
            AdminCatalogExerciseListOut,
            AdminCatalogListParams
        >({
            query: (params) => ({
                url: "/admin/catalog/exercises",
                method: "GET",
                params: {
                    skip: params.skip ?? 0,
                    limit: params.limit ?? 100,
                    ...(params.search ? { search: params.search } : {}),
                    ...(params.review_status
                        ? { review_status: params.review_status }
                        : {}),
                    include_inactive: params.include_inactive ?? false,
                    quality_issues_only: params.quality_issues_only ?? false,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map((item) => ({
                              type: "AdminCatalog" as const,
                              id: item.exercise_pk,
                          })),
                          { type: "AdminCatalog" as const, id: "LIST" },
                      ]
                    : [{ type: "AdminCatalog" as const, id: "LIST" }],
        }),

        /** Descarga Excel v2; el consumidor decide cómo persistir el Blob. */
        exportAdminCatalog: builder.query<Blob, AdminCatalogExportParams>({
            query: (params) => ({
                url: "/admin/catalog/export",
                method: "GET",
                params: { include_inactive: params.include_inactive ?? false },
                responseHandler: (response: Response) => response.blob(),
            }),
            keepUnusedDataFor: 0,
        }),

        validateCatalogImport: builder.mutation<CatalogImportValidateOut, File>({
            query: (file) => ({
                url: "/admin/catalog/import/validate",
                method: "POST",
                body: catalogImportFormData(file),
            }),
        }),

        confirmCatalogImport: builder.mutation<CatalogImportConfirmOut, File>({
            query: (file) => ({
                url: "/admin/catalog/import/confirm",
                method: "POST",
                body: catalogImportFormData(file),
            }),
            invalidatesTags: [
                { type: "AdminCatalog", id: "LIST" },
                { type: "Exercise", id: "LIST" },
            ],
        }),

        reactivateCatalogExercise: builder.mutation<CatalogReviewStatusOut, number>({
            query: (exercisePk) => ({
                url: `/admin/catalog/exercises/${exercisePk}/reactivate`,
                method: "POST",
            }),
            invalidatesTags: (_result, _error, exercisePk) => [
                { type: "AdminCatalog", id: exercisePk },
                { type: "AdminCatalog", id: "LIST" },
                { type: "Exercise", id: exercisePk },
                { type: "Exercise", id: "LIST" },
            ],
        }),

        /** Soft delete admin — DELETE /exercises/{pk} devuelve la ficha ya inactiva. */
        deactivateCatalogExercise: builder.mutation<CatalogExerciseOut, number>({
            query: (exercisePk) => ({
                url: `/exercises/${exercisePk}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, exercisePk) => [
                { type: "AdminCatalog", id: exercisePk },
                { type: "AdminCatalog", id: "LIST" },
                { type: "Exercise", id: exercisePk },
                { type: "Exercise", id: "LIST" },
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
    useListAdminCatalogExercisesQuery,
    useLazyListAdminCatalogExercisesQuery,
    useLazyExportAdminCatalogQuery,
    useValidateCatalogImportMutation,
    useConfirmCatalogImportMutation,
    useReactivateCatalogExerciseMutation,
    useDeactivateCatalogExerciseMutation,
} = adminCatalogApi;
