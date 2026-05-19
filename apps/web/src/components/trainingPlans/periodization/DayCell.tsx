/**
 * DayCell.tsx — Celda de día con chips de patrones asignados + popover de selección.
 *
 * Primitivo reutilizable extraído de PeriodizationWeeklyStructureDraft para servir
 * tanto al draft inline (panel de periodización) como al modal matriz semana × día
 * (spec: docs/specs/estructura-semanal/02_SPEC_TECNICO_MODAL.md §4.3).
 *
 * Reglas:
 * - Solo renderiza los patrones asignados al día; el catálogo completo aparece
 *   al abrir el popover por el botón "+".
 * - El estado abierto/cerrado del popover lo gestiona el padre (`isOpen` + `onOpen`
 *   + `onClose`) para coordinarse con otras celdas (solo un popover a la vez).
 */

import React from "react";
import { Plus, X } from "lucide-react";

import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureDayPatternInput } from "@nexia/shared/types/weeklyStructure";

import { PatternBadge } from "./PatternBadge";
import { PatternSelectorPopover } from "./PatternSelectorPopover";

function formatDateShort(dateISO: string): string {
    const [y, m, d] = dateISO.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
    });
}

export type DayCellLayout = "cell" | "row";

export interface DayCellProps {
    weekOrdinal: number;
    dayOfWeek: number;
    dateISO: string;
    dayName: string;
    assignedPatterns: WeeklyStructureDayPatternInput[];
    catalog: MovementPattern[];
    catalogLoading?: boolean;
    catalogError?: boolean;
    isPopoverOpen: boolean;
    onOpenPopover: () => void;
    onClosePopover: () => void;
    onToggle: (patternId: number) => void;
    /**
     * "cell": layout vertical (titulo arriba, chips abajo) usado en la matriz
     * semana x dia o como tarjeta apilada.
     * "row":  layout horizontal en una sola linea (titulo a la izquierda,
     * patrones/estado en el centro, boton "+" a la derecha) usado en el
     * acordeon de semanas del modal.
     */
    layout?: DayCellLayout;
    /** Layout del wrapper externo (lista vertical, celda de matriz, …). */
    className?: string;
    /** Layout opcional del popover (posicionamiento). */
    popoverClassName?: string;
}

export const DayCell: React.FC<DayCellProps> = ({
    dayOfWeek,
    dateISO,
    dayName,
    assignedPatterns,
    catalog,
    catalogLoading,
    catalogError,
    isPopoverOpen,
    onOpenPopover,
    onClosePopover,
    onToggle,
    layout = "cell",
    className,
    popoverClassName,
}) => {
    const popover = (
        <PatternSelectorPopover
            isOpen={isPopoverOpen}
            onClose={onClosePopover}
            catalog={catalog}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            selectedPatternIds={assignedPatterns.map(
                (p) => p.movement_pattern_id,
            )}
            onToggle={onToggle}
            className={popoverClassName}
        />
    );

    if (layout === "row") {
        const wrapperClass = className
            ?? "flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-surface-2/40 transition-colors";
        return (
            <div className={wrapperClass} data-day-of-week={dayOfWeek}>
                <div className="w-20 shrink-0">
                    <p className="text-sm font-semibold text-foreground capitalize">
                        {dayName.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {formatDateShort(dateISO)}
                    </p>
                </div>
                <div className="flex-1 min-w-0">
                    {assignedPatterns.length === 0 ? (
                        <p className="text-xs italic text-muted-foreground">
                            Sin patrones asignados
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {assignedPatterns.map((dp) => {
                                const pattern = catalog.find(
                                    (p) => p.id === dp.movement_pattern_id,
                                );
                                if (!pattern) return null;
                                return (
                                    <span
                                        key={dp.movement_pattern_id}
                                        className="inline-flex items-center gap-1"
                                    >
                                        <PatternBadge
                                            name={pattern.name_es || pattern.name_en}
                                            uiBucket={pattern.ui_bucket}
                                            active
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onToggle(dp.movement_pattern_id)
                                            }
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                            aria-label="Quitar patrón"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() =>
                            isPopoverOpen ? onClosePopover() : onOpenPopover()
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`Añadir patrones a ${dayName}`}
                        aria-expanded={isPopoverOpen}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    {popover}
                </div>
            </div>
        );
    }

    const wrapperClass = className
        ?? "rounded-md border border-border/60 bg-surface-2/40 p-2.5 space-y-2";

    return (
        <div className={wrapperClass} data-day-of-week={dayOfWeek}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-foreground">{dayName}</p>
                    <p className="text-[10px] text-muted-foreground">
                        {formatDateShort(dateISO)}
                    </p>
                </div>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => (isPopoverOpen ? onClosePopover() : onOpenPopover())}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 px-2 py-1 text-[11px] text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`Añadir patrones a ${dayName}`}
                        aria-expanded={isPopoverOpen}
                    >
                        <Plus className="h-3 w-3" />
                        Añadir patrón
                    </button>
                    {popover}
                </div>
            </div>
            {assignedPatterns.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {assignedPatterns.map((dp) => {
                        const pattern = catalog.find(
                            (p) => p.id === dp.movement_pattern_id,
                        );
                        if (!pattern) return null;
                        return (
                            <span
                                key={dp.movement_pattern_id}
                                className="inline-flex items-center gap-1"
                            >
                                <PatternBadge
                                    name={pattern.name_es || pattern.name_en}
                                    uiBucket={pattern.ui_bucket}
                                    active
                                />
                                <button
                                    type="button"
                                    onClick={() => onToggle(dp.movement_pattern_id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                    aria-label="Quitar patrón"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
