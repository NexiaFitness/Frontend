/**
 * DayCell.tsx — Fila día + chips de patrones + picker (PeriodizationWeeklyStructureEditor).
 */

import React, { useMemo, useRef } from "react";
import { Pencil } from "lucide-react";

import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureDayPatternInput } from "@nexia/shared/types/weeklyStructure";

import { Button } from "@/components/ui/buttons";
import { NexiaSemanticIcon } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import { PLATFORM_ALT_ITEM } from "@/components/ui/surface/platformPremiumPresentation";

import { PatternBadge } from "./PatternBadge";
import { PatternSelectorPanel } from "./PatternSelectorPanel";
import { PatternSelectorPopover } from "./PatternSelectorPopover";

/**
 * DayCell.tsx — Fila día + chips de patrones + picker (PeriodizationWeeklyStructureEditor).
 *
 * Diseño: DESIGN_PREMIUM.md §5.2 — indicador inline (NexiaSemanticIcon) en celda
 * sin patrones; sin bloque apilado extra.
 */

interface Props {
    layout: "row";
    pickerPlacement: "inline" | "portal";
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
    className?: string;
}

function patternDisplayName(pattern: MovementPattern): string {
    return pattern.name_es?.trim() || pattern.name_en;
}

export const DayCell: React.FC<Props> = ({
    pickerPlacement,
    dayName,
    dateISO,
    assignedPatterns,
    catalog,
    catalogLoading,
    catalogError,
    isPopoverOpen,
    onOpenPopover,
    onClosePopover,
    onToggle,
    className,
}) => {
    const editRef = useRef<HTMLButtonElement>(null);
    const catalogById = useMemo(
        () => new Map(catalog.map((p) => [p.id, p])),
        [catalog],
    );
    const selectedIds = assignedPatterns.map((p) => p.movement_pattern_id);

    return (
        <div
            className={cn(
                PLATFORM_ALT_ITEM,
                "flex flex-col gap-2 sm:flex-row sm:items-start",
                className,
            )}
        >
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                    {dayName}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {dateISO}
                    </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {assignedPatterns.length === 0 ? (
                        <span
                            className="inline-flex items-center gap-1.5 text-xs text-warning"
                            data-testid="day-cell-without-patterns"
                        >
                            <NexiaSemanticIcon tone="warning" size="sm" />
                            Sin patrones
                        </span>
                    ) : (
                        assignedPatterns.map((assignment) => {
                            const pattern = catalogById.get(
                                assignment.movement_pattern_id,
                            );
                            if (!pattern) return null;
                            return (
                                <PatternBadge
                                    key={assignment.movement_pattern_id}
                                    name={patternDisplayName(pattern)}
                                    uiBucket={pattern.ui_bucket}
                                    selected
                                    size="sm"
                                />
                            );
                        })
                    )}
                </div>
            </div>
            <div className="relative shrink-0">
                <Button
                    ref={editRef}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={onOpenPopover}
                    aria-expanded={isPopoverOpen}
                >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Editar
                </Button>
                {pickerPlacement === "portal" && (
                    <PatternSelectorPopover
                        isOpen={isPopoverOpen}
                        onClose={onClosePopover}
                        catalog={catalog}
                        catalogLoading={catalogLoading}
                        catalogError={catalogError}
                        selectedPatternIds={selectedIds}
                        onToggle={onToggle}
                        anchorRef={editRef}
                    />
                )}
            </div>
            {pickerPlacement === "inline" && isPopoverOpen && (
                <div className="w-full rounded-md border border-border/60 bg-surface-2/30 p-3">
                    <PatternSelectorPanel
                        catalog={catalog}
                        catalogLoading={catalogLoading}
                        catalogError={catalogError}
                        selectedPatternIds={selectedIds}
                        onToggle={onToggle}
                    />
                    <div className="mt-3 flex justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClosePopover}
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
