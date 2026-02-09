/**
 * Pagination.tsx — Componente de paginación simple
 *
 * Contexto:
 * - Muestra controles de paginación con flechas y contador
 * - Diseño limpio y profesional
 * - Responsive
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePrevious = (): void => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = (): void => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-t border-slate-200 bg-white rounded-b-xl">
            <div className="text-sm text-slate-600">
                Mostrando <span className="font-semibold">{startItem}</span> - <span className="font-semibold">{endItem}</span> de <span className="font-semibold">{totalItems}</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`
                        p-2 rounded-lg transition-colors
                        ${currentPage === 1
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }
                    `}
                    aria-label="Página anterior"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                {/* Indicador de página */}
                <span className="text-sm text-slate-600 px-3">
                    Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
                </span>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`
                        p-2 rounded-lg transition-colors
                        ${currentPage === totalPages
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }
                    `}
                    aria-label="Página siguiente"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

