/**
 * PeriodizationWeeklyStructureModal.tsx — Modal de edición de la estructura semanal
 * dentro del flujo de creación/edición de bloques de periodización.
 *
 * Sustituye el render inline largo del draft por:
 * - Matriz semana × día en viewports `lg+`.
 * - Lista vertical (fallback) en viewports `< lg`, idéntica al draft inline.
 *
 * El componente NO mantiene estado del draft: lee `value` y emite `onChange`.
 * Cerrar el modal (ESC, backdrop o botón "Listo") **no** resetea nada.
 *
 * Spec: docs/specs/estructura-semanal/02_SPEC_TECNICO_MODAL.md
 */

import React, { useCallback, useMemo, useState } from "react";

import {
    getTrainingDatesInRange,
    type TrainingDateInfo,
} from "@nexia/shared";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type {
    WeeklyStructureDayPatternInput,
    WeeklyStructureWeekCreate,
} from "@nexia/shared/types/weeklyStructure";

import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";

import { DayCell } from "./DayCell";

const ISO_DAY_NAMES_SHORT: Record<number, string> = {
    1: "Lun",
    2: "Mar",
    3: "Mié",
    4: "Jue",
    5: "Vie",
    6: "Sáb",
    7: "Dom",
};

function formatRangeShort(startDate: string, endDate: string): string {
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    };
    return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export interface PeriodizationWeeklyStructureModalProps {
    isOpen: boolean;
    onClose: () => void;

    startDate: string;
    endDate: string;
    trainingDays?: readonly string[] | null;

    patternsCatalog: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;

    value: WeeklyStructureWeekCreate[];
    onChange: (draft: WeeklyStructureWeekCreate[]) => void;
}

export const PeriodizationWeeklyStructureModal: React.FC<
    PeriodizationWeeklyStructureModalProps
> = ({
    isOpen,
    onClose,
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

    // Columnas activas de la matriz: subconjunto ISO 1..7 que aparece en algún día del rango.
    const activeDaysOfWeek = useMemo(() => {
        const set = new Set<number>();
        for (const d of trainingDates) set.add(d.dayOfWeek);
        return Array.from(set).sort((a, b) => a - b);
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

    const totalTrainable = trainingDates.length;
    const withPatterns = useMemo(() => {
        return value.reduce(
            (acc, w) =>
                acc + w.days.filter((d) => d.patterns.length > 0).length,
            0,
        );
    }, [value]);

    // Empty states
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
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Estructura semanal"
            description={formatRangeShort(startDate, endDate)}
            maxWidth="4xl"
        >
            <div className="space-y-4">
                {/* Context header */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-3">
                    <span>
                        {groupedByWeek.length} {groupedByWeek.length === 1 ? "semana" : "semanas"}
                        {" · "}
                        {totalTrainable} {totalTrainable === 1 ? "día entrenable" : "días entrenables"}
                    </span>
                    <span className="tabular-nums">
                        {withPatterns} / {totalTrainable} configurados
                    </span>
                </div>

                {emptyContent}

                {!emptyContent && (
                    <>
                        {/* Matrix view (lg+) */}
                        <div className="hidden lg:block">
                            <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border">
                                <div
                                    className="grid sticky top-0 z-10 bg-card border-b border-border"
                                    style={{
                                        gridTemplateColumns: `80px repeat(${activeDaysOfWeek.length}, minmax(160px, 1fr))`,
                                    }}
                                >
                                    <div className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Semana
                                    </div>
                                    {activeDaysOfWeek.map((dow) => (
                                        <div
                                            key={dow}
                                            className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center"
                                        >
                                            {ISO_DAY_NAMES_SHORT[dow]}
                                        </div>
                                    ))}
                                </div>

                                {groupedByWeek.map((weekGroup) => (
                                    <div
                                        key={weekGroup.weekOrdinal}
                                        className="grid border-b border-border/60 last:border-b-0"
                                        style={{
                                            gridTemplateColumns: `80px repeat(${activeDaysOfWeek.length}, minmax(160px, 1fr))`,
                                        }}
                                    >
                                        <div className="px-2 py-3 text-xs font-semibold text-foreground tabular-nums">
                                            Sem {weekGroup.weekOrdinal}
                                        </div>
                                        {activeDaysOfWeek.map((dow) => {
                                            const dayInfo = weekGroup.days.find(
                                                (d) => d.dayOfWeek === dow,
                                            );
                                            if (!dayInfo) {
                                                return (
                                                    <div
                                                        key={`${weekGroup.weekOrdinal}-${dow}`}
                                                        className="px-1 py-2 opacity-30"
                                                        aria-hidden
                                                    >
                                                        <div className="rounded-md border border-dashed border-border h-full min-h-[88px]" />
                                                    </div>
                                                );
                                            }
                                            const popoverKey = `${weekGroup.weekOrdinal}-${dow}`;
                                            const isOpen = openPopoverKey === popoverKey;
                                            return (
                                                <div
                                                    key={popoverKey}
                                                    className="px-1 py-2"
                                                >
                                                    <DayCell
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
                                                        onOpenPopover={() =>
                                                            setOpenPopoverKey(popoverKey)
                                                        }
                                                        onClosePopover={() =>
                                                            setOpenPopoverKey(null)
                                                        }
                                                        onToggle={(patternId) =>
                                                            togglePattern(
                                                                weekGroup.weekOrdinal,
                                                                dayInfo.dayOfWeek,
                                                                patternId,
                                                            )
                                                        }
                                                        className="rounded-md border border-border/60 bg-surface-2/40 p-2 space-y-2 h-full min-h-[88px]"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* List fallback (< lg) */}
                        <div className="block lg:hidden space-y-3 max-h-[60vh] overflow-y-auto">
                            {groupedByWeek.map((weekGroup) => (
                                <div key={weekGroup.weekOrdinal} className="space-y-2">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Semana {weekGroup.weekOrdinal}
                                    </p>
                                    <div className="space-y-2">
                                        {weekGroup.days.map((dayInfo) => {
                                            const popoverKey = `${weekGroup.weekOrdinal}-${dayInfo.dayOfWeek}-mb`;
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
                                                    onOpenPopover={() =>
                                                        setOpenPopoverKey(popoverKey)
                                                    }
                                                    onClosePopover={() =>
                                                        setOpenPopoverKey(null)
                                                    }
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
                    </>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {withPatterns} / {totalTrainable} días configurados
                    </span>
                    <Button variant="primary" size="sm" onClick={onClose}>
                        Listo
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
