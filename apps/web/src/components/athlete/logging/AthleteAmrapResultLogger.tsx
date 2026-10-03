/**
 * AthleteAmrapResultLogger.tsx — AMRAP: rondas + reps parciales (total único, FE-4).
 * Contexto: reparto automático en orden de ronda (04 §2, E17).
 * @author Frontend Team
 * @since v8.3.0
 */

import React, { useMemo } from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    computeAmrapPartialTotal,
    formatAmrapResultSummary,
} from "@nexia/shared/utils/athlete/amrapResult";
import {
    distributeAmrapPartialReps,
    formatAmrapIncompleteRoundBreakdown,
} from "@nexia/shared/utils/athlete/athleteLoggingUtils";
import { AthleteLoggingNumericField } from "./AthleteLoggingNumericField";
import { cn } from "@/lib/utils";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD_ERROR,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_AMRAP_SUMMARY,
    ATHLETE_RUN_AMRAP_TARGET_HINT,
    ATHLETE_RUN_AMRAP_VALIDATION_MESSAGE,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "@/components/athlete/execution/athleteRunPresentation";

export interface AthleteAmrapResultLoggerProps {
    fullRounds: number;
    targetRounds: number | null;
    onFullRoundsChange: (value: number) => void;
    slots: AthleteRunRoundSlot[];
    partialReps: Record<string, number>;
    onPartialRepsChange: (stepKey: string, value: number) => void;
    onPartialTotalChange?: (total: number) => void;
    showValidationError?: boolean;
    onValidationReset?: () => void;
    onConvertPartialToFullRound?: () => void;
}

export const AthleteAmrapResultLogger: React.FC<AthleteAmrapResultLoggerProps> = ({
    fullRounds,
    targetRounds,
    onFullRoundsChange,
    slots,
    partialReps,
    onPartialRepsChange,
    onPartialTotalChange,
    showValidationError = false,
    onValidationReset,
    onConvertPartialToFullRound,
}) => {
    const partialSlots = useMemo(
        () =>
            slots.map((slot) => ({
                stepKey: slot.stepKey,
                maxReps: slot.defaultReps,
                exerciseName: slot.exerciseName,
            })),
        [slots]
    );

    const partialTotal = useMemo(
        () => computeAmrapPartialTotal(partialSlots.map((slot) => partialReps[slot.stepKey] ?? 0)),
        [partialReps, partialSlots]
    );

    const distributionPreview = useMemo(
        () => formatAmrapIncompleteRoundBreakdown(partialSlots, partialReps),
        [partialReps, partialSlots]
    );

    const { suggestsExtraFullRound } = useMemo(
        () => distributeAmrapPartialReps(partialSlots, partialTotal),
        [partialSlots, partialTotal]
    );

    const summary = formatAmrapResultSummary(fullRounds, partialTotal);
    const showSummary = fullRounds > 0 || partialTotal > 0;
    const isValid = fullRounds > 0 || partialTotal > 0;
    const showError = showValidationError && !isValid;

    const handlePartialTotalChange = (total: number) => {
        onValidationReset?.();
        onPartialTotalChange?.(total);
        const { partialBySlot } = distributeAmrapPartialReps(partialSlots, total);
        for (const slot of partialSlots) {
            const next = partialBySlot[slot.stepKey] ?? 0;
            const current = partialReps[slot.stepKey] ?? 0;
            if (next !== current) {
                onPartialRepsChange(slot.stepKey, next);
            }
        }
    };

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div
                className={cn(
                    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
                    showError && ATHLETE_RUN_AMRAP_ROUNDS_CARD_ERROR
                )}
            >
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <div className="space-y-0.5">
                        <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Resultado AMRAP</p>
                        {targetRounds != null ? (
                            <p className={ATHLETE_RUN_AMRAP_TARGET_HINT}>
                                Referencia del entrenador: ~{targetRounds} rondas
                            </p>
                        ) : null}
                    </div>

                    <AthleteLoggingNumericField
                        label="Rondas completas"
                        value={fullRounds}
                        onChange={(value) => {
                            onValidationReset?.();
                            onFullRoundsChange(value);
                        }}
                        step={1}
                        min={0}
                        inputMode="numeric"
                    />

                    <AthleteLoggingNumericField
                        label="Reps en la ronda incompleta"
                        value={partialTotal}
                        onChange={handlePartialTotalChange}
                        step={1}
                        min={0}
                        inputMode="numeric"
                    />

                    {distributionPreview ? (
                        <p className={ATHLETE_RUN_AMRAP_SUMMARY} aria-live="polite">
                            {distributionPreview}
                        </p>
                    ) : null}

                    {suggestsExtraFullRound ? (
                        <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
                            <p className="text-sm text-warning" role="status">
                                Eso es una ronda más. Convierte esas reps en una ronda completa.
                            </p>
                            {onConvertPartialToFullRound ? (
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                                    onClick={onConvertPartialToFullRound}
                                >
                                    Sumar 1 ronda y limpiar parcial
                                </button>
                            ) : null}
                        </div>
                    ) : null}

                    {showError ? (
                        <p className={ATHLETE_RUN_AMRAP_VALIDATION_MESSAGE} role="alert">
                            Completa las rondas o reps parciales para guardar.
                        </p>
                    ) : (
                        <p className={ATHLETE_RUN_AMRAP_HINT}>
                            Cuenta solo las veces que terminaste todos los ejercicios de la
                            secuencia.
                        </p>
                    )}

                    {showSummary ? (
                        <p className={ATHLETE_RUN_AMRAP_SUMMARY} aria-live="polite">
                            {summary}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
