/**
 * useAdminTaxonomiesList.ts — URL + listado taxonomías admin (T2).
 */

import { useEffect, useMemo, useState } from "react";
import {
    useListAdminTaxonomiesQuery,
    type TaxonomyKind,
} from "@nexia/shared";
import { useAdminTaxonomiesListUrl } from "@/hooks/useAdminTaxonomiesListUrl";

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminTaxonomiesList(kind: TaxonomyKind) {
    const url = useAdminTaxonomiesListUrl();
    const [searchInput, setSearchInput] = useState(url.q);

    useEffect(() => {
        setSearchInput(url.q);
    }, [url.q]);

    const { q: urlQ, setQ } = url;

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (searchInput.trim() !== urlQ.trim()) {
                setQ(searchInput);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput, urlQ, setQ]);

    const queryParams = useMemo(
        () => ({
            kind,
            ...url.queryParams,
        }),
        [kind, url.queryParams]
    );

    const { data, isLoading, isFetching, isError, refetch } =
        useListAdminTaxonomiesQuery(queryParams);

    const items = useMemo(() => data?.items ?? [], [data]);
    const pageSize = data?.page_size ?? url.queryParams.page_size;
    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

    return {
        searchInput,
        setSearchInput,
        includeInactive: url.includeInactive,
        setIncludeInactive: url.setIncludeInactive,
        hasActiveFilters: url.hasActiveFilters,
        clearFilters: url.clearFilters,
        items,
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
        refetch,
        page: url.page,
        setPage: url.setPage,
        totalPages,
        pageSize,
    };
}
