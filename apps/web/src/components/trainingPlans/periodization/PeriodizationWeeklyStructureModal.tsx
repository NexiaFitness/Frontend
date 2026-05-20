/**
 * PeriodizationWeeklyStructureModal.tsx — Modal de edición de la estructura semanal
 * dentro del flujo de creación/edición de bloques de periodización.
 *
 * Render unificado: acordeon vertical de semanas (una expandida a la vez).
 * - Cabecera de cada semana: chevron + chip ordinal + "Semana N" + rango
 *   lun-dom + contador `n/m dias`. Sin acciones extra.
 * - Cuerpo expandido: una fila por dia entrenable con su nombre, fecha,
 *   patrones asignados (o "Sin patrones asignados") y boton "+".
 * - Footer: contador global + boton "Listo".
 *
 * El componente NO mantiene estado del draft: lee `value` y emite `onChange`.
 * Cerrar el modal (ESC, backdrop o boton "Listo") **no** resetea nada.
 *
 * Spec: docs/specs/estructura-semanal/02_SPEC_TECNICO_MODAL.md
 */

import React, { useCallback, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

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
import { cn } from "@/lib/utils";

import { DayCell } from "./DayCell";

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

/**
 * Devuelve el rango "dd mmm – dd mmm" de la semana N del bloque, contando
 * desde `blockStartISO` (semana 1 = startDate .. startDate+6, etc).
 *
 * Importante: NO se usa la semana ISO calendárica (lun-dom), porque cuando
 * el bloque empieza a media semana los dias entrenables del bloque caen en
 * semanas ISO distintas pero pertenecen a la misma "semana 1" del bloque.
 */
function formatBlockWeekRange(
    blockStartISO: string,
    weekOrdinal: number,
    blockEndISO?: string,
): string {
    const [y, m, d] = blockStartISO.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    start.setDate(start.getDate() + (weekOrdinal - 1) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    if (blockEndISO) {
        const [ey, em, ed] = blockEndISO.split("-").map(Number);
        const blockEnd = new Date(ey, em - 1, ed);
        if (end.getTime() > blockEnd.getTime()) {
            end.setTime(blockEnd.getTime());
        }
    }
    const fmt = (dt: Date) =>
        dt.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    return `${fmt(start)} – ${fmt(end)}`;
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

    // Acordeon exclusivo: solo una semana abierta a la vez.
    // Por defecto la primera semana del rango (si existe).
    const [expandedWeek, setExpandedWeek] = useState<number | null>(() =>
        groupedByWeek.length > 0 ? groupedByWeek[0].weekOrdinal : null,
    );
    // Si el rango cambia y la semana abierta deja de existir, recolocamos.
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

    // Recuento por semana (configurados / entrenables).
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
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Estructura semanal"
            maxWidth="3xl"
        >
            <div className="space-y-4">
                {/* Rango del bloque en azul primary, alineado bajo el titulo del modal. */}
                <p className="-mt-3 text-center text-sm font-semibold text-primary">
                    {formatRangeShort(startDate, endDate)}
                </p>

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
                    // Sin overflow propio: el popover de patrones es position:absolute
                    // dentro de la celda y un contenedor con overflow-y-auto en este
                    // wrapper lo clipa al abrirse. El scroll lo gestiona el BaseModal
                    // (max-h-[90vh] overflow-y-auto en el outer).
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
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2/60 transition-colors text-left"
                                        aria-expanded={isExpanded}
                                    >
                                        <ChevronDown
                                            className={cn(
                                                "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                                                isExpanded ? "" : "-rotate-90",
                                            )}
                                            aria-hidden
                                        />
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-semibold shrink-0">
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
                                        <div className="border-t border-border/60 px-2 py-2 space-y-1">
                                            {weekGroup.days.map((dayInfo) => {
                                                const popoverKey = `${weekGroup.weekOrdinal}-${dayInfo.dayOfWeek}`;
                                                const isPopoverOpen =
                                                    openPopoverKey === popoverKey;
                                                return (
                                                    <DayCell
                                                        key={popoverKey}
                                                        layout="row"
                                                        weekOrdinal={
                                                            weekGroup.weekOrdinal
                                                        }
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
                                                        isPopoverOpen={isPopoverOpen}
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
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
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
