/**
 * Pagination.tsx — Wrapper de PaginationBar (compatibilidad)
 *
 * Usa PaginationBar internamente. Props itemsPerPage se mapea a pageSize.
 * Todas las vistas deben usar PaginationBar directamente para consistencia.
 *
 * @author Frontend Team
 * @since v6.0.0
 * @deprecated Usar PaginationBar directamente
 */

import React from "react";
import { PaginationBar } from "./PaginationBar";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = (props) => (
    <PaginationBar
        currentPage={props.currentPage}
        totalPages={props.totalPages}
        totalItems={props.totalItems}
        pageSize={props.itemsPerPage}
        onPageChange={props.onPageChange}
    />
);
