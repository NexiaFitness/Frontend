/**
 * useAdminPhysicalTestsList.ts — Datos y debounce listado Admin tests físicos (T2).
 */

import { useEffect, useMemo, useState } from "react";
import { useListAdminPhysicalTestsQuery } from "@nexia/shared/api/adminPhysicalTestsApi";
import { useAdminPhysicalTestsListUrl } from "@/hooks/useAdminPhysicalTestsListUrl";

const SEARCH_DEBOUNCE_MS = 300;

export function useAdminPhysicalTestsList() {
    const url = useAdminPhysicalTestsListUrl();
    const [searchInput, setSearchInput] = useState(url.q);
    const [trainerInput, setTrainerInput] = useState(url.trainerId);

    useEffect(() => {
        setSearchInput(url.q);
    }, [url.q]);

    useEffect(() => {
        setTrainerInput(url.trainerId);
    }, [url.trainerId]);

    const { q: urlQ, setQ, trainerId: urlTrainerId, setTrainerId } = url;

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (searchInput.trim() !== urlQ.trim()) {
                setQ(searchInput);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput, urlQ, setQ]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (trainerInput.trim() !== urlTrainerId.trim()) {
                setTrainerId(trainerInput);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [trainerInput, urlTrainerId, setTrainerId]);

    const { data, isLoading, isFetching, isError, isSuccess, refetch } =
        useListAdminPhysicalTestsQuery(url.queryParams);

    const items = useMemo(() => data?.items ?? [], [data]);
    const pageSize = data?.page_size ?? url.queryParams.page_size;
    const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
    const showSkeleton = isLoading && !isSuccess;

    return {
        searchInput,
        setSearchInput,
        trainerInput,
        setTrainerInput,
        ...url,
        items,
        total: data?.total ?? 0,
        isLoading: showSkeleton,
        isFetching,
        isError,
        refetch,
        totalPages,
        pageSize,
    };
}
