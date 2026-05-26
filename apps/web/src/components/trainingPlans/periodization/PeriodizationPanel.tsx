/**
 * PeriodizationPanel.tsx — Constructor inteligente (columna derecha).
 *
 * Un paso visible a la vez: cualidades → estructura semanal (inline) → volumen/intensidad.
 * El rango se elige en el calendario; el resumen acumulado vive bajo el calendario
 * (PeriodBlockConstructorSummaryStrip).
 */

import React from "react";

import type { PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import { CONSTRUCTOR_STEP_LABELS } from "./periodBlockConstructor";
import { ConstructorStepHeader } from "./ConstructorStepHeader";
import { PeriodBlockQualitiesStep } from "./PeriodBlockQualitiesStep";
import { qualitiesSumBadgeClass } from "./periodBlockQualitiesValidation";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";
import type { VolumeIntensityContext } from "@nexia/shared";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";
import { VolumeIntensityExplainer } from "./VolumeIntensityExplainer";
import { SliderLevelBadge } from "./SliderLevelBadge";
import { PeriodizationWeeklyStructureEditor } from "./PeriodizationWeeklyStructureEditor";
import { formatRangeShort } from "./periodizationWeeklyStructureUtils";

interface Props {
    formState: PeriodBlockFormState;
    catalog: PhysicalQuality[];
    qualitiesSum: number;
    overlapDetected: boolean;
    outsidePlanBounds?: boolean;
    canSubmit: boolean;
    isEditing?: boolean;
    isSubmitting?: boolean;
    onAddQuality: (id: number) => void;
    onRemoveQuality: (id: number) => void;
    onUpdateQualityPct: (id: number, pct: number) => void;
    onVolumeChange: (v: number) => void;
    onIntensityChange: (v: number) => void;
    onSubmit: () => void;
    onReset: () => void;
    onAdvanceStep: () => void;
    volumeIntensityContext?: VolumeIntensityContext | null;
    volumeIntensityPhase?: PeriodizationVolumeNominalPhase;
    volumeIntensityHint?: string | null;
    trainingDays?: readonly string[] | null;
    patternsCatalog?: MovementPattern[];
    patternsLoading?: boolean;
    patternsError?: boolean;
    onWeeklyStructureChange?: (draft: WeeklyStructureWeekCreate[]) => void;
    /** Igualar altura al calendario: scroll interno sin crecer la columna. */
    fillHeight?: boolean;
}

function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export const PeriodizationPanel: React.FC<Props> = ({
    formState,
    catalog,
    qualitiesSum,
    overlapDetected,
    canSubmit,
    outsidePlanBounds = false,
    isEditing = false,
    isSubmitting = false,
    onAddQuality,
    onRemoveQuality,
    onUpdateQualityPct,
    onVolumeChange,
    onIntensityChange,
    onSubmit,
    onReset,
    onAdvanceStep,
    volumeIntensityContext,
    volumeIntensityPhase,
    volumeIntensityHint,
    trainingDays,
    patternsCatalog,
    patternsLoading,
    patternsError,
    onWeeklyStructureChange,
    fillHeight = false,
}) => {
    const step = formState.constructorStep;
    const stepTitle = CONSTRUCTOR_STEP_LABELS[step];
    const shellClass = cn(
        "rounded-lg bg-surface p-5 min-w-0",
        fillHeight
            ? "flex flex-col min-h-0 flex-1 overflow-hidden"
            : "sticky top-4 space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-primary",
    );
    const bodyScrollClass = fillHeight
        ? cn(
              "flex-1 min-h-0 min-w-0 flex flex-col gap-5",
              step === "weeklyStructure"
                  ? "overflow-hidden"
                  : "overflow-y-auto scrollbar-primary",
          )
        : "space-y-5 min-w-0";

    if (formState.phase === "idle") {
        return (
            <div
                className={cn(
                    shellClass,
                    "flex flex-col items-center justify-center text-center space-y-3",
                    !fillHeight && "min-h-[300px]",
                )}
            >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                        className="h-6 w-6 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                        />
                    </svg>
                </div>
                <p className="text-sm font-semibold text-foreground">
                    {isEditing ? "Editando bloque" : "Constructor de bloque"}
                </p>
                <p className="text-xs text-muted-foreground">
                    Haz clic en una fecha del calendario para iniciar la selección del
                    rango.
                </p>
            </div>
        );
    }

    if (formState.phase === "rangeStart") {
        return (
            <div className={cn(shellClass, "space-y-4", !fillHeight && "min-h-[200px]")}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selección de rango
                </p>
                <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">
                        Inicio:{" "}
                        {formState.startDate
                            ? formatDateShort(formState.startDate)
                            : "…"}
                    </span>
                </div>
                <p className="text-[11px] text-primary animate-pulse">
                    Haz clic en el día final para cerrar el rango
                </p>
            </div>
        );
    }

    return (
        <div className={cn(shellClass, fillHeight && "gap-4")}>
            <ConstructorStepHeader
                stepTitle={stepTitle}
                required={step === "qualities"}
                rangeLabel={
                    step === "weeklyStructure" &&
                    formState.startDate &&
                    formState.endDate
                        ? formatRangeShort(
                              formState.startDate,
                              formState.endDate,
                          )
                        : undefined
                }
                trailing={
                    step === "qualities" && formState.qualities.length > 0 ? (
                        <span
                            className={cn(
                                "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums",
                                qualitiesSumBadgeClass(qualitiesSum),
                            )}
                        >
                            {qualitiesSum}%
                        </span>
                    ) : undefined
                }
            />

            <div className={bodyScrollClass}>
            {step === "qualities" && (
                <PeriodBlockQualitiesStep
                    qualities={formState.qualities}
                    qualitiesSum={qualitiesSum}
                    catalog={catalog}
                    overlapDetected={overlapDetected}
                    outsidePlanBounds={outsidePlanBounds}
                    onAddQuality={onAddQuality}
                    onRemoveQuality={onRemoveQuality}
                    onUpdateQualityPct={onUpdateQualityPct}
                    onContinue={onAdvanceStep}
                />
            )}

            {step === "weeklyStructure" &&
                formState.startDate &&
                formState.endDate && (
                    <div className="flex flex-col gap-4 min-h-0 min-w-0 flex-1 overflow-hidden">
                        <PeriodizationWeeklyStructureEditor
                            startDate={formState.startDate}
                            endDate={formState.endDate}
                            trainingDays={trainingDays}
                            patternsCatalog={patternsCatalog ?? []}
                            patternsLoading={patternsLoading}
                            patternsError={patternsError}
                            value={formState.weeklyStructure}
                            onChange={onWeeklyStructureChange ?? (() => {})}
                            showRangeHeader={false}
                            fillContainer={fillHeight}
                            compact={!fillHeight}
                        />
                        <Button
                            variant="primary"
                            size="sm"
                            className="w-full shrink-0"
                            onClick={onAdvanceStep}
                        >
                            Continuar a volumen e intensidad
                        </Button>
                    </div>
                )}

            {step === "volumeIntensity" && (
                <div className="space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Volumen
                            </p>
                            <div className="flex items-center gap-2">
                                <SliderLevelBadge
                                    level={formState.volumeLevel}
                                    tone="volume"
                                />
                                <span className="text-sm font-bold text-primary tabular-nums">
                                    {formState.volumeLevel}/10
                                </span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={formState.volumeLevel}
                            onChange={(e) =>
                                onVolumeChange(Number(e.target.value))
                            }
                            className="w-full h-1.5 rounded-full appearance-none bg-surface-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            aria-label="Volumen"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Intensidad
                            </p>
                            <div className="flex items-center gap-2">
                                <SliderLevelBadge
                                    level={formState.intensityLevel}
                                    tone="intensity"
                                />
                                <span className="text-sm font-bold text-warning tabular-nums">
                                    {formState.intensityLevel}/10
                                </span>
                            </div>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            value={formState.intensityLevel}
                            onChange={(e) =>
                                onIntensityChange(Number(e.target.value))
                            }
                            className="w-full h-1.5 rounded-full appearance-none bg-surface-2 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-warning [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-warning [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            aria-label="Intensidad"
                        />
                    </div>

                    {volumeIntensityPhase != null && (
                        <VolumeIntensityExplainer
                            context={volumeIntensityContext ?? null}
                            phase={volumeIntensityPhase}
                            hint={volumeIntensityHint}
                        />
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={!canSubmit || isSubmitting}
                            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-gradient-to-r from-[hsl(190,100%,45%)] to-[hsl(210,100%,55%)] text-primary-foreground shadow-[0_0_20px_-4px_hsl(190,100%,50%,0.4)] hover:shadow-[0_0_28px_-4px_hsl(190,100%,50%,0.6)] hover:brightness-110 active:brightness-95 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isSubmitting
                                ? isEditing
                                    ? "Guardando…"
                                    : "Creando…"
                                : isEditing
                                  ? "Guardar bloque"
                                  : "Crear bloque"}
                        </button>
                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
                            aria-label="Cancelar"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18 6L6 18M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {step !== "volumeIntensity" && (
                <button
                    type="button"
                    onClick={onReset}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors w-full text-center shrink-0"
                >
                    Cancelar bloque
                </button>
            )}
            </div>
        </div>
    );
};
