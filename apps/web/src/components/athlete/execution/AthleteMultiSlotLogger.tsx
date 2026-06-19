/**
 * AthleteMultiSlotLogger.tsx — Logger batch por slot (V05 B.2, §5b.1).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { AthleteSetLogger } from "./AthleteSetLogger";
import {
    ATHLETE_RUN_LOGGER_REVEAL,
    ATHLETE_RUN_SLOT_LOGGER_CARD,
    ATHLETE_RUN_SLOT_LOGGER_LABEL,
} from "./athleteRunPresentation";

export interface SlotLogValues {
    weight: number;
    reps: number;
    rpe: number | null;
}

export interface AthleteMultiSlotLoggerProps {
    slots: AthleteRunRoundSlot[];
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
}

export const AthleteMultiSlotLogger: React.FC<AthleteMultiSlotLoggerProps> = ({
    slots,
    slotLogs,
    onSlotChange,
}) => {
    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            {slots.map((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                    rpe: slot.defaultRpe,
                };

                return (
                    <div key={slot.stepKey} className={ATHLETE_RUN_SLOT_LOGGER_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="relative z-[1] space-y-3">
                            <div className="min-w-0">
                                <p className={ATHLETE_RUN_SLOT_LOGGER_LABEL}>
                                    Registro · {slot.slotLabel}
                                </p>
                                <p className="truncate text-sm font-medium text-foreground">
                                    {slot.exerciseName}
                                </p>
                            </div>
                            <AthleteSetLogger
                                weight={log.weight}
                                reps={log.reps}
                                rpe={log.rpe}
                                onWeightChange={(value) =>
                                    onSlotChange(slot.stepKey, { weight: value })
                                }
                                onRepsChange={(value) =>
                                    onSlotChange(slot.stepKey, { reps: value })
                                }
                                onRpeChange={(value) =>
                                    onSlotChange(slot.stepKey, { rpe: value })
                                }
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
