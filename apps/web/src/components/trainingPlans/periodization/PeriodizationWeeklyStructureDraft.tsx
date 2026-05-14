/**
 * PeriodizationWeeklyStructureDraft.tsx — Selector inline de estructura semanal
 * dentro del panel de creación/edición de bloques de periodización.
 *
 * Muestra los días entrenables del cliente que caen dentro del rango del bloque,
 * agrupados por semana ordinal, y permite asignar/quitar patrones de movimiento
 * mediante un popover con agrupación por ui_bucket.
 *
 * @author Frontend Team
 * @since Fase E — FEATURE_UX_MEJORA_ESTRUCTURA_SEMANAL
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import {
    isoLocalDateToTrainingDayValue,
    parseHabitualTrainingDaySet,
} from "@nexia/shared/utils/clientTrainingDays";
import { UI_BUCKET_LABELS, UI_BUCKET_ORDER } from "@nexia/shared";
import type {
    WeeklyStructureWeekCreate,
    WeeklyStructureDayPatternInput,
} from "@nexia/shared/types/weeklyStructure";
import type { MovementPattern } from "@nexia/shared/types/exercise";

import { PatternBadge } from "./PatternBadge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_NAMES: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
    7: "Domingo",
};

interface TrainingDateInfo {
    weekOrdinal: number;
    dayOfWeek: number;
    dateISO: string;
    dayName: string;
}

function getTrainingDatesInRange(
    startDate: string,
    endDate: string,
    trainingDays: readonly string[] | null | undefined
): TrainingDateInfo[] {
    const daySet = parseHabitualTrainingDaySet(trainingDays);
    if (!daySet.size) return [];

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);

    const out: TrainingDateInfo[] = [];
    const cursor = new Date(start);

    while (cursor.getTime() <= end.getTime()) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, "0");
        const d = String(cursor.getDate()).padStart(2, "0");
        const dateISO = `${y}-${m}-${d}`;

        const dayValue = isoLocalDateToTrainingDayValue(dateISO);
        if (dayValue && daySet.has(dayValue)) {
            const jsDay = cursor.getDay(); // 0=Domingo
            const dayOfWeek = jsDay === 0 ? 7 : jsDay; // 1=Lunes … 7=Domingo
            const diffMs = cursor.getTime() - start.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const weekOrdinal = Math.floor(diffDays / 7) + 1;
            out.push({
                weekOrdinal,
                dayOfWeek,
                dateISO,
                dayName: DAY_NAMES[dayOfWeek],
            });
        }
        cursor.setDate(cursor.getDate() + 1);
    }
    return out;
}

function formatDateShort(dateISO: string): string {
    const [y, m, d] = dateISO.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
    });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

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
    const popoverRef = useRef<HTMLDivElement | null>(null);

    // Cerrar popover al hacer clic fuera
    useEffect(() => {
        if (!openPopoverKey) return;
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpenPopoverKey(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [openPopoverKey]);

    const trainingDates = useMemo(
        () => getTrainingDatesInRange(startDate, endDate, trainingDays),
        [startDate, endDate, trainingDays]
    );

    const groupedByWeek = useMemo(() => {
        const map = new Map<number, TrainingDateInfo[]>();
        for (const d of trainingDates) {
            if (!map.has(d.weekOrdinal)) map.set(d.weekOrdinal, []);
            map.get(d.weekOrdinal)!.push(d);
        }
        // Ordenar semanas y días
        const ordered: { weekOrdinal: number; days: TrainingDateInfo[] }[] = [];
        const sortedWeeks = Array.from(map.keys()).sort((a, b) => a - b);
        for (const w of sortedWeeks) {
            ordered.push({ weekOrdinal: w, days: map.get(w)!.sort((a, b) => a.dayOfWeek - b.dayOfWeek) });
        }
        return ordered;
    }, [trainingDates]);

    const getWeek = useCallback(
        (weekOrdinal: number) => value.find((w) => w.week_ordinal === weekOrdinal),
        [value]
    );

    const getDayPatterns = useCallback(
        (weekOrdinal: number, dayOfWeek: number): WeeklyStructureDayPatternInput[] => {
            const week = getWeek(weekOrdinal);
            if (!week) return [];
            const day = week.days.find((d) => d.day_of_week === dayOfWeek);
            return day?.patterns ?? [];
        },
        [getWeek]
    );

    const togglePattern = useCallback(
        (weekOrdinal: number, dayOfWeek: number, patternId: number) => {
            const next = value.map((w) => ({ ...w, days: w.days.map((d) => ({ ...d, patterns: [...d.patterns] })) }));
            let week = next.find((w) => w.week_ordinal === weekOrdinal);
            if (!week) {
                week = {
                    week_ordinal: weekOrdinal,
                    label: null,
                    days: [],
                };
                next.push(week);
            }
            let day = week.days.find((d) => d.day_of_week === dayOfWeek);
            if (!day) {
                day = { day_of_week: dayOfWeek, patterns: [] };
                week.days.push(day);
            }
            const exists = day.patterns.some((p) => p.movement_pattern_id === patternId);
            if (exists) {
                day.patterns = day.patterns.filter((p) => p.movement_pattern_id !== patternId);
            } else {
                day.patterns = [...day.patterns, { movement_pattern_id: patternId, sub_pattern: null }];
            }
            // Limpiar semanas/días vacíos para no enviar basura
            const cleaned = next
                .map((w) => ({
                    ...w,
                    days: w.days
                        .map((d) => ({ ...d, patterns: d.patterns.filter((p) => p.movement_pattern_id) }))
                        .filter((d) => d.patterns.length > 0),
                }))
                .filter((w) => w.days.length > 0);
            onChange(cleaned);
        },
        [value, onChange]
    );

    const groupedPatterns = useMemo(() => {
        const map = new Map<string, MovementPattern[]>();
        for (const p of patternsCatalog) {
            const bucket = (p.ui_bucket || "ACCESSORY").toString().toUpperCase();
            if (!map.has(bucket)) map.set(bucket, []);
            map.get(bucket)!.push(p);
        }
        const ordered: { bucket: string; label: string; patterns: MovementPattern[] }[] = [];
        for (const bucket of UI_BUCKET_ORDER) {
            const list = map.get(bucket);
            if (list && list.length > 0) {
                ordered.push({ bucket, label: UI_BUCKET_LABELS[bucket], patterns: list.sort((a, b) => a.id - b.id) });
            }
        }
        for (const [bucket, list] of map) {
            if (!UI_BUCKET_ORDER.includes(bucket as typeof UI_BUCKET_ORDER[number])) {
                ordered.push({ bucket, label: bucket, patterns: list.sort((a, b) => a.id - b.id) });
            }
        }
        return ordered;
    }, [patternsCatalog]);

    const totalTrainableDays = trainingDates.length;

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

    if (totalTrainableDays === 0) {
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
                            const dayPatterns = getDayPatterns(weekGroup.weekOrdinal, dayInfo.dayOfWeek);

                            return (
                                <div key={popoverKey} className="rounded-md border border-border/60 bg-surface-2/40 p-2.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-foreground">{dayInfo.dayName}</p>
                                            <p className="text-[10px] text-muted-foreground">{formatDateShort(dayInfo.dateISO)}</p>
                                        </div>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setOpenPopoverKey(isOpen ? null : popoverKey)}
                                                className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 px-2 py-1 text-[11px] text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                                Añadir patrón
                                            </button>
                                            {isOpen && (
                                                <div
                                                    ref={popoverRef}
                                                    className="absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border border-border bg-surface shadow-xl p-2 space-y-2 max-h-64 overflow-y-auto scrollbar-primary"
                                                >
                                                    {patternsLoading && (
                                                        <p className="text-xs text-muted-foreground text-center py-2">Cargando…</p>
                                                    )}
                                                    {patternsError && (
                                                        <p className="text-xs text-destructive text-center py-2">Error al cargar patrones</p>
                                                    )}
                                                    {!patternsLoading && !patternsError && groupedPatterns.map((group) => (
                                                        <div key={group.bucket}>
                                                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-1">
                                                                {group.label}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {group.patterns.map((p) => {
                                                                    const active = dayPatterns.some((dp) => dp.movement_pattern_id === p.id);
                                                                    return (
                                                                        <PatternBadge
                                                                            key={p.id}
                                                                            name={p.name_es || p.name_en}
                                                                            uiBucket={p.ui_bucket}
                                                                            active={active}
                                                                            onClick={() => togglePattern(weekGroup.weekOrdinal, dayInfo.dayOfWeek, p.id)}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {dayPatterns.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {dayPatterns.map((dp) => {
                                                const pattern = patternsCatalog.find((p) => p.id === dp.movement_pattern_id);
                                                if (!pattern) return null;
                                                return (
                                                    <span key={dp.movement_pattern_id} className="inline-flex items-center gap-1">
                                                        <PatternBadge
                                                            name={pattern.name_es || pattern.name_en}
                                                            uiBucket={pattern.ui_bucket}
                                                            active
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePattern(weekGroup.weekOrdinal, dayInfo.dayOfWeek, dp.movement_pattern_id)}
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
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
