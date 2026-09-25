/**
 * useAdminTaxonomiesListUrl.ts — Filtros del listado taxonomías en la URL.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export interface AdminTaxonomiesListUrlState {
    page: number;
    q: string;
    includeInactive: boolean;
}

export interface AdminTaxonomiesListUrlApi extends AdminTaxonomiesListUrlState {
    setPage: (page: number) => void;
    setQ: (q: string) => void;
    setIncludeInactive: (value: boolean) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    queryParams: {
        page: number;
        page_size: number;
        q?: string;
        include_inactive?: boolean;
    };
}

const DEFAULT_PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function useAdminTaxonomiesListUrl(): AdminTaxonomiesListUrlApi {
    const [searchParams, setSearchParams] = useSearchParams();

    const state = useMemo<AdminTaxonomiesListUrlState>(
        () => ({
            page: parsePage(searchParams.get("page")),
            q: searchParams.get("q") ?? "",
            includeInactive: searchParams.get("include_inactive") === "1",
        }),
        [searchParams]
    );

    const patchParams = useCallback(
        (patch: Record<string, string | null>, resetPage = false) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (resetPage) next.delete("page");
                    for (const [key, value] of Object.entries(patch)) {
                        if (value == null || value === "") next.delete(key);
                        else next.set(key, value);
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

    const setIncludeInactive = useCallback(
        (value: boolean) => {
            patchParams({ include_inactive: value ? "1" : null }, true);
        },
        [patchParams]
    );

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams(), { replace: true });
    }, [setSearchParams]);

    const hasActiveFilters = state.q.trim() !== "" || state.includeInactive;

    const queryParams = useMemo(
        () => ({
            page: state.page,
            page_size: DEFAULT_PAGE_SIZE,
            ...(state.q.trim() ? { q: state.q.trim() } : {}),
            ...(state.includeInactive ? { include_inactive: true } : {}),
        }),
        [state]
    );

    return {
        ...state,
        setPage,
        setQ,
        setIncludeInactive,
        clearFilters,
        hasActiveFilters,
        queryParams,
    };
}
