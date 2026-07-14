/**
 * detailTableCells.tsx — Celdas y colgroup de tablas read-only de sesión.
 *
 * Usa constantes de detailTableLayout.ts. Cuadrícula compartida entre todos
 * los tipos de serie para alinear Reps/Tiempo y Esfuerzo.
 *
 * @author Frontend Team
 * @since v6.6.1
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    DETAIL_EFFORT_COL_CLASS,
    DETAIL_REST_COL_CLASS,
    DETAIL_REPS_COL_CLASS,
    DETAIL_ROUND_COL_CLASS,
    type DetailTableColGroupProps,
} from "./detailTableLayout";

export function DetailTableColGroup({
    includeRoundColumn = true,
    includeRestColumn = true,
    trailingColumnCount = 0,
}: DetailTableColGroupProps) {
    return (
        <colgroup>
            {includeRoundColumn && <col className={DETAIL_ROUND_COL_CLASS} />}
            <col />
            <col className={DETAIL_REPS_COL_CLASS} />
            <col className={DETAIL_EFFORT_COL_CLASS} />
            {includeRestColumn && <col className={DETAIL_REST_COL_CLASS} />}
            {trailingColumnCount > 0 &&
                Array.from({ length: trailingColumnCount }).map((_, i) => (
                    <col key={i} className="w-[88px]" />
                ))}
        </colgroup>
    );
}

export function DetailRoundHeaderCell({ showLabel = false }: { showLabel?: boolean }) {
    return (
        <th className={cn(DETAIL_ROUND_COL_CLASS, "px-2 py-2 text-center")}>
            {showLabel ? "Ronda" : "\u00a0"}
        </th>
    );
}

export function DetailRoundBodyCell() {
    return <td className={cn(DETAIL_ROUND_COL_CLASS, "px-2 py-2")} aria-hidden />;
}

export function DetailLeadHeaderCell({ label }: { label: string }) {
    return <th className="px-3 py-2 text-left">{label}</th>;
}

export function DetailRepsHeaderCell() {
    return (
        <th className={cn(DETAIL_REPS_COL_CLASS, "px-3 py-2 text-right")}>Reps / Tiempo</th>
    );
}

export function DetailEffortHeaderCell() {
    return (
        <th className={cn(DETAIL_EFFORT_COL_CLASS, "px-3 py-2 text-right")}>Esfuerzo</th>
    );
}

export function DetailRestHeaderCell({ showLabel = true }: { showLabel?: boolean }) {
    return (
        <th className={cn(DETAIL_REST_COL_CLASS, "px-3 py-2 text-right")}>
            {showLabel ? "Descanso" : "\u00a0"}
        </th>
    );
}

export function DetailRepsCell({ children }: { children: React.ReactNode }) {
    return (
        <td className={cn(DETAIL_REPS_COL_CLASS, "px-3 py-2 text-right align-middle")}>
            <span className="text-sm font-semibold text-foreground tabular-nums">{children}</span>
        </td>
    );
}

export function DetailEffortCell({ children }: { children: React.ReactNode }) {
    return (
        <td className={cn(DETAIL_EFFORT_COL_CLASS, "px-3 py-2 text-right align-middle")}>
            <span className="text-xs font-medium text-muted-foreground">{children}</span>
        </td>
    );
}

export function DetailRestCell({ children }: { children: React.ReactNode }) {
    return (
        <td className={cn(DETAIL_REST_COL_CLASS, "px-3 py-2 text-right align-middle")}>
            <span className="text-xs font-medium text-muted-foreground">{children}</span>
        </td>
    );
}

export function DetailRestEmptyCell() {
    return (
        <td className={cn(DETAIL_REST_COL_CLASS, "px-3 py-2 text-right align-middle")} aria-hidden>
            {"\u00a0"}
        </td>
    );
}

export function DetailRoundLabelCell({
    label,
    rowSpan,
}: {
    label: string;
    rowSpan?: number;
}) {
    return (
        <td
            rowSpan={rowSpan}
            className={cn(
                DETAIL_ROUND_COL_CLASS,
                "border-r border-border/40 bg-surface/40 px-2 py-2 text-center align-middle"
            )}
        >
            <span className="text-xs font-bold text-foreground">{label}</span>
        </td>
    );
}
