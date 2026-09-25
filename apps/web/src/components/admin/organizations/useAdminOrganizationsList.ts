/**
 * useAdminOrganizationsList.ts — Listado G1 con filtros en URL.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useListAdminOrganizationsQuery } from "@nexia/shared/api/adminOrganizationsApi";
import type { AdminOrgStatusFilter } from "@nexia/shared/types/adminOrganizations";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export function useAdminOrganizationsList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const q = searchParams.get("q") ?? "";
    const plan = searchParams.get("plan") ?? "";
    const statusRaw = searchParams.get("status");
    const status: AdminOrgStatusFilter | undefined =
        statusRaw === "active" || statusRaw === "inactive" ? statusRaw : undefined;

    const [localSearch, setLocalSearch] = useState(q);

    useEffect(() => {
        setLocalSearch(q);
    }, [q]);

    const patch = useCallback(
        (updates: Record<string, string | null>, resetPage = false) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (resetPage) next.delete("page");
                    for (const [k, v] of Object.entries(updates)) {
                        if (v == null || v === "") next.delete(k);
                        else next.set(k, v);
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    useEffect(() => {
        const t = window.setTimeout(() => {
            if (localSearch.trim() !== q.trim()) {
                patch({ q: localSearch.trim() || null }, true);
            }
        }, DEBOUNCE_MS);
        return () => window.clearTimeout(t);
    }, [localSearch, q, patch]);

    const { data, isLoading, isError, refetch } = useListAdminOrganizationsQuery({
        page,
        page_size: PAGE_SIZE,
        q: q.trim() || undefined,
        plan: plan.trim() || undefined,
        status,
    });

    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

    return useMemo(
        () => ({
            items: data?.items ?? [],
            total: data?.total ?? 0,
            page,
            totalPages,
            search: localSearch,
            setSearch: setLocalSearch,
            plan,
            setPlan: (value: string) => patch({ plan: value || null }, true),
            status: status ?? "all",
            setStatus: (value: "all" | AdminOrgStatusFilter) =>
                patch({ status: value === "all" ? null : value }, true),
            setPage: (next: number) =>
                patch({ page: next <= 1 ? null : String(next) }),
            isLoading,
            isError,
            refetch: () => {
                void refetch();
            },
            openOrg: (id: number) => navigate(`/dashboard/admin/organizations/${id}`),
        }),
        [
            data,
            page,
            totalPages,
            localSearch,
            plan,
            status,
            patch,
            isLoading,
            isError,
            refetch,
            navigate,
        ]
    );
}
