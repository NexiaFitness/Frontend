/**
 * DetailSeriesTable.tsx — Tabla compacta de series planificadas / reales.
 *
 * Columnas:
 * - Etiqueta (S1, MAIN, R1…)
 * - Reps / Tiempo planificado
 * - Esfuerzo planificado
 * - Descanso
 * - Reps real (si hay datos en alguna fila)
 * - Peso movido (si hay datos en alguna fila)
 * - RPE percibido (si hay datos en alguna fila)
 *
 * Las columnas opcionales se ocultan automáticamente si todas las filas tienen
 * valor nulo, para mantener la tabla limpia.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React, { useMemo } from "react";
import type { SessionExerciseSetView } from "@nexia/shared";
import { cn } from "@/lib/utils";

export interface DetailSeriesRow extends SessionExerciseSetView {
    /** Override opcional de la etiqueta (por ej. en EMOM mostramos V1). */
    overrideLabel?: string;
}

export interface DetailSeriesTableProps {
    rows: DetailSeriesRow[];
    /** Cabecera personalizada de la primera columna. Por defecto "Serie". */
    firstColumnLabel?: string;
    /** Si true, oculta la columna de descanso (útil en grupos sin descanso entre series). */
    hideRestColumn?: boolean;
    className?: string;
}

function formatReps(setRow: SessionExerciseSetView): string | null {
    if (setRow.plannedReps) return setRow.plannedReps;
    if (setRow.plannedDuration != null) return `${setRow.plannedDuration}s`;
    return null;
}

function formatRest(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds <= 0) return "0s";
    if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}'`;
    return `${seconds}s`;
}

function formatEffort(
    character: SessionExerciseSetView["effortCharacter"],
    value: number | null
): string | null {
    if (value == null) return character ? character.toUpperCase() : null;
    if (!character) return String(value);
    switch (character) {
        case "rpe":
            return `RPE ${value}`;
        case "rir":
            return `RIR ${value}`;
        case "velocity_loss":
            return `VL ${value}%`;
        case "pct_rm":
            return `${value}% 1RM`;
        default:
            return `${value}`;
    }
}

export const DetailSeriesTable: React.FC<DetailSeriesTableProps> = ({
    rows,
    firstColumnLabel = "Serie",
    hideRestColumn = false,
    className,
}) => {
    const showActualReps = useMemo(
        () => rows.some((r) => r.actualReps != null && r.actualReps !== ""),
        [rows]
    );
    const showActualWeight = useMemo(
        () => rows.some((r) => r.actualWeight != null),
        [rows]
    );
    const showActualEffort = useMemo(
        () => rows.some((r) => r.actualEffortValue != null),
        [rows]
    );

    const showRest = !hideRestColumn && rows.some((r) => r.plannedRest != null);

    return (
        <div className={cn("overflow-x-auto rounded-md border border-border/50", className)}>
            <table className="min-w-full text-xs">
                <thead className="bg-surface/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                    <tr>
                        <th className="px-3 py-2 text-left">{firstColumnLabel}</th>
                        <th className="px-3 py-2 text-left">Reps / Tiempo</th>
                        <th className="px-3 py-2 text-left">Esfuerzo</th>
                        {showRest && <th className="px-3 py-2 text-left">Descanso</th>}
                        {showActualReps && (
                            <th className="px-3 py-2 text-left">Reps real</th>
                        )}
                        {showActualWeight && (
                            <th className="px-3 py-2 text-left">Peso movido</th>
                        )}
                        {showActualEffort && (
                            <th className="px-3 py-2 text-left">RPE percibido</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {rows.map((row) => {
                        const repsText = formatReps(row) ?? "—";
                        const effortText = formatEffort(row.effortCharacter, row.effortValue) ?? "—";
                        const restText = formatRest(row.plannedRest) ?? "—";
                        const actualRepsText = row.actualReps ?? "—";
                        const actualWeightText = row.actualWeight != null ? `${row.actualWeight} kg` : "—";
                        const actualEffortText = row.actualEffortValue != null ? `${row.actualEffortValue}` : "—";

                        return (
                            <tr key={`${row.sourceLineId}-${row.index}-${row.label}`} className="bg-card">
                                <td className="px-3 py-2 font-semibold text-foreground">
                                    {row.overrideLabel ?? row.label}
                                </td>
                                <td className="px-3 py-2 text-foreground">{repsText}</td>
                                <td className="px-3 py-2 text-muted-foreground">{effortText}</td>
                                {showRest && (
                                    <td className="px-3 py-2 text-muted-foreground">{restText}</td>
                                )}
                                {showActualReps && (
                                    <td className="px-3 py-2 text-foreground">{actualRepsText}</td>
                                )}
                                {showActualWeight && (
                                    <td className="px-3 py-2 text-foreground">{actualWeightText}</td>
                                )}
                                {showActualEffort && (
                                    <td className="px-3 py-2 text-foreground">{actualEffortText}</td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
