/**
 * PeriodBlockConstructorSummaryStrip.tsx — Resumen acumulativo bajo el calendario.
 *
 * Muestra las zonas completadas del constructor (rango, cualidades, estructura,
 * volumen/intensidad) con el mismo shell que SessionContextStrip.
 */

import React, { useMemo } from "react";
import {
    CalendarRange,
    Dumbbell,
    Layers,
    SlidersHorizontal,
} from "lucide-react";

import type { PhysicalQuality } from "@nexia/shared/types/planningCargas";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { getTrainingDatesInRange } from "@nexia/shared";

import { ContextStripShell, type ContextStripZone } from "@/components/ui/ContextStripShell";

import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import type { PeriodBlockConstructorStep } from "./periodBlockConstructor";
import { computeWeeklyStructureMetrics } from "./PeriodizationWeeklyStructureEditor";

function formatDateShort(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTrainingDaysSummary(
    startDate: string,
    endDate: string,
    trainingDays: readonly string[] | null | undefined,
): string {
    const dates = getTrainingDatesInRange(startDate, endDate, trainingDays);
    if (dates.length === 0) return "Sin días entrenables en el rango";
    const names = dates.map((d) => d.dayName.toLowerCase());
    const unique = [...new Set(names)];
    const preview = unique.slice(0, 4).join(", ");
    const suffix =
        unique.length > 4 ? ` +${unique.length - 4}` : "";
    return `${dates.length} días · ${preview}${suffix}`;
}

export interface PeriodBlockConstructorSummaryStripProps {
    formState: PeriodBlockFormState;
    catalog: PhysicalQuality[];
    trainingDays?: readonly string[] | null;
}

function stepDone(
    completed: PeriodBlockConstructorStep[],
    step: PeriodBlockConstructorStep,
    current: PeriodBlockConstructorStep,
): boolean {
    if (completed.includes(step)) return true;
    const order = ["range", "qualities", "weeklyStructure", "volumeIntensity"];
    return order.indexOf(current) > order.indexOf(step);
}

export const PeriodBlockConstructorSummaryStrip: React.FC<
    PeriodBlockConstructorSummaryStripProps
> = ({ formState, catalog, trainingDays }) => {
    const { completedSteps, constructorStep } = formState;

    const showRange =
        formState.startDate &&
        formState.endDate &&
        stepDone(completedSteps, "range", constructorStep);

    const showQualities =
        showRange &&
        formState.qualities.length > 0 &&
        stepDone(completedSteps, "qualities", constructorStep);

    const weeklyMetrics = useMemo(() => {
        if (!formState.startDate || !formState.endDate) {
            return { totalTrainable: 0, withPatterns: 0, weekCount: 0 };
        }
        return computeWeeklyStructureMetrics(
            formState.startDate,
            formState.endDate,
            trainingDays,
            formState.weeklyStructure,
        );
    }, [
        formState.startDate,
        formState.endDate,
        formState.weeklyStructure,
        trainingDays,
    ]);

    const showWeekly =
        showQualities &&
        stepDone(completedSteps, "weeklyStructure", constructorStep);

    const showVolume =
        showWeekly &&
        (stepDone(completedSteps, "volumeIntensity", constructorStep) ||
            constructorStep === "volumeIntensity");

    const zones: ContextStripZone[] = [];

    if (showRange && formState.startDate && formState.endDate) {
        zones.push({
            icon: <CalendarRange className="h-3.5 w-3.5" />,
            label: "Rango",
            children: (
                <>
                    <p className="text-sm font-semibold text-foreground truncate">
                        {formatDateShort(formState.startDate)} –{" "}
                        {formatDateShort(formState.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {formatTrainingDaysSummary(
                            formState.startDate,
                            formState.endDate,
                            trainingDays,
                        )}
                    </p>
                </>
            ),
        });
    }

    if (showQualities) {
        zones.push({
            icon: <Dumbbell className="h-3.5 w-3.5" />,
            label: "Cualidades",
            children: (
                <div className="flex flex-wrap gap-1.5">
                    {formState.qualities.map((q) => {
                        const item = catalog.find(
                            (c) => c.id === q.physical_quality_id,
                        );
                        const slug = item?.slug ?? "unknown";
                        const color = getPhysicalQualityColor(slug);
                        return (
                            <span
                                key={q.physical_quality_id}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-primary/30"
                            >
                                <span
                                    className="h-1.5 w-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: color.hex }}
                                    aria-hidden
                                />
                                {item?.name ?? `#${q.physical_quality_id}`}{" "}
                                <span className="tabular-nums text-muted-foreground">
                                    {q.percentage}%
                                </span>
                            </span>
                        );
                    })}
                </div>
            ),
        });
    }

    if (showWeekly) {
        zones.push({
            icon: <Layers className="h-3.5 w-3.5" />,
            label: "Estructura",
            children: (
                <>
                    <p className="text-sm font-semibold text-foreground truncate">
                        {weeklyMetrics.weekCount}{" "}
                        {weeklyMetrics.weekCount === 1 ? "semana" : "semanas"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        {weeklyMetrics.withPatterns} / {weeklyMetrics.totalTrainable}{" "}
                        días con patrones
                    </p>
                </>
            ),
        });
    }

    if (showVolume) {
        zones.push({
            icon: <SlidersHorizontal className="h-3.5 w-3.5" />,
            label: "Carga",
            children: (
                <>
                    <p className="text-sm font-semibold text-foreground">
                        Vol {formState.volumeLevel}/10 · Int{" "}
                        {formState.intensityLevel}/10
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Escala planificada del bloque
                    </p>
                </>
            ),
        });
    }

    if (zones.length === 0) return null;

    return (
        <ContextStripShell
            ariaLabel="Resumen del bloque en construcción"
            zones={zones}
        />
    );
};
