/**
 * PeriodBlockQualitiesStep.tsx — Paso reutilizable «Cualidades físicas» del constructor.
 *
 * UI + validación con toasts al pulsar Continuar (botón siempre habilitado).
 * Spec: docs/constructor-periodizacion/
 */

import React, { useCallback } from "react";
import { X } from "lucide-react";

import type {
    PhysicalQuality,
    PeriodBlockQualityInput,
} from "@nexia/shared/types/planningCargas";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

import {
    MAX_PERIOD_BLOCK_QUALITIES,
    validateCanAddQuality,
    validateQualitiesStepAdvance,
} from "./periodBlockQualitiesValidation";

export interface PeriodBlockQualitiesStepProps {
    qualities: PeriodBlockQualityInput[];
    qualitiesSum: number;
    catalog: PhysicalQuality[];
    overlapDetected?: boolean;
    outsidePlanBounds?: boolean;
    onAddQuality: (qualityId: number) => void;
    onRemoveQuality: (qualityId: number) => void;
    onUpdateQualityPct: (qualityId: number, percentage: number) => void;
    onContinue: () => void;
    continueLabel?: string;
    className?: string;
}

export const PeriodBlockQualitiesStep: React.FC<PeriodBlockQualitiesStepProps> = ({
    qualities,
    qualitiesSum,
    catalog,
    overlapDetected = false,
    outsidePlanBounds = false,
    onAddQuality,
    onRemoveQuality,
    onUpdateQualityPct,
    onContinue,
    continueLabel = "Continuar a estructura semanal",
    className,
}) => {
    const { showError, showWarning } = useToast();
    const assignedIds = qualities.map((q) => q.physical_quality_id);
    const available = catalog.filter((c) => !assignedIds.includes(c.id));
    const atQualityLimit = qualities.length >= MAX_PERIOD_BLOCK_QUALITIES;

    const handleAddQuality = useCallback(
        (qualityId: number) => {
            const result = validateCanAddQuality(qualities.length);
            if (!result.ok && result.message) {
                showWarning(result.message);
                return;
            }
            onAddQuality(qualityId);
        },
        [qualities.length, onAddQuality, showWarning],
    );

    const handleContinue = useCallback(() => {
        const result = validateQualitiesStepAdvance({
            qualitiesCount: qualities.length,
            qualitiesSum,
            overlapDetected,
            outsidePlanBounds,
        });
        if (!result.ok && result.message) {
            if (result.severity === "warning") {
                showWarning(result.message);
            } else {
                showError(result.message);
            }
            return;
        }
        onContinue();
    }, [
        qualities.length,
        qualitiesSum,
        overlapDetected,
        outsidePlanBounds,
        onContinue,
        showError,
        showWarning,
    ]);

    return (
        <div className={cn("flex flex-col gap-5", className)}>
            {qualities.length === 0 && (
                <p className="text-[11px] text-primary animate-pulse leading-relaxed">
                    Añade al menos una cualidad física para continuar
                </p>
            )}

            {qualities.length > 0 && (
                <section
                    aria-label="Cualidades asignadas"
                    className="space-y-4 rounded-md border border-border/60 bg-surface-2/30 p-4"
                >
                    {qualities.map((q) => {
                        const catItem = catalog.find(
                            (c) => c.id === q.physical_quality_id,
                        );
                        const slug = catItem?.slug ?? "unknown";
                        const name =
                            catItem?.name ??
                            `Cualidad #${q.physical_quality_id}`;
                        const qColor = getPhysicalQualityColor(slug);

                        return (
                            <div
                                key={q.physical_quality_id}
                                className="space-y-2.5"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="h-2 w-2 rounded-full shrink-0"
                                            style={{
                                                backgroundColor: qColor.hex,
                                            }}
                                            aria-hidden
                                        />
                                        <span className="text-xs font-medium text-foreground truncate">
                                            {name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs font-bold tabular-nums text-foreground">
                                            {q.percentage}%
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onRemoveQuality(
                                                    q.physical_quality_id,
                                                )
                                            }
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                                            aria-label={`Quitar ${name}`}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    step={5}
                                    value={q.percentage}
                                    onChange={(e) =>
                                        onUpdateQualityPct(
                                            q.physical_quality_id,
                                            Number(e.target.value),
                                        )
                                    }
                                    className="w-full h-1.5 rounded-full appearance-none bg-surface-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:bg-[--thumb-color] [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:bg-[--thumb-color]"
                                    style={
                                        {
                                            "--thumb-color": qColor.hex,
                                        } as React.CSSProperties
                                    }
                                    aria-label={`${name} porcentaje`}
                                />
                            </div>
                        );
                    })}
                </section>
            )}

            {!atQualityLimit && available.length > 0 && (
                <section className="space-y-2.5" aria-label="Añadir cualidades">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Añadir cualidad
                        <span className="ml-1.5 font-normal normal-case text-muted-foreground/80">
                            (máx. {MAX_PERIOD_BLOCK_QUALITIES})
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {available.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => handleAddQuality(c.id)}
                                className="rounded-full border border-dashed border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
                            >
                                + {c.name}
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <footer className="pt-4 border-t border-border/50">
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleContinue}
                >
                    {continueLabel}
                </Button>
            </footer>
        </div>
    );
};
