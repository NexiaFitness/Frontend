/**
 * BlockAuthoringStepSummary.tsx — Resumen profesional del borrador (D-PAP + D-RES Q8).
 */

import React, { useMemo } from "react";

import type { PhysicalQuality, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

import { Button } from "@/components/ui/buttons";

import {
    getCoPrimarySlugs,
    isCoPrimaryMix,
    formatCoPrimaryLabels,
    PHYSICAL_QUALITY_MIX_COPY,
} from "./periodizationQualitiesPresentation";
import { getPatternsForDayFromWeek1 } from "./blockAuthoringPatternsUtils";
import { PatternBadge } from "./PatternBadge";
import {
    AUTHORING_STEP_META_CLASS,
    WEEKDAY_ISO_ORDER,
    WEEKDAY_LABELS_ES,
} from "./phaseAuthoringPresentation";
import type { BlockAuthorStep } from "./blockAuthoringModel";

interface Props {
    startDate: string | null;
    endDate: string | null;
    qualities: PeriodBlockQualityInput[];
    qualitiesSum: number;
    volumeLevel: number;
    intensityLevel: number;
    activeDays: readonly number[];
    weeklyStructure: readonly WeeklyStructureWeekCreate[];
    catalog: PhysicalQuality[];
    patternsCatalog: MovementPattern[];
    onEditStep: (step: BlockAuthorStep) => void;
}

function formatRange(start: string, end: string): string {
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    return `${fmt(start)} – ${fmt(end)}`;
}

function patternDisplayName(pattern: MovementPattern): string {
    return pattern.name_es?.trim() || pattern.name_en;
}

const WEEKDAY_FULL_ES = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
];

export const BlockAuthoringStepSummary: React.FC<Props> = ({
    startDate,
    endDate,
    qualities,
    qualitiesSum,
    volumeLevel,
    intensityLevel,
    activeDays,
    weeklyStructure,
    catalog,
    patternsCatalog,
    onEditStep,
}) => {
    const activeSet = new Set(activeDays);
    const dayLabels = WEEKDAY_ISO_ORDER.filter((d) => activeSet.has(d)).map(
        (d) => WEEKDAY_LABELS_ES[d - 1],
    );

    const patternsById = useMemo(
        () => new Map(patternsCatalog.map((p) => [p.id, p])),
        [patternsCatalog],
    );

    const patternRows = WEEKDAY_ISO_ORDER.filter((d) => activeSet.has(d)).map(
        (dayOfWeek) => {
            const patterns = getPatternsForDayFromWeek1(
                weeklyStructure,
                dayOfWeek,
            );
            return { dayOfWeek, patterns };
        },
    );

    const coPrimarySlugs = getCoPrimarySlugs(qualities, catalog);
    const showCoPrimary = isCoPrimaryMix(qualities, catalog);

    return (
        <div className="space-y-6">
            <p className={AUTHORING_STEP_META_CLASS}>Resumen del bloque</p>

            <section className="space-y-2 rounded-lg border border-border/50 bg-surface-2/30 p-4">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Vigencia</p>
                        <p className="text-sm font-medium text-foreground">
                            {startDate && endDate
                                ? formatRange(startDate, endDate)
                                : "—"}
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-2 rounded-lg border border-border/50 bg-surface-2/30 p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        Cualidades ({qualitiesSum}%)
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onEditStep("qualities")}
                    >
                        Editar
                    </Button>
                </div>
                <ul className="space-y-1">
                    {qualities.map((q) => {
                        const catItem = catalog.find(
                            (c) => c.id === q.physical_quality_id,
                        );
                        const slug = catItem?.slug ?? "unknown";
                        const name =
                            catItem?.name ??
                            `#${q.physical_quality_id}`;
                        const color = getPhysicalQualityColor(slug);
                        return (
                            <li
                                key={q.physical_quality_id}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: color.hex }}
                                    />
                                    {name}
                                </span>
                                <span className="tabular-nums font-medium">
                                    {q.percentage}%
                                </span>
                            </li>
                        );
                    })}
                </ul>
                {showCoPrimary ? (
                    <p className="text-[10px] leading-relaxed text-muted-foreground pt-1">
                        {PHYSICAL_QUALITY_MIX_COPY.coPrimaryBody}{" "}
                        <span className="font-medium text-foreground">
                            ({formatCoPrimaryLabels(coPrimarySlugs, catalog)})
                        </span>
                    </p>
                ) : null}
            </section>

            <section className="space-y-2 rounded-lg border border-border/50 bg-surface-2/30 p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        Volumen e intensidad
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onEditStep("volumeIntensity")}
                    >
                        Editar
                    </Button>
                </div>
                <p className="text-sm text-foreground">
                    Vol {volumeLevel}/10 · Int {intensityLevel}/10
                </p>
            </section>

            <section className="space-y-2 rounded-lg border border-border/50 bg-surface-2/30 p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Días</p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onEditStep("days")}
                    >
                        Editar
                    </Button>
                </div>
                <p className="text-sm text-foreground">
                    {dayLabels.length > 0 ? dayLabels.join(" · ") : "Ningún día seleccionado"}
                </p>
            </section>

            <section className="space-y-3 rounded-lg border border-border/50 bg-surface-2/30 p-4">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Patrones</p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onEditStep("patterns")}
                    >
                        Editar
                    </Button>
                </div>
                {patternRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Ningún día seleccionado.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {patternRows.map(({ dayOfWeek, patterns }) => (
                            <li
                                key={dayOfWeek}
                                className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3"
                            >
                                <span className="text-sm font-medium text-foreground shrink-0 sm:w-24">
                                    {WEEKDAY_FULL_ES[dayOfWeek - 1] ??
                                        WEEKDAY_LABELS_ES[dayOfWeek - 1]}
                                </span>
                                <div className="flex flex-wrap gap-1 min-w-0">
                                    {patterns.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">
                                            Sin patrones
                                        </span>
                                    ) : (
                                        patterns.map((assignment) => {
                                            const pattern = patternsById.get(
                                                assignment.movement_pattern_id,
                                            );
                                            if (!pattern) return null;
                                            return (
                                                <PatternBadge
                                                    key={
                                                        assignment.movement_pattern_id
                                                    }
                                                    name={patternDisplayName(
                                                        pattern,
                                                    )}
                                                    uiBucket={pattern.ui_bucket}
                                                    selected
                                                    size="sm"
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
