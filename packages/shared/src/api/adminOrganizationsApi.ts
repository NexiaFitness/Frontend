/**
 * adminOrganizationsApi.ts — RTK Query /admin/organizations* (G1).
 */

import { baseApi } from "./baseApi";
import type {
    AdminOrgDetailOut,
    AdminOrgsListParams,
    AdminOrgsPageOut,
} from "../types/adminOrganizations";

function buildOrgsQuery(params: AdminOrgsListParams): string {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("page_size", String(params.page_size ?? 20));
    if (params.q?.trim()) search.set("q", params.q.trim());
    if (params.plan?.trim()) search.set("plan", params.plan.trim());
    if (params.status) search.set("status", params.status);
    return search.toString();
}

export const adminOrganizationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listAdminOrganizations: builder.query<AdminOrgsPageOut, AdminOrgsListParams>({
            query: (params) => `/admin/organizations?${buildOrgsQuery(params)}`,
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "AdminOrganizations" as const,
                              id,
                          })),
                          { type: "AdminOrganizations" as const, id: "LIST" },
                      ]
                    : [{ type: "AdminOrganizations" as const, id: "LIST" }],
        }),
        getAdminOrganization: builder.query<AdminOrgDetailOut, number>({
            query: (orgId) => `/admin/organizations/${orgId}`,
            providesTags: (_r, _e, id) => [{ type: "AdminOrganizations", id }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useListAdminOrganizationsQuery,
    useGetAdminOrganizationQuery,
} = adminOrganizationsApi;
