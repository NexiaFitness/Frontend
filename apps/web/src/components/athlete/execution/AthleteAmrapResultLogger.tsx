/**
 * AthleteAmrapResultLogger.tsx — Registro AMRAP: rondas completas + parcial secuencial (V05).
 */

import React, { useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    computeAmrapPartialTotal,
    formatAmrapResultSummary,
    type AmrapPartialSlot,
} from "@nexia/shared/utils/athlete/amrapResult";
import { AthleteRunStepperControl } from "./AthleteRunStepperControl";
import { cn } from "@/lib/utils";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_PARTIAL_CARD,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_META,
    ATHLETE_RUN_AMRAP_PARTIAL_TOGGLE,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD_ERROR,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_AMRAP_SUMMARY,
    ATHLETE_RUN_AMRAP_TARGET_HINT,
    ATHLETE_RUN_AMRAP_VALIDATION_MESSAGE,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "./athleteRunPresentation";

export interface AthleteAmrapResultLoggerProps {
    fullRounds: number;
    targetRounds: number | null;
    onFullRoundsChange: (value: number) => void;
    slots: AthleteRunRoundSlot[];
    partialReps: Record<string, number>;
    partialOpen: boolean;
    onPartialOpenChange: (open: boolean) => void;
    onPartialRepsChange: (stepKey: string, value: number) => void;
    /** Muestra el estado de error de validación cuando el usuario intenta guardar sin datos. */
    showValidationError?: boolean;
    /** Se llama cuando el usuario modifica cualquier valor para ocultar el error. */
    onValidationReset?: () => void;
}

export const AthleteAmrapResultLogger: React.FC<AthleteAmrapResultLoggerProps> = ({
    fullRounds,
    targetRounds,
    onFullRoundsChange,
    slots,
    partialReps,
    partialOpen,
    onPartialOpenChange,
    onPartialRepsChange,
    showValidationError = false,
    onValidationReset,
}) => {
    const partialSlots = useMemo<AmrapPartialSlot[]>(
        () =>
            slots.map((slot) => ({
                stepKey: slot.stepKey,
                maxReps: slot.defaultReps,
            })),
        [slots]
    );

    const partialTotal = useMemo(
        () =>
            computeAmrapPartialTotal(
                partialSlots.map((slot) => partialReps[slot.stepKey] ?? 0)
            ),
        [partialReps, partialSlots]
    );

    const summary = formatAmrapResultSummary(fullRounds, partialTotal);
    const showSummary = fullRounds > 0 || partialTotal > 0;
    const isValid = fullRounds > 0 || partialTotal > 0;
    const showError = showValidationError && !isValid;

    const handleFullRoundsChange = (value: number) => {
        onValidationReset?.();
        onFullRoundsChange(value);
    };

    const handlePartialRepsChange = (stepKey: string, value: number) => {
        onValidationReset?.();
        onPartialRepsChange(stepKey, value);
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

                    <AthleteRunStepperControl
                        label="Rondas completas"
                        value={fullRounds}
                        onDecrease={() => handleFullRoundsChange(Math.max(0, fullRounds - 1))}
                        onIncrease={() => handleFullRoundsChange(fullRounds + 1)}
                        decreaseDisabled={fullRounds <= 0}
                    />
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

            <button
                type="button"
                className={ATHLETE_RUN_AMRAP_PARTIAL_TOGGLE}
                onClick={() => onPartialOpenChange(!partialOpen)}
                aria-expanded={partialOpen}
            >
                <span>El tiempo se acabó a mitad de otra ronda</span>
                {partialOpen ? (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                ) : (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
            </button>

            {partialOpen ? (
                <div className={ATHLETE_RUN_AMRAP_PARTIAL_CARD}>
                    <NexiaGlassAccentRim />
                    <div className="relative z-[1] space-y-4">
                        <p className={ATHLETE_RUN_AMRAP_HINT}>
                            Indica hasta dónde llegaste en orden, antes de que sonara el buzzer.
                        </p>

                        {slots.map((slot) => {
                            const maxReps = slot.defaultReps;
                            const value = partialReps[slot.stepKey] ?? 0;

                            return (
                                <div key={slot.stepKey} className="space-y-2">
                                    <div className="min-w-0">
                                        <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL}>
                                            {slot.slotLabel}. {slot.exerciseName}
                                        </p>
                                        <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_META}>
                                            Máx. {maxReps} reps en esta vuelta
                                        </p>
                                    </div>
                                    <AthleteRunStepperControl
                                        label="Reps en ronda incompleta"
                                        value={value}
                                        onDecrease={() =>
                                            handlePartialRepsChange(
                                                slot.stepKey,
                                                Math.max(0, value - 1)
                                            )
                                        }
                                        onIncrease={() =>
                                            handlePartialRepsChange(
                                                slot.stepKey,
                                                Math.min(maxReps, value + 1)
                                            )
                                        }
                                        decreaseDisabled={value <= 0}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
