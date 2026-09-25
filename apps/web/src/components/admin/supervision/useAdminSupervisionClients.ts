/**
 * useAdminSupervisionClients.ts — Lista paginada de clientes de un entrenador (SUP F1).
 */

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetClientsWithMetricsQuery } from "@nexia/shared/api/clientsApi";
import type { ClientListItem } from "@nexia/shared/types/client";

const PAGE_SIZE = 15;

export interface UseAdminSupervisionClientsArgs {
    trainerId: number | null | undefined;
    enabled?: boolean;
}

export interface UseAdminSupervisionClientsResult {
    items: ClientListItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    search: string;
    setSearch: (value: string) => void;
    setPage: (page: number) => void;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
}

export function useAdminSupervisionClients({
    trainerId,
    enabled = true,
}: UseAdminSupervisionClientsArgs): UseAdminSupervisionClientsResult {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("sup_page")) || 1);
    const search = searchParams.get("sup_q") ?? "";
    const [localSearch, setLocalSearch] = useState(search);

    const skip = !enabled || trainerId == null || trainerId <= 0;

    const { data, isLoading, isError, refetch } = useGetClientsWithMetricsQuery(
        {
            page,
            page_size: PAGE_SIZE,
            search: search.trim() || null,
            trainer_id: trainerId ?? null,
        },
        { skip }
    );

    const setPage = useCallback(
        (nextPage: number) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (nextPage <= 1) next.delete("sup_page");
                    else next.set("sup_page", String(nextPage));
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const setSearch = useCallback(
        (value: string) => {
            setLocalSearch(value);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("sup_page");
                    if (!value.trim()) next.delete("sup_q");
                    else next.set("sup_q", value.trim());
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return useMemo(
        () => ({
            items: data?.items ?? [],
            total,
            page,
            pageSize: PAGE_SIZE,
            totalPages,
            search: localSearch,
            setSearch,
            setPage,
            isLoading: skip ? false : isLoading,
            isError: skip ? false : isError,
            refetch: () => {
                void refetch();
            },
        }),
        [
            data?.items,
            total,
            page,
            totalPages,
            localSearch,
            setSearch,
            setPage,
            skip,
            isLoading,
            isError,
            refetch,
        ]
    );
}
