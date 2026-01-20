/**
 * usePagination.ts — Hook reutilizable para paginación
 *
 * Contexto:
 * - Maneja estado y lógica de paginación
 * - Calcula items paginados automáticamente
 * - Resetea a página 1 cuando cambian los items
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import { useState, useMemo, useEffect, useCallback } from "react";

interface UsePaginationOptions<T> {
    items: T[];
    itemsPerPage: number;
    resetOnItemsChange?: boolean;
}

interface UsePaginationResult<T> {
    currentPage: number;
    totalPages: number;
    paginatedItems: T[];
    totalItems: number;
    startItem: number;
    endItem: number;
    setPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    goToFirstPage: () => void;
    goToLastPage: () => void;
}

export function usePagination<T>({
    items,
    itemsPerPage,
    resetOnItemsChange = true,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Calcular items paginados
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    }, [items, currentPage, itemsPerPage]);

    // Calcular índices para mostrar
    const startItem = useMemo(() => {
        return totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    }, [currentPage, itemsPerPage, totalItems]);

    const endItem = useMemo(() => {
        return Math.min(currentPage * itemsPerPage, totalItems);
    }, [currentPage, itemsPerPage, totalItems]);

    // Resetear a página 1 si cambian los items y la página actual no existe
    useEffect(() => {
        if (resetOnItemsChange) {
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(1);
            }
        }
    }, [totalItems, currentPage, totalPages, resetOnItemsChange]);

    const setPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, totalPages]);

    const previousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    }, [currentPage]);

    const goToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    const goToLastPage = useCallback(() => {
        setCurrentPage(totalPages);
    }, [totalPages]);

    return {
        currentPage,
        totalPages,
        paginatedItems,
        totalItems,
        startItem,
        endItem,
        setPage,
        nextPage,
        previousPage,
        goToFirstPage,
        goToLastPage,
    };
}





