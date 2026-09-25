/**
 * useAdminDashboard.ts — Datos D1: summary + catalog-health + audit (aislados).
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAdminDashboardSummaryQuery } from "@nexia/shared/api/adminDashboardApi";
import { useGetCatalogHealthQuery } from "@nexia/shared/api/adminApi";
import { useListAdminAuditLogQuery } from "@nexia/shared/api/adminUsersApi";
import type { AdminDashboardSummaryOut } from "@nexia/shared/types/adminDashboard";
import type { CatalogHealthOut } from "@nexia/shared/api/adminApi";
import type { AdminAuditLogItemOut } from "@nexia/shared/types/adminUsers";

/** Lecturas excluidas del widget «escrituras recientes» (UX D1). */
const AUDIT_READ_ACTIONS = new Set(["user_view", "supervision_read"]);

export interface AdminDashboardLinks {
    usersRole: (role: "admin" | "trainer" | "athlete") => string;
    usersStatus: (status: "active" | "suspended") => string;
    usersRoleStatus: (
        role: "admin" | "trainer" | "athlete",
        status: "active" | "suspended"
    ) => string;
    catalog: string;
    audit: string;
    orgs: string;
    orgsPlan: (plan: string) => string;
}

export function useAdminDashboard() {
    const navigate = useNavigate();

    const summary = useGetAdminDashboardSummaryQuery();
    const catalog = useGetCatalogHealthQuery();
    /** Pedimos margen y filtramos lecturas en cliente (reuso de /admin/audit-log). */
    const audit = useListAdminAuditLogQuery({
        page: 1,
        page_size: 50,
        include_supervision: false,
    });

    const links: AdminDashboardLinks = useMemo(
        () => ({
            usersRole: (role) => `/dashboard/admin/users?role=${role}`,
            usersStatus: (status) => `/dashboard/admin/users?status=${status}`,
            usersRoleStatus: (role, status) =>
                `/dashboard/admin/users?role=${role}&status=${status}`,
            catalog: "/dashboard/admin/catalog",
            audit: "/dashboard/admin/operations/audit",
            orgs: "/dashboard/admin/organizations",
            orgsPlan: (plan) =>
                `/dashboard/admin/organizations?plan=${encodeURIComponent(plan)}`,
        }),
        []
    );

    const auditWrites = useMemo(() => {
        const items = (audit.data?.items ?? []) as AdminAuditLogItemOut[];
        return items
            .filter((item) => !AUDIT_READ_ACTIONS.has(item.action))
            .slice(0, 10);
    }, [audit.data?.items]);

    return useMemo(
        () => ({
            summary: {
                data: summary.data as AdminDashboardSummaryOut | undefined,
                isLoading: summary.isLoading,
                isError: summary.isError,
                refetch: () => {
                    void summary.refetch();
                },
            },
            catalog: {
                data: catalog.data as CatalogHealthOut | undefined,
                isLoading: catalog.isLoading,
                isError: catalog.isError,
                refetch: () => {
                    void catalog.refetch();
                },
            },
            audit: {
                items: auditWrites,
                isLoading: audit.isLoading,
                isError: audit.isError,
                refetch: () => {
                    void audit.refetch();
                },
            },
            links,
            go: (path: string) => navigate(path),
        }),
        [summary, catalog, audit, auditWrites, links, navigate]
    );
}
