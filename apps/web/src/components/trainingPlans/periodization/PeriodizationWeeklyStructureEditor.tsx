/**
 * PeriodizationWeeklyStructureEditor.tsx — Acordeón semana × día para estructura semanal.
 *
 * Usado en el constructor inline (columna derecha) y dentro del modal legacy.
 * Sin estado de draft propio: `value` + `onChange` controlados por el padre.
 *
 * Spec: docs/specs/estructura-semanal/02_SPEC_TECNICO_MODAL.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { getTrainingDatesInRange, type TrainingDateInfo } from "@nexia/shared";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type {
    WeeklyStructureDayPatternInput,
    WeeklyStructureWeekCreate,
} from "@nexia/shared/types/weeklyStructure";

import { cn } from "@/lib/utils";

import { DayCell } from "./DayCell";
import {
    formatBlockWeekRange,
    formatRangeShort,
    parsePickerDayId,
    toPickerDayId,
} from "./periodizationWeeklyStructureUtils";

export interface PeriodizationWeeklyStructureEditorProps {
    startDate: string;
    endDate: string;
    trainingDays?: readonly string[] | null;
    patternsCatalog: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;
    value: WeeklyStructureWeekCreate[];
    onChange: (draft: WeeklyStructureWeekCreate[]) => void;
    /** Oculta cabecera de rango (p. ej. cuando el modal ya muestra título). */
    showRangeHeader?: boolean;
    /** Scroll acotado para columna constructor (altura fija). */
    compact?: boolean;
    /** Ocupa el alto disponible del panel (scroll interno). */
    fillContainer?: boolean;
    className?: string;
}

export const PeriodizationWeeklyStructureEditor: React.FC<
    PeriodizationWeeklyStructureEditorProps
> = ({
    startDate,
    endDate,
    trainingDays,
    patternsCatalog,
    patternsLoading,
    patternsError,
    value,
    onChange,
    showRangeHeader = true,
    compact = false,
    fillContainer = false,
    className,
}) => {
    const [activePickerDayId, setActivePickerDayId] = useState<string | null>(
        null,
    );
    /** Constructor: picker inline bajo el día; scroll del panel como cualidades. */
    const inlinePicker = fillContainer;

    const trainingDates = useMemo(
        () => getTrainingDatesInRange(startDate, endDate, trainingDays),
        [startDate, endDate, trainingDays],
    );

    const groupedByWeek = useMemo(() => {
        const map = new Map<number, TrainingDateInfo[]>();
        for (const d of trainingDates) {
            if (!map.has(d.weekOrdinal)) map.set(d.weekOrdinal, []);
            map.get(d.weekOrdinal)!.push(d);
        }
        const ordered: { weekOrdinal: number; days: TrainingDateInfo[] }[] = [];
        const sortedWeeks = Array.from(map.keys()).sort((a, b) => a - b);
        for (const w of sortedWeeks) {
            ordered.push({
                weekOrdinal: w,
                days: map.get(w)!.sort((a, b) => a.dayOfWeek - b.dayOfWeek),
            });
        }
        return ordered;
    }, [trainingDates]);

    const [expandedWeek, setExpandedWeek] = useState<number | null>(() =>
        groupedByWeek.length > 0 ? groupedByWeek[0].weekOrdinal : null,
    );

    React.useEffect(() => {
        if (groupedByWeek.length === 0) {
            if (expandedWeek !== null) setExpandedWeek(null);
            return;
        }
        const stillExists = groupedByWeek.some(
            (w) => w.weekOrdinal === expandedWeek,
        );
        if (!stillExists) {
            setExpandedWeek(groupedByWeek[0].weekOrdinal);
        }
    }, [groupedByWeek, expandedWeek]);

    const handleOpenPicker = useCallback((pickerDayId: string) => {
        setActivePickerDayId((prev) => {
            if (prev === pickerDayId) return null;
            const parsed = parsePickerDayId(pickerDayId);
            if (parsed) setExpandedWeek(parsed.weekOrdinal);
            return pickerDayId;
        });
    }, []);

    const handleClosePicker = useCallback(() => {
        setActivePickerDayId(null);
    }, []);

    const getDayPatterns = useCallback(
        (weekOrdinal: number, dayOfWeek: number): WeeklyStructureDayPatternInput[] => {
            const week = value.find((w) => w.week_ordinal === weekOrdinal);
            if (!week) return [];
            const day = week.days.find((d) => d.day_of_week === dayOfWeek);
            return day?.patterns ?? [];
        },
        [value],
    );

    const togglePattern = useCallback(
        (weekOrdinal: number, dayOfWeek: number, patternId: number) => {
            const next = value.map((w) => ({
                ...w,
                days: w.days.map((d) => ({ ...d, patterns: [...d.patterns] })),
            }));
            let week = next.find((w) => w.week_ordinal === weekOrdinal);
            if (!week) {
                week = { week_ordinal: weekOrdinal, label: null, days: [] };
                next.push(week);
            }
            let day = week.days.find((d) => d.day_of_week === dayOfWeek);
            if (!day) {
                day = { day_of_week: dayOfWeek, patterns: [] };
                week.days.push(day);
            }
            const exists = day.patterns.some((p) => p.movement_pattern_id === patternId);
            if (exists) {
                day.patterns = day.patterns.filter(
                    (p) => p.movement_pattern_id !== patternId,
                );
            } else {
                day.patterns = [
                    ...day.patterns,
                    { movement_pattern_id: patternId, sub_pattern: null },
                ];
            }
            const cleaned = next
                .map((w) => ({
                    ...w,
                    days: w.days
                        .map((d) => ({
                            ...d,
                            patterns: d.patterns.filter((p) => p.movement_pattern_id),
                        }))
                        .filter((d) => d.patterns.length > 0),
                }))
                .filter((w) => w.days.length > 0);
            onChange(cleaned);
        },
        [value, onChange],
    );

    const totalTrainable = trainingDates.length;
    const withPatterns = useMemo(
        () =>
            value.reduce(
                (acc, w) =>
                    acc + w.days.filter((d) => d.patterns.length > 0).length,
                0,
            ),
        [value],
    );

    const weekStats = useCallback(
        (weekOrdinal: number, weekDays: TrainingDateInfo[]) => {
            const total = weekDays.length;
            const week = value.find((w) => w.week_ordinal === weekOrdinal);
            const configured = week
                ? week.days.filter((d) => d.patterns.length > 0).length
                : 0;
            return { configured, total };
        },
        [value],
    );

    const emptyContent = (() => {
        if (!trainingDays?.length) {
            return (
                <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        El cliente no tiene días de entreno configurados.
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        Defínelos en el perfil del cliente para asignar patrones por día.
                    </p>
                </div>
            );
        }
        if (totalTrainable === 0) {
            return (
                <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        El rango seleccionado no contiene días de entreno del cliente.
                    </p>
                </div>
            );
        }
        return null;
    })();

    return (
        <div
            className={cn(
                "space-y-3 min-w-0 w-full",
                fillContainer && "flex flex-col min-h-0 flex-1 overflow-hidden",
                className,
            )}
        >
            {showRangeHeader && (
                <p className="text-center text-sm font-semibold text-primary">
                    {formatRangeShort(startDate, endDate)}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground border-b border-border pb-2 min-w-0">
                <span className="min-w-0">
                    {groupedByWeek.length}{" "}
                    {groupedByWeek.length === 1 ? "semana" : "semanas"}
                    {" · "}
                    {totalTrainable}{" "}
                    {totalTrainable === 1 ? "día entrenable" : "días entrenables"}
                </span>
                <span className="tabular-nums shrink-0">
                    {withPatterns} / {totalTrainable} configurados
                </span>
            </div>

            <div
                className={cn(
                    "min-w-0",
                    fillContainer &&
                        "flex-1 min-h-0 overflow-y-auto scrollbar-primary",
                    compact &&
                        !fillContainer &&
                        "max-h-[min(50vh,28rem)] overflow-y-auto scrollbar-primary",
                )}
            >
                {emptyContent}
                {!emptyContent && (
                    <div className="space-y-2">
                        {groupedByWeek.map((weekGroup) => {
                            const isExpanded =
                                expandedWeek === weekGroup.weekOrdinal;
                            const { configured, total } = weekStats(
                                weekGroup.weekOrdinal,
                                weekGroup.days,
                            );
                            const weekRange = formatBlockWeekRange(
                                startDate,
                                weekGroup.weekOrdinal,
                                endDate,
                            );
                            return (
                                <div
                                    key={weekGroup.weekOrdinal}
                                    className="rounded-lg border border-border bg-surface-2/30 overflow-hidden"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedWeek(
                                                isExpanded
                                                    ? null
                                                    : weekGroup.weekOrdinal,
                                            )
                                        }
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2/60 transition-colors text-left"
                                        aria-expanded={isExpanded}
                                    >
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                                                isExpanded ? "" : "-rotate-90",
                                            )}
                                            aria-hidden
                                        />
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary text-[10px] font-semibold shrink-0">
                                            S{weekGroup.weekOrdinal}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground">
                                                Semana {weekGroup.weekOrdinal}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {weekRange}
                                                {" · "}
                                                <span className="tabular-nums">
                                                    {configured}/{total} días
                                                </span>
                                            </p>
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div className="border-t border-border/60 px-1.5 py-1.5 space-y-0.5">
                                            {weekGroup.days.map((dayInfo) => {
                                                const pickerDayId =
                                                    toPickerDayId(
                                                        weekGroup.weekOrdinal,
                                                        dayInfo.dayOfWeek,
                                                    );
                                                const isPickerOpen =
                                                    activePickerDayId ===
                                                    pickerDayId;
                                                return (
                                                    <DayCell
                                                        key={pickerDayId}
                                                        layout="row"
                                                        pickerPlacement={
                                                            inlinePicker
                                                                ? "inline"
                                                                : "portal"
                                                        }
                                                        weekOrdinal={
                                                            weekGroup.weekOrdinal
                                                        }
                                                        dayOfWeek={
                                                            dayInfo.dayOfWeek
                                                        }
                                                        dateISO={
                                                            dayInfo.dateISO
                                                        }
                                                        dayName={
                                                            dayInfo.dayName
                                                        }
                                                        assignedPatterns={getDayPatterns(
                                                            weekGroup.weekOrdinal,
                                                            dayInfo.dayOfWeek,
                                                        )}
                                                        catalog={
                                                            patternsCatalog
                                                        }
                                                        catalogLoading={
                                                            patternsLoading
                                                        }
                                                        catalogError={
                                                            patternsError
                                                        }
                                                        isPopoverOpen={
                                                            isPickerOpen
                                                        }
                                                        onOpenPopover={() =>
                                                            handleOpenPicker(
                                                                pickerDayId,
                                                            )
                                                        }
                                                        onClosePopover={
                                                            handleClosePicker
                                                        }
                                                        onToggle={(
                                                            patternId,
                                                        ) =>
                                                            togglePattern(
                                                                weekGroup.weekOrdinal,
                                                                dayInfo.dayOfWeek,
                                                                patternId,
                                                            )
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
