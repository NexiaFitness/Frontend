/**
 * BlockAuthoringStepSummary.tsx — Resumen profesional del borrador (D-PAP).
 */

import React from "react";

import type { PhysicalQuality, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

import { Button } from "@/components/ui/buttons";

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
    catalog: PhysicalQuality[];
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

export const BlockAuthoringStepSummary: React.FC<Props> = ({
    startDate,
    endDate,
    qualities,
    qualitiesSum,
    volumeLevel,
    intensityLevel,
    activeDays,
    catalog,
    onEditStep,
}) => {
    const activeSet = new Set(activeDays);
    const dayLabels = WEEKDAY_ISO_ORDER.filter((d) => activeSet.has(d)).map(
        (d) => WEEKDAY_LABELS_ES[d - 1],
    );

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

            <section className="space-y-2 rounded-lg border border-border/50 bg-surface-2/30 p-4">
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
                <p className="text-sm text-muted-foreground">
                    Configuración detallada en Fase 3.
                </p>
            </section>
        </div>
    );
};
