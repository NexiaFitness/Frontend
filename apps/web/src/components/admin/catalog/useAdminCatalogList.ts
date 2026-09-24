/**
 * useAdminCatalogList.ts — Estado y datos del listado Admin de catálogo (§3.1).
 *
 * Contexto: concentra búsqueda con debounce, filtros, paginación y la cola de
 * revisión (sessionStorage) para que la page solo ensamble JSX (agent.md §5).
 *
 * Notas de mantenimiento: los filtros viajan tal cual al contrato
 * `GET /api/v1/admin/catalog/exercises`; no derivar campos que el backend no
 * expone. Al abrir una ficha se persiste el orden visible como cola.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListAdminCatalogExercisesQuery } from "@nexia/shared/api/adminCatalogApi";
import type { AdminCatalogListParams } from "@nexia/shared/types/adminCatalog";
import { useAdminCatalogQueue } from "./useAdminCatalogQueue";

export const ADMIN_CATALOG_PAGE_SIZE = 50;

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminCatalogList() {
    const navigate = useNavigate();
    const { setQueue } = useAdminCatalogQueue();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pendingOnly, setPendingOnly] = useState(false);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [qualityIssuesOnly, setQualityIssuesOnly] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = window.setTimeout(
            () => setDebouncedSearch(search.trim()),
            SEARCH_DEBOUNCE_MS
        );
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, pendingOnly, includeInactive, qualityIssuesOnly]);

    const params = useMemo<AdminCatalogListParams>(
        () => ({
            skip: (page - 1) * ADMIN_CATALOG_PAGE_SIZE,
            limit: ADMIN_CATALOG_PAGE_SIZE,
            search: debouncedSearch || undefined,
            review_status: pendingOnly ? "pending" : undefined,
            include_inactive: includeInactive,
            quality_issues_only: qualityIssuesOnly,
        }),
        [debouncedSearch, includeInactive, page, pendingOnly, qualityIssuesOnly]
    );

    const { data, isLoading, isFetching, isError, refetch } =
        useListAdminCatalogExercisesQuery(params);

    const items = useMemo(() => data?.items ?? [], [data]);

    const issuesCount = useMemo(
        () =>
            items.filter((item) => item.quality_flags.some((flag) => flag !== "OK"))
                .length,
        [items]
    );

    const hasActiveFilters =
        debouncedSearch !== "" || pendingOnly || includeInactive || qualityIssuesOnly;

    const clearFilters = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setPendingOnly(false);
        setIncludeInactive(false);
        setQualityIssuesOnly(false);
        setPage(1);
    }, []);

    /** Abre la ficha guardando el orden visible como cola «Revisado y siguiente». */
    const openExercise = useCallback(
        (exercisePk: number) => {
            setQueue(items.map((item) => item.exercise_pk));
            navigate(`/dashboard/admin/catalog/${exercisePk}`);
        },
        [items, navigate, setQueue]
    );

    const totalPages = Math.max(
        1,
        Math.ceil((data?.total ?? 0) / ADMIN_CATALOG_PAGE_SIZE)
    );

    return {
        search,
        setSearch,
        pendingOnly,
        setPendingOnly,
        includeInactive,
        setIncludeInactive,
        qualityIssuesOnly,
        setQualityIssuesOnly,
        hasActiveFilters,
        clearFilters,
        items,
        total: data?.total ?? 0,
        reviewProgress: data?.review_progress ?? null,
        issuesCount,
        isLoading,
        isFetching,
        isError,
        refetch,
        page,
        setPage,
        totalPages,
        pageSize: ADMIN_CATALOG_PAGE_SIZE,
        openExercise,
    };
}
