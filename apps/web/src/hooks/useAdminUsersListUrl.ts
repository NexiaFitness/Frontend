/**
 * useAdminUsersListUrl.ts — Sincroniza filtros del listado usuarios con la URL.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminRoleFilter, AdminStatusFilter } from "@nexia/shared/types/adminUsers";

export type AdminUsersRoleSegment = "all" | AdminRoleFilter;
export type AdminUsersStatusSegment = "all" | AdminStatusFilter | "locked";
export type AdminUsersVerifiedSegment = "all" | "yes" | "no";

export interface AdminUsersListUrlState {
    page: number;
    q: string;
    roleSegment: AdminUsersRoleSegment;
    statusSegment: AdminUsersStatusSegment;
    verifiedSegment: AdminUsersVerifiedSegment;
}

export interface AdminUsersListUrlApi extends AdminUsersListUrlState {
    setPage: (page: number) => void;
    setQ: (q: string) => void;
    setRoleSegment: (segment: AdminUsersRoleSegment) => void;
    setStatusSegment: (segment: AdminUsersStatusSegment) => void;
    setVerifiedSegment: (segment: AdminUsersVerifiedSegment) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    queryParams: {
        page: number;
        page_size: number;
        q?: string;
        role?: AdminRoleFilter;
        status?: AdminStatusFilter;
        locked?: boolean;
        is_verified?: boolean;
    };
}

const DEFAULT_PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parseRole(raw: string | null): AdminUsersRoleSegment {
    if (raw === "admin" || raw === "trainer" || raw === "athlete") return raw;
    return "all";
}

function parseStatus(raw: string | null): AdminUsersStatusSegment {
    if (raw === "active" || raw === "suspended" || raw === "locked") return raw;
    return "all";
}

function parseVerified(raw: string | null): AdminUsersVerifiedSegment {
    if (raw === "yes" || raw === "no") return raw;
    return "all";
}

export function adminUsersListUrlToQuery(state: AdminUsersListUrlState): AdminUsersListUrlApi["queryParams"] {
    const params: AdminUsersListUrlApi["queryParams"] = {
        page: state.page,
        page_size: DEFAULT_PAGE_SIZE,
    };
    const q = state.q.trim();
    if (q) params.q = q;
    if (state.roleSegment !== "all") params.role = state.roleSegment;
    if (state.statusSegment === "active" || state.statusSegment === "suspended") {
        params.status = state.statusSegment;
    }
    if (state.statusSegment === "locked") params.locked = true;
    if (state.verifiedSegment === "yes") params.is_verified = true;
    if (state.verifiedSegment === "no") params.is_verified = false;
    return params;
}

export function useAdminUsersListUrl(): AdminUsersListUrlApi {
    const [searchParams, setSearchParams] = useSearchParams();

    const state = useMemo<AdminUsersListUrlState>(
        () => ({
            page: parsePage(searchParams.get("page")),
            q: searchParams.get("q") ?? "",
            roleSegment: parseRole(searchParams.get("role")),
            statusSegment: parseStatus(searchParams.get("status")),
            verifiedSegment: parseVerified(searchParams.get("verified")),
        }),
        [searchParams]
    );

    const patchParams = useCallback(
        (patch: Record<string, string | null>, resetPage = false) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (resetPage) {
                        next.delete("page");
                    }
                    for (const [key, value] of Object.entries(patch)) {
                        if (value == null || value === "") {
                            next.delete(key);
                        } else {
                            next.set(key, value);
                        }
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const setPage = useCallback(
        (page: number) => {
            patchParams({ page: page <= 1 ? null : String(page) });
        },
        [patchParams]
    );

    const setQ = useCallback(
        (q: string) => {
            patchParams({ q: q.trim() || null }, true);
        },
        [patchParams]
    );

    const setRoleSegment = useCallback(
        (segment: AdminUsersRoleSegment) => {
            patchParams({ role: segment === "all" ? null : segment }, true);
        },
        [patchParams]
    );

    const setStatusSegment = useCallback(
        (segment: AdminUsersStatusSegment) => {
            patchParams({ status: segment === "all" ? null : segment }, true);
        },
        [patchParams]
    );

    const setVerifiedSegment = useCallback(
        (segment: AdminUsersVerifiedSegment) => {
            patchParams(
                { verified: segment === "all" ? null : segment === "yes" ? "yes" : segment === "no" ? "no" : null },
                true
            );
        },
        [patchParams]
    );

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams(), { replace: true });
    }, [setSearchParams]);

    const hasActiveFilters =
        state.q.trim() !== "" ||
        state.roleSegment !== "all" ||
        state.statusSegment !== "all" ||
        state.verifiedSegment !== "all";

    const queryParams = useMemo(() => adminUsersListUrlToQuery(state), [state]);

    return {
        ...state,
        setPage,
        setQ,
        setRoleSegment,
        setStatusSegment,
        setVerifiedSegment,
        clearFilters,
        hasActiveFilters,
        queryParams,
    };
}
