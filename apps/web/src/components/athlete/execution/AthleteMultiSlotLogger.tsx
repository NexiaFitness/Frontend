/**
 * AthleteMultiSlotLogger.tsx — Logger batch por slot (V05 B.2, §5b.1).
 * Peso/reps por ejercicio; RPE compartido al cierre de la ronda.
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { AthleteSetLogger } from "./AthleteSetLogger";
import { AthleteRoundEffortSection } from "./AthleteRoundEffortSection";
import {
    ATHLETE_RUN_LOGGER_REVEAL,
    ATHLETE_RUN_SLOT_LOGGER_CARD,
    ATHLETE_RUN_SLOT_LOGGER_LABEL,
    ATHLETE_RUN_SLOT_LOGGER_NAME,
} from "./athleteRunPresentation";

export interface SlotLogValues {
    weight: number;
    reps: number;
}

export interface AthleteMultiSlotLoggerProps {
    slots: AthleteRunRoundSlot[];
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

export const AthleteMultiSlotLogger: React.FC<AthleteMultiSlotLoggerProps> = ({
    slots,
    slotLogs,
    onSlotChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            {slots.map((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                };

                return (
                    <div key={slot.stepKey} className={ATHLETE_RUN_SLOT_LOGGER_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="relative z-[1] space-y-3">
                            <div className="min-w-0">
                                <p className={ATHLETE_RUN_SLOT_LOGGER_LABEL}>
                                    Registro · {slot.slotLabel}
                                </p>
                                <p className={ATHLETE_RUN_SLOT_LOGGER_NAME}>
                                    {slot.exerciseName}
                                </p>
                            </div>
                            <AthleteSetLogger
                                weight={log.weight}
                                reps={log.reps}
                                showRpe={false}
                                onWeightChange={(value) =>
                                    onSlotChange(slot.stepKey, { weight: value })
                                }
                                onRepsChange={(value) =>
                                    onSlotChange(slot.stepKey, { reps: value })
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
