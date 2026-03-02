/**
 * PaginationBar — Barra de paginación reutilizable (VISTA_CLIENTES_SPEC §10).
 *
 * Contexto:
 * - Diseño: texto "X–Y de Z" a la izquierda; botones Anterior, números de página, Siguiente a la derecha.
 * - Solo visible cuando totalPages > 1. Usar en Clientes y en otras vistas con listas paginadas.
 * - Tokens: text-muted-foreground, bg-primary, text-primary-foreground, bg-surface, border-border.
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

    const buttonBase =
        "inline-flex min-h-touch min-w-touch items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 sm:min-h-8 sm:min-w-8";
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className={cn("flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <p className="text-center text-sm text-muted-foreground sm:text-left">{rangeLabel}</p>
            <nav className="flex items-center justify-center gap-1 overflow-x-auto pb-1 sm:justify-end sm:overflow-visible sm:pb-0" aria-label="Paginación">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage <= 1}
                    className={cn(
                        buttonBase,
                        "shrink-0 text-muted-foreground hover:bg-surface hover:text-foreground"
                    )}
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
                            className={cn(
                                buttonBase,
                                "shrink-0",
                                page === safeCurrentPage
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                            )}
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
                    className={cn(
                        buttonBase,
                        "shrink-0 text-muted-foreground hover:bg-surface hover:text-foreground"
                    )}
                    aria-label="Página siguiente"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </nav>
        </div>
    );
};
