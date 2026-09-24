/**
 * adminUsersApi.ts — RTK Query Admin usuarios y auditoría (Portal Admin U2).
 *
 * Endpoints U1:
 * - GET /admin/users
 * - GET /admin/users/{id}
 * - POST /admin/users/admins
 * - POST /admin/users/{id}/suspend|activate|force-logout|set-password
 * - GET /admin/audit-log
 */

import { baseApi } from "./baseApi";
import type {
    AdminActionResultOut,
    AdminAuditLogListParams,
    AdminAuditLogPageOut,
    AdminCreateRequest,
    AdminReasonRequest,
    AdminSetPasswordRequest,
    AdminUserDetailOut,
    AdminUsersListParams,
    AdminUsersPageOut,
} from "../types/adminUsers";

function buildUsersQuery(params: AdminUsersListParams): string {
    const search = new URLSearchParams();
    if (params.page != null) search.set("page", String(params.page));
    if (params.page_size != null) search.set("page_size", String(params.page_size));
    if (params.role) search.set("role", params.role);
    if (params.status) search.set("status", params.status);
    if (params.is_verified != null) search.set("is_verified", String(params.is_verified));
    if (params.locked != null) search.set("locked", String(params.locked));
    if (params.q) search.set("q", params.q);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}

function buildAuditQuery(params: AdminAuditLogListParams): string {
    const search = new URLSearchParams();
    if (params.page != null) search.set("page", String(params.page));
    if (params.page_size != null) search.set("page_size", String(params.page_size));
    if (params.actor_user_id != null) {
        search.set("actor_user_id", String(params.actor_user_id));
    }
    if (params.target_user_id != null) {
        search.set("target_user_id", String(params.target_user_id));
    }
    if (params.action) search.set("action", params.action);
    if (params.desde) search.set("desde", params.desde);
    if (params.hasta) search.set("hasta", params.hasta);
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}

export const adminUsersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listAdminUsers: builder.query<AdminUsersPageOut, AdminUsersListParams>({
            query: (params) => ({
                url: `/admin/users${buildUsersQuery(params)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "AdminUsers" as const,
                              id,
                          })),
                          { type: "AdminUsers", id: "LIST" },
                      ]
                    : [{ type: "AdminUsers", id: "LIST" }],
        }),

        getAdminUser: builder.query<AdminUserDetailOut, number>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, userId) => [{ type: "AdminUsers", id: userId }],
        }),

        createAdminUser: builder.mutation<AdminUserDetailOut, AdminCreateRequest>({
            query: (body) => ({
                url: "/admin/users/admins",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "AdminUsers", id: "LIST" }, { type: "AdminAuditLog", id: "LIST" }],
        }),

        suspendAdminUser: builder.mutation<
            AdminActionResultOut,
            { userId: number; body: AdminReasonRequest }
        >({
            query: ({ userId, body }) => ({
                url: `/admin/users/${userId}/suspend`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, { userId }) => [
                { type: "AdminUsers", id: userId },
                { type: "AdminUsers", id: "LIST" },
                { type: "AdminAuditLog", id: "LIST" },
            ],
        }),

        activateAdminUser: builder.mutation<
            AdminActionResultOut,
            { userId: number; body: AdminReasonRequest }
        >({
            query: ({ userId, body }) => ({
                url: `/admin/users/${userId}/activate`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, { userId }) => [
                { type: "AdminUsers", id: userId },
                { type: "AdminUsers", id: "LIST" },
                { type: "AdminAuditLog", id: "LIST" },
            ],
        }),

        forceLogoutAdminUser: builder.mutation<
            AdminActionResultOut,
            { userId: number; body: AdminReasonRequest }
        >({
            query: ({ userId, body }) => ({
                url: `/admin/users/${userId}/force-logout`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, { userId }) => [
                { type: "AdminUsers", id: userId },
                { type: "AdminAuditLog", id: "LIST" },
            ],
        }),

        setAdminUserPassword: builder.mutation<
            AdminActionResultOut,
            { userId: number; body: AdminSetPasswordRequest }
        >({
            query: ({ userId, body }) => ({
                url: `/admin/users/${userId}/set-password`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, { userId }) => [
                { type: "AdminUsers", id: userId },
                { type: "AdminAuditLog", id: "LIST" },
            ],
        }),

        listAdminAuditLog: builder.query<AdminAuditLogPageOut, AdminAuditLogListParams>({
            query: (params) => ({
                url: `/admin/audit-log${buildAuditQuery(params)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.items.map(({ id }) => ({
                              type: "AdminAuditLog" as const,
                              id,
                          })),
                          { type: "AdminAuditLog", id: "LIST" },
                      ]
                    : [{ type: "AdminAuditLog", id: "LIST" }],
        }),
    }),
});

export const {
    useListAdminUsersQuery,
    useGetAdminUserQuery,
    useCreateAdminUserMutation,
    useSuspendAdminUserMutation,
    useActivateAdminUserMutation,
    useForceLogoutAdminUserMutation,
    useSetAdminUserPasswordMutation,
    useListAdminAuditLogQuery,
} = adminUsersApi;
