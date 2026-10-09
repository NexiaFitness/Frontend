/**
 * AthleteMultiSlotLogger.tsx — Logger batch por slot (FE-4).
 * @author Frontend Team
 * @since v8.3.0
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { AthleteSetInputLogger } from "./AthleteSetInputLogger";
import { AthleteRoundEffortSection } from "@/components/athlete/execution/AthleteRoundEffortSection";
import {
    ATHLETE_RUN_LOGGER_REVEAL,
    ATHLETE_RUN_SLOT_LOGGER_CARD,
    ATHLETE_RUN_SLOT_LOGGER_LABEL,
    ATHLETE_RUN_SLOT_LOGGER_NAME,
} from "@/components/athlete/execution/athleteRunPresentation";
import { formatAthleteLogSlotSecondaryLabel } from "@nexia/shared/utils/athlete/athleteRunLabelPresentation";

export interface SlotLogValues {
    weight: number;
    reps: number;
    durationSeconds?: number;
}

export interface AthleteMultiSlotLoggerProps {
    slots: AthleteRunRoundSlot[];
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
    slotReferenceWeightKg?: Record<string, number | null | undefined>;
}

export const AthleteMultiSlotLogger: React.FC<AthleteMultiSlotLoggerProps> = ({
    slots,
    slotLogs,
    onSlotChange,
    roundRpe,
    onRoundRpeChange,
    slotReferenceWeightKg = {},
}) => {
    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            {slots.map((slot, slotIndex) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                    durationSeconds: slot.defaultReps,
                };

                return (
                    <div key={slot.stepKey} className={ATHLETE_RUN_SLOT_LOGGER_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="relative z-[1] space-y-3">
                            <div className="min-w-0">
                                <p className={ATHLETE_RUN_SLOT_LOGGER_LABEL}>
                                    {formatAthleteLogSlotSecondaryLabel({
                                        slotLabel: slot.slotLabel,
                                        slotIndexZeroBased: slotIndex,
                                    })}
                                </p>
                                <p className={ATHLETE_RUN_SLOT_LOGGER_NAME}>
                                    {slot.exerciseName}
                                </p>
                            </div>
                            <AthleteSetInputLogger
                                inputMode={slot.inputMode}
                                weight={log.weight}
                                reps={log.reps}
                                durationSeconds={log.durationSeconds ?? log.reps}
                                plannedWeight={slot.defaultWeight}
                                referenceWeightKg={slotReferenceWeightKg[slot.stepKey]}
                                showRpe={false}
                                onWeightChange={(value) =>
                                    onSlotChange(slot.stepKey, { weight: value })
                                }
                                onRepsChange={(value) =>
                                    onSlotChange(slot.stepKey, { reps: value })
                                }
                                onDurationSecondsChange={(value) =>
                                    onSlotChange(slot.stepKey, {
                                        durationSeconds: value,
                                        reps: value,
                                    })
                                }
                            />
                        </div>
                    </div>
                );
            })}

            <AthleteRoundEffortSection
                variant="round"
                value={roundRpe}
                onChange={onRoundRpeChange}
            />
        </div>
    );
};
