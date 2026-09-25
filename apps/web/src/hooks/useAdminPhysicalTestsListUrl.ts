/**
 * useAdminPhysicalTestsListUrl.ts — Filtros listado tests físicos en la URL.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { PhysicalTestScope } from "@nexia/shared/types/adminPhysicalTests";

export interface AdminPhysicalTestsListUrlState {
    page: number;
    q: string;
    scope: PhysicalTestScope;
    includeInactive: boolean;
    trainerId: string;
}

export interface AdminPhysicalTestsListUrlApi extends AdminPhysicalTestsListUrlState {
    setPage: (page: number) => void;
    setQ: (q: string) => void;
    setScope: (scope: PhysicalTestScope) => void;
    setIncludeInactive: (value: boolean) => void;
    setTrainerId: (value: string) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    queryParams: {
        scope: PhysicalTestScope;
        page: number;
        page_size: number;
        q?: string;
        include_inactive?: boolean;
        trainer_id?: number;
    };
}

const DEFAULT_PAGE_SIZE = 20;

function parsePage(raw: string | null): number {
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parseScope(raw: string | null): PhysicalTestScope {
    return raw === "trainer" ? "trainer" : "standard";
}

export function useAdminPhysicalTestsListUrl(): AdminPhysicalTestsListUrlApi {
    const [searchParams, setSearchParams] = useSearchParams();

    const state = useMemo<AdminPhysicalTestsListUrlState>(
        () => ({
            page: parsePage(searchParams.get("page")),
            q: searchParams.get("q") ?? "",
            scope: parseScope(searchParams.get("scope")),
            includeInactive: searchParams.get("include_inactive") === "1",
            trainerId: searchParams.get("trainer_id") ?? "",
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

    const setScope = useCallback(
        (scope: PhysicalTestScope) => {
            if (scope === "standard") {
                patchParams({ scope: null, trainer_id: null }, true);
            } else {
                patchParams({ scope: "trainer" }, true);
            }
        },
        [patchParams]
    );

    const setIncludeInactive = useCallback(
        (value: boolean) => {
            patchParams({ include_inactive: value ? "1" : null }, true);
        },
        [patchParams]
    );

    const setTrainerId = useCallback(
        (value: string) => {
            const cleaned = value.trim();
            patchParams({ trainer_id: cleaned || null }, true);
        },
        [patchParams]
    );

    const clearFilters = useCallback(() => {
        const next = new URLSearchParams();
        if (state.scope === "trainer") next.set("scope", "trainer");
        setSearchParams(next, { replace: true });
    }, [setSearchParams, state.scope]);

    const trainerIdNum = Number(state.trainerId);
    const hasTrainerFilter =
        state.scope === "trainer" &&
        state.trainerId.trim() !== "" &&
        Number.isFinite(trainerIdNum) &&
        trainerIdNum > 0;

    const hasActiveFilters =
        state.q.trim() !== "" || state.includeInactive || hasTrainerFilter;

    const queryParams = useMemo(() => {
        const params: AdminPhysicalTestsListUrlApi["queryParams"] = {
            scope: state.scope,
            page: state.page,
            page_size: DEFAULT_PAGE_SIZE,
        };
        if (state.q.trim()) params.q = state.q.trim();
        if (state.includeInactive) params.include_inactive = true;
        if (hasTrainerFilter) params.trainer_id = Math.floor(trainerIdNum);
        return params;
    }, [
        state.scope,
        state.page,
        state.q,
        state.includeInactive,
        hasTrainerFilter,
        trainerIdNum,
    ]);

    return {
        ...state,
        setPage,
        setQ,
        setScope,
        setIncludeInactive,
        setTrainerId,
        clearFilters,
        hasActiveFilters,
        queryParams,
    };
}
