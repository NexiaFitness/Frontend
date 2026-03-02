/**
 * useClientsListWithMetrics.ts — Hook para lista de clientes con métricas (Vista Clientes).
 *
 * Contexto:
 * - Encapsula useGetClientsWithMetricsQuery con parámetros page, page_size, search, status, trainer_id.
 * - Expone totalPages, safeCurrentPage y rangeLabel para paginación según VISTA_CLIENTES_SPEC §10.
 * - La vista debe mantener currentPage en estado y pasarlo al hook; al cambiar filtros/search se resetea a 1.
 *
 * @author Frontend Team
 * @since v4.5.0
 */

import { useMemo } from "react";
import { useGetClientsWithMetricsQuery } from "../../api/clientsApi";
import type { ClientListItem, ClientStatus } from "../../types/client";

export interface UseClientsListWithMetricsParams {
    /** Trainer para filtrar; si no se pasa, el backend usa el del token. */
    trainerId?: number | null;
    /** Página actual (1-based). */
    page: number;
    /** Tamaño de página (VISTA_CLIENTES_SPEC §10: 9 para esta vista). */
    pageSize: number;
    /** Búsqueda por nombre o email (server-side). */
    search?: string | null;
    /** Filtro por estado cuando el backend lo soporte. */
    status?: ClientStatus | null;
    /** Si true, no se ejecuta la query (ej. sin trainer resuelto). */
    skip?: boolean;
}

export interface UseClientsListWithMetricsResult {
    items: ClientListItem[];
    total: number;
    page: number;
    page_size: number;
    has_more: boolean;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
    /** totalPages = Math.max(1, ceil(total / pageSize)). */
    totalPages: number;
    /** safeCurrentPage = min(page, totalPages) para evitar página inválida. */
    safeCurrentPage: number;
    /** Texto "X–Y de Z" para la barra de paginación. */
    rangeLabel: string;
}

export function useClientsListWithMetrics({
    trainerId,
    page,
    pageSize,
    search,
    status,
    skip = false,
}: UseClientsListWithMetricsParams): UseClientsListWithMetricsResult {
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetClientsWithMetricsQuery(
        {
            page,
            page_size: pageSize,
            search: search ?? undefined,
            trainer_id: trainerId ?? undefined,
            status: status ?? undefined,
        },
        { skip },
    );

    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safeCurrentPage = Math.min(page, totalPages);
    const startItem = total === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endItem = Math.min(safeCurrentPage * pageSize, total);
    const rangeLabel = total === 0 ? "0 de 0" : `${startItem}–${endItem} de ${total}`;

    const items = useMemo(() => data?.items ?? [], [data?.items]);

    return {
        items,
        total,
        page: data?.page ?? page,
        page_size: data?.page_size ?? pageSize,
        has_more: data?.has_more ?? false,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        totalPages,
        safeCurrentPage,
        rangeLabel,
    };
}
