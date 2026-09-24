/**
 * useAdminUsersList.ts — Datos y debounce del listado Admin usuarios (U2).
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListAdminUsersQuery } from "@nexia/shared/api/adminUsersApi";
import { useAdminUsersListUrl } from "@/hooks/useAdminUsersListUrl";

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminUsersList() {
    const navigate = useNavigate();
    const url = useAdminUsersListUrl();
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

    const { data, isLoading, isFetching, isError, refetch } = useListAdminUsersQuery(url.queryParams);

    const items = useMemo(() => data?.items ?? [], [data]);
    const pageSize = data?.page_size ?? url.queryParams.page_size;
    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

    const openUser = (userId: number) => {
        navigate(`/dashboard/admin/users/${userId}`);
    };

    return {
        searchInput,
        setSearchInput,
        ...url,
        items,
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
        refetch,
        totalPages,
        pageSize,
        openUser,
    };
}
