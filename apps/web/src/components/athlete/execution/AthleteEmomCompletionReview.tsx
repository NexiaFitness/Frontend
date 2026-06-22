/**
 * AthleteEmomCompletionReview.tsx — Cierre EMOM: confirmación + ajustes opcionales (V05).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { formatEmomMinuteLabel } from "@nexia/shared/utils/athlete/emomResult";
import { AthleteRunStepperControl } from "./AthleteRunStepperControl";
import { AthleteRoundEffortSection } from "./AthleteRoundEffortSection";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_PARTIAL_CARD,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_META,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_EMOM_CHOICE_BTN,
    ATHLETE_RUN_EMOM_CHOICE_ROW,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "./athleteRunPresentation";

export interface AthleteEmomCompletionReviewProps {
    intervals: AthleteEmomInterval[];
    intervalSeconds: number | null;
    asPlanned: boolean | null;
    onAsPlannedChange: (value: boolean) => void;
    overrides: Record<string, Record<string, number>>;
    onOverrideChange: (intervalKey: string, stepKey: string, value: number) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

export const AthleteEmomCompletionReview: React.FC<AthleteEmomCompletionReviewProps> = ({
    intervals,
    intervalSeconds,
    asPlanned,
    onAsPlannedChange,
    overrides,
    onOverrideChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Cierre EMOM</p>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        ¿Completaste todos los minutos como estaba previsto?
                    </p>
                    <div className={ATHLETE_RUN_EMOM_CHOICE_ROW}>
                        <button
                            type="button"
                            className={ATHLETE_RUN_EMOM_CHOICE_BTN(asPlanned === true)}
                            onClick={() => onAsPlannedChange(true)}
                        >
                            Sí, todo completado
                        </button>
                        <button
                            type="button"
                            className={ATHLETE_RUN_EMOM_CHOICE_BTN(asPlanned === false)}
                            onClick={() => onAsPlannedChange(false)}
                        >
                            No, hubo minutos fallidos
                        </button>
                    </div>
                </div>
            </div>

            {asPlanned === false ? (
                <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        Ajusta solo los minutos en los que no llegaste a la prescripción.
                    </p>
                    {intervals.map((interval) => (
                        <div key={interval.intervalKey} className={ATHLETE_RUN_AMRAP_PARTIAL_CARD}>
                            <NexiaGlassAccentRim />
                            <div className="relative z-[1] space-y-4">
                                <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL}>
                                    {formatEmomMinuteLabel(
                                        intervalSeconds,
                                        interval.minuteIndex,
                                        interval.minuteTotal
                                    )}
                                </p>
                                {interval.slots.map((slot) => {
                                    const value =
                                        overrides[interval.intervalKey]?.[slot.stepKey] ??
                                        slot.defaultReps;

                                    return (
                                        <div key={slot.stepKey} className="space-y-2">
                                            <div className="min-w-0">
                                                <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL}>
                                                    {slot.exerciseName}
                                                </p>
                                                <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_META}>
                                                    Prescripción: {slot.defaultReps} reps
                                                </p>
                                            </div>
                                            <AthleteRunStepperControl
                                                label="Reps realizadas"
                                                value={value}
                                                onDecrease={() =>
                                                    onOverrideChange(
                                                        interval.intervalKey,
                                                        slot.stepKey,
                                                        Math.max(0, value - 1)
                                                    )
                                                }
                                                onIncrease={() =>
                                                    onOverrideChange(
                                                        interval.intervalKey,
                                                        slot.stepKey,
                                                        Math.min(slot.defaultReps, value + 1)
                                                    )
                                                }
                                                decreaseDisabled={value <= 0}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <AthleteRoundEffortSection
                variant="block"
                value={roundRpe}
                onChange={onRoundRpeChange}
            />
        </div>
    );
};
