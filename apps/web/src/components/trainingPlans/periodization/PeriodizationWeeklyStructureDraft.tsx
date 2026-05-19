/**
 * PeriodizationWeeklyStructureDraft.tsx — Selector inline de estructura semanal
 * dentro del panel de creación/edición de bloques de periodización.
 *
 * Muestra los días entrenables del cliente que caen dentro del rango del bloque,
 * agrupados por semana ordinal, y permite asignar/quitar patrones de movimiento
 * mediante un popover con agrupación por ui_bucket.
 *
 * Refactor F2 (docs/specs/estructura-semanal/03_PLAN_IMPLEMENTACION_FASES.md):
 * - El render por día se delega en `DayCell`.
 * - El popover de selección vive en `PatternSelectorPopover`.
 * - El cálculo de días entrenables y la agrupación por semana usan
 *   `getTrainingDatesInRange` de @nexia/shared.
 *
 * @author Frontend Team
 * @since Fase E — FEATURE_UX_MEJORA_ESTRUCTURA_SEMANAL
 */

import React, { useCallback, useMemo, useState } from "react";

import {
    getTrainingDatesInRange,
    type TrainingDateInfo,
} from "@nexia/shared";
import type {
    WeeklyStructureWeekCreate,
    WeeklyStructureDayPatternInput,
} from "@nexia/shared/types/weeklyStructure";
import type { MovementPattern } from "@nexia/shared/types/exercise";

import { DayCell } from "./DayCell";

export interface PeriodizationWeeklyStructureDraftProps {
    startDate: string;
    endDate: string;
    trainingDays: readonly string[] | null | undefined;
    patternsCatalog: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;
    value: WeeklyStructureWeekCreate[];
    onChange: (draft: WeeklyStructureWeekCreate[]) => void;
}

export const PeriodizationWeeklyStructureDraft: React.FC<
    PeriodizationWeeklyStructureDraftProps
> = ({
    startDate,
    endDate,
    trainingDays,
    patternsCatalog,
    patternsLoading,
    patternsError,
    value,
    onChange,
}) => {
    const [openPopoverKey, setOpenPopoverKey] = useState<string | null>(null);

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

    if (!trainingDays?.length) {
        return (
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                    El cliente no tiene días de entreno configurados.
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    La estructura semanal se podrá definir después de guardar el bloque.
                </p>
            </div>
        );
    }

    if (trainingDates.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-center">
                <p className="text-xs text-muted-foreground">
                    El rango seleccionado no contiene días de entreno del cliente.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {groupedByWeek.map((weekGroup) => (
                <div key={weekGroup.weekOrdinal} className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Semana {weekGroup.weekOrdinal}
                    </p>
                    <div className="space-y-2">
                        {weekGroup.days.map((dayInfo) => {
                            const popoverKey = `${weekGroup.weekOrdinal}-${dayInfo.dayOfWeek}`;
                            const isOpen = openPopoverKey === popoverKey;
                            return (
                                <DayCell
                                    key={popoverKey}
                                    weekOrdinal={weekGroup.weekOrdinal}
                                    dayOfWeek={dayInfo.dayOfWeek}
                                    dateISO={dayInfo.dateISO}
                                    dayName={dayInfo.dayName}
                                    assignedPatterns={getDayPatterns(
                                        weekGroup.weekOrdinal,
                                        dayInfo.dayOfWeek,
                                    )}
                                    catalog={patternsCatalog}
                                    catalogLoading={patternsLoading}
                                    catalogError={patternsError}
                                    isPopoverOpen={isOpen}
                                    onOpenPopover={() => setOpenPopoverKey(popoverKey)}
                                    onClosePopover={() => setOpenPopoverKey(null)}
                                    onToggle={(patternId) =>
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
                </div>
            ))}
        </div>
    );
};
