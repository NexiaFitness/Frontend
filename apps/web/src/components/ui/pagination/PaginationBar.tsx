/**
 * PaginationBar — Barra de paginación reutilizable (VISTA_CLIENTES_SPEC §10).
 *
 * Tokens: paginationPresentation.ts (premium · outline-primary).
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    PAGINATION_BAR_SHELL,
    PAGINATION_NAV,
    PAGINATION_NAV_BUTTON_CLASS,
    PAGINATION_PAGE_ACTIVE_CLASS,
    PAGINATION_PAGE_BUTTON_CLASS,
    PAGINATION_RANGE_LABEL,
} from "./paginationPresentation";

export interface PaginationBarProps {
    /** Página actual (1-based). */
    currentPage: number;
    /** Número total de páginas. */
    totalPages: number;
    /** Total de ítems (para el texto "X–Y de Z"). */
    totalItems: number;
    /** Tamaño de página (para calcular X e Y). */
    pageSize: number;
    /** Callback al cambiar de página. */
    onPageChange: (page: number) => void;
    /** Clases adicionales para el contenedor. */
    className?: string;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    className,
}) => {
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endItem = Math.min(safeCurrentPage * pageSize, totalItems);
    const rangeLabel = totalItems === 0 ? "0 de 0" : `${startItem}–${endItem} de ${totalItems}`;

    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className={cn(PAGINATION_BAR_SHELL, className)}>
            <p className={PAGINATION_RANGE_LABEL}>{rangeLabel}</p>
            <nav className={PAGINATION_NAV} aria-label="Paginación">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage <= 1}
                    className={PAGINATION_NAV_BUTTON_CLASS}
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                    {pageNumbers.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={
                                page === safeCurrentPage
                                    ? PAGINATION_PAGE_ACTIVE_CLASS
                                    : PAGINATION_PAGE_BUTTON_CLASS
                            }
                            aria-label={`Página ${page}`}
                            aria-current={page === safeCurrentPage ? "page" : undefined}
                        >
                            {page}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className={PAGINATION_NAV_BUTTON_CLASS}
                    aria-label="Página siguiente"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </nav>
        </div>
    );
};
