/**
 * adminPhysicalTestsApi.ts — RTK Query Admin tests físicos (Portal Admin T2).
 *
 * Endpoints T1:
 * - GET /admin/physical-tests/categories
 * - GET/POST /admin/physical-tests
 * - GET/PUT /admin/physical-tests/{id}
 * - POST .../deactivate | .../reactivate
 */

import { baseApi } from "./baseApi";
import type {
    AdminPhysicalTestCategoriesOut,
    AdminPhysicalTestCreateIn,
    AdminPhysicalTestOut,
    AdminPhysicalTestsListParams,
    AdminPhysicalTestsPageOut,
    AdminPhysicalTestUpdateIn,
} from "../types/adminPhysicalTests";

const PHYSICAL_TEST_INVALIDATION = [
    { type: "AdminPhysicalTests" as const, id: "LIST" },
    { type: "PhysicalTest" as const },
];

function buildListQuery(params: AdminPhysicalTestsListParams): string {
    const search = new URLSearchParams();
    if (params.scope) search.set("scope", params.scope);
    if (params.page != null) search.set("page", String(params.page));
    if (params.page_size != null) search.set("page_size", String(params.page_size));
    if (params.trainer_id != null) search.set("trainer_id", String(params.trainer_id));
    if (params.include_inactive != null) {
        search.set("include_inactive", String(params.include_inactive));
    }
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}

export const adminPhysicalTestsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listAdminPhysicalTestCategories: builder.query<AdminPhysicalTestCategoriesOut, void>({
            query: () => ({
                url: "/admin/physical-tests/categories",
                method: "GET",
            }),
            providesTags: [{ type: "AdminPhysicalTests", id: "CATEGORIES" }],
        }),

        listAdminPhysicalTests: builder.query<
            AdminPhysicalTestsPageOut,
            AdminPhysicalTestsListParams
        >({
            query: (params) => ({
                url: `/admin/physical-tests${buildListQuery(params)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "AdminPhysicalTests" as const,
                              id,
                          })),
                          { type: "AdminPhysicalTests", id: "LIST" },
                      ]
                    : [{ type: "AdminPhysicalTests", id: "LIST" }],
        }),

        getAdminPhysicalTest: builder.query<AdminPhysicalTestOut, number>({
            query: (id) => ({
                url: `/admin/physical-tests/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "AdminPhysicalTests", id }],
        }),

        createAdminPhysicalTest: builder.mutation<
            AdminPhysicalTestOut,
            AdminPhysicalTestCreateIn
        >({
            query: (body) => ({
                url: "/admin/physical-tests",
                method: "POST",
                body,
            }),
            invalidatesTags: PHYSICAL_TEST_INVALIDATION,
        }),

        updateAdminPhysicalTest: builder.mutation<
            AdminPhysicalTestOut,
            { id: number; body: AdminPhysicalTestUpdateIn }
        >({
            query: ({ id, body }) => ({
                url: `/admin/physical-tests/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_r, _e, { id }) => [
                { type: "AdminPhysicalTests", id },
                ...PHYSICAL_TEST_INVALIDATION,
            ],
        }),

        deactivateAdminPhysicalTest: builder.mutation<AdminPhysicalTestOut, number>({
            query: (id) => ({
                url: `/admin/physical-tests/${id}/deactivate`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "AdminPhysicalTests", id },
                ...PHYSICAL_TEST_INVALIDATION,
            ],
        }),

        reactivateAdminPhysicalTest: builder.mutation<AdminPhysicalTestOut, number>({
            query: (id) => ({
                url: `/admin/physical-tests/${id}/reactivate`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: "AdminPhysicalTests", id },
                ...PHYSICAL_TEST_INVALIDATION,
            ],
        }),
    }),
});

export const {
    useListAdminPhysicalTestCategoriesQuery,
    useListAdminPhysicalTestsQuery,
    useGetAdminPhysicalTestQuery,
    useCreateAdminPhysicalTestMutation,
    useUpdateAdminPhysicalTestMutation,
    useDeactivateAdminPhysicalTestMutation,
    useReactivateAdminPhysicalTestMutation,
} = adminPhysicalTestsApi;
