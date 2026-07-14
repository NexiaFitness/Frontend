/**
 * AthleteEmomCompletionReview.tsx — Cierre EMOM: cuántos fallaron + parámetros (V05).
 */

import React, { useMemo } from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { EmomFailureEntry } from "@nexia/shared/utils/athlete/emomResult";
import { formatEmomCompletionNotation } from "@nexia/shared/utils/athlete/emomResult";
import { AthleteRunStepperControl } from "./AthleteRunStepperControl";
import { AthleteRoundEffortSection } from "./AthleteRoundEffortSection";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_PARTIAL_CARD,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_META,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_AMRAP_SUMMARY,
    ATHLETE_RUN_EMOM_CHOICE_BTN,
    ATHLETE_RUN_EMOM_CHOICE_ROW,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "./athleteRunPresentation";

export interface AthleteEmomCompletionReviewProps {
    intervals: AthleteEmomInterval[];
    templateSlots: AthleteRunRoundSlot[];
    intervalSeconds: number | null;
    asPlanned: boolean | null;
    onAsPlannedChange: (value: boolean) => void;
    failedCount: number;
    onFailedCountChange: (value: number) => void;
    failureEntries: readonly EmomFailureEntry[];
    onFailureEntryChange: (entryIndex: number, stepKey: string, value: number) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

export const AthleteEmomCompletionReview: React.FC<AthleteEmomCompletionReviewProps> = ({
    intervals,
    templateSlots,
    intervalSeconds,
    asPlanned,
    onAsPlannedChange,
    failedCount,
    onFailedCountChange,
    failureEntries,
    onFailureEntryChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    const intervalTotal = intervals.length;

    const completionSummary = useMemo(() => {
        if (asPlanned === null) return null;
        if (asPlanned) {
            return `${intervalTotal}/${intervalTotal} intervalos`;
        }
        const failedLabel =
            intervalSeconds != null && intervalSeconds > 0
                ? ` · ${intervalSeconds} s por intervalo`
                : "";
        return `${formatEmomCompletionNotation(intervals, false, failedCount)} intervalos${failedLabel}`;
    }, [asPlanned, failedCount, intervalSeconds, intervalTotal, intervals]);

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Cierre EMOM</p>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        ¿Completaste todos los intervalos como estaba previsto?
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
                            No, hubo intervalos fallidos
                        </button>
                    </div>
                    {completionSummary ? (
                        <p className={ATHLETE_RUN_AMRAP_SUMMARY}>{completionSummary}</p>
                    ) : null}
                </div>
            </div>

            {asPlanned === false ? (
                <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
                    <div className={ATHLETE_RUN_AMRAP_PARTIAL_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="relative z-[1] space-y-3">
                            <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL}>
                                ¿Cuántos intervalos fallaste?
                            </p>
                            <AthleteRunStepperControl
                                label="Intervalos fallidos"
                                value={failedCount}
                                onDecrease={() => onFailedCountChange(failedCount - 1)}
                                onIncrease={() => onFailedCountChange(failedCount + 1)}
                                decreaseDisabled={failedCount <= 1}
                                increaseDisabled={failedCount >= intervalTotal}
                            />
                        </div>
                    </div>

                    {failureEntries.map((entry, entryIndex) => (
                        <div key={`emom-failed-${entryIndex}`} className={ATHLETE_RUN_AMRAP_PARTIAL_CARD}>
                            <NexiaGlassAccentRim />
                            <div className="relative z-[1] space-y-4">
                                <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL}>
                                    Fallo {entryIndex + 1} de {failedCount}
                                </p>
                                <p className={ATHLETE_RUN_AMRAP_HINT}>
                                    Indica las reps que hiciste en este fallo.
                                </p>
                                {templateSlots.map((slot) => {
                                    const value = entry[slot.stepKey] ?? 0;

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
                                                    onFailureEntryChange(
                                                        entryIndex,
                                                        slot.stepKey,
                                                        Math.max(0, value - 1)
                                                    )
                                                }
                                                onIncrease={() =>
                                                    onFailureEntryChange(
                                                        entryIndex,
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
