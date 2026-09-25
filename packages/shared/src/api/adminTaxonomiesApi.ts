/**
 * adminTaxonomiesApi.ts — RTK Query Admin taxonomías (Portal Admin T2).
 *
 * Endpoints T1:
 * - GET/POST /admin/taxonomies/{kind}
 * - GET/PUT /admin/taxonomies/{kind}/{id}
 * - POST .../deactivate | .../reactivate
 */

import { baseApi } from "./baseApi";
import type {
    TaxonomyCreateIn,
    TaxonomyDetailOut,
    TaxonomyItemOut,
    TaxonomyKind,
    TaxonomyListParams,
    TaxonomyPageOut,
    TaxonomyUpdateIn,
    TaxonomyUpdateOut,
} from "../types/adminTaxonomies";

const CATALOG_INVALIDATION = [
    { type: "AdminTaxonomies" as const, id: "LIST" },
    { type: "MovementPattern" as const },
    { type: "MuscleGroup" as const },
    { type: "Equipment" as const },
    { type: "Tag" as const },
    { type: "Action" as const },
    { type: "AdminCatalog" as const },
];

function buildListQuery(params: TaxonomyListParams): string {
    const search = new URLSearchParams();
    if (params.page != null) search.set("page", String(params.page));
    if (params.page_size != null) search.set("page_size", String(params.page_size));
    if (params.q) search.set("q", params.q);
    if (params.include_inactive != null) {
        search.set("include_inactive", String(params.include_inactive));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}

export const adminTaxonomiesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listAdminTaxonomies: builder.query<TaxonomyPageOut, TaxonomyListParams>({
            query: (params) => ({
                url: `/admin/taxonomies/${params.kind}${buildListQuery(params)}`,
                method: "GET",
            }),
            providesTags: (result, _error, arg) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "AdminTaxonomies" as const,
                              id: `${arg.kind}-${id}`,
                          })),
                          { type: "AdminTaxonomies", id: `LIST-${arg.kind}` },
                          { type: "AdminTaxonomies", id: "LIST" },
                      ]
                    : [
                          { type: "AdminTaxonomies", id: `LIST-${arg.kind}` },
                          { type: "AdminTaxonomies", id: "LIST" },
                      ],
        }),

        getAdminTaxonomy: builder.query<
            TaxonomyDetailOut,
            { kind: TaxonomyKind; id: number }
        >({
            query: ({ kind, id }) => ({
                url: `/admin/taxonomies/${kind}/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { kind, id }) => [
                { type: "AdminTaxonomies", id: `${kind}-${id}` },
            ],
        }),

        createAdminTaxonomy: builder.mutation<
            TaxonomyItemOut,
            { kind: TaxonomyKind; body: TaxonomyCreateIn }
        >({
            query: ({ kind, body }) => ({
                url: `/admin/taxonomies/${kind}`,
                method: "POST",
                body,
            }),
            invalidatesTags: CATALOG_INVALIDATION,
        }),

        updateAdminTaxonomy: builder.mutation<
            TaxonomyUpdateOut,
            { kind: TaxonomyKind; id: number; body: TaxonomyUpdateIn }
        >({
            query: ({ kind, id, body }) => ({
                url: `/admin/taxonomies/${kind}/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_r, _e, { kind, id }) => [
                { type: "AdminTaxonomies", id: `${kind}-${id}` },
                ...CATALOG_INVALIDATION,
            ],
        }),

        deactivateAdminTaxonomy: builder.mutation<
            TaxonomyItemOut,
            { kind: TaxonomyKind; id: number }
        >({
            query: ({ kind, id }) => ({
                url: `/admin/taxonomies/${kind}/${id}/deactivate`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, { kind, id }) => [
                { type: "AdminTaxonomies", id: `${kind}-${id}` },
                ...CATALOG_INVALIDATION,
            ],
        }),

        reactivateAdminTaxonomy: builder.mutation<
            TaxonomyItemOut,
            { kind: TaxonomyKind; id: number }
        >({
            query: ({ kind, id }) => ({
                url: `/admin/taxonomies/${kind}/${id}/reactivate`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, { kind, id }) => [
                { type: "AdminTaxonomies", id: `${kind}-${id}` },
                ...CATALOG_INVALIDATION,
            ],
        }),
    }),
});

export const {
    useListAdminTaxonomiesQuery,
    useGetAdminTaxonomyQuery,
    useLazyGetAdminTaxonomyQuery,
    useCreateAdminTaxonomyMutation,
    useUpdateAdminTaxonomyMutation,
    useDeactivateAdminTaxonomyMutation,
    useReactivateAdminTaxonomyMutation,
} = adminTaxonomiesApi;
