/**
 * RTK Query — Admin endpoints (catalog health, etc.)
 */

import { baseApi } from "./baseApi";

export interface CatalogMuscleMappingGapOut {
    exercise_id: number;
    exercise_code: string;
    name_es: string;
}

export interface CatalogHealthOut {
    missing_muscle_mapping_count: number;
    exercises: CatalogMuscleMappingGapOut[];
}

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCatalogHealth: builder.query<CatalogHealthOut, void>({
            query: () => ({
                url: "/admin/catalog-health",
                method: "GET",
            }),
        }),
    }),
    overrideExisting: false,
});

export const { useGetCatalogHealthQuery } = adminApi;
