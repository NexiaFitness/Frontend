/**
 * AthleteDropsetBatchLogger.tsx — Registro batch post-secuencia (V05 B.2.1).
 * Un ejercicio, N escalones — rellenar todos de golpe tras ejecutar sin tocar el móvil.
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { AthleteSetLogger } from "./AthleteSetLogger";
import {
    ATHLETE_RUN_LOGGER_REVEAL,
    ATHLETE_RUN_SLOT_LOGGER_CARD,
    ATHLETE_RUN_SLOT_LOGGER_LABEL,
    ATHLETE_RUN_DROPSET_LOGGER_HEADER,
    ATHLETE_RUN_DROPSET_LOGGER_SUB,
    formatRunSetLabel,
} from "./athleteRunPresentation";
import type { SlotLogValues } from "./AthleteMultiSlotLogger";

export interface AthleteDropsetBatchLoggerProps {
    slots: AthleteRunRoundSlot[];
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
}

export const AthleteDropsetBatchLogger: React.FC<AthleteDropsetBatchLoggerProps> = ({
    slots,
    slotLogs,
    onSlotChange,
}) => {
    if (!slots.length) return null;

    const exerciseName = slots[0]?.exerciseName ?? "";

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className="space-y-0.5 px-0.5">
                <p className={ATHLETE_RUN_DROPSET_LOGGER_HEADER}>{exerciseName}</p>
                <p className={ATHLETE_RUN_DROPSET_LOGGER_SUB}>
                    Registra peso, reps y RPE de cada escalón (baja ~15–25&nbsp;% respecto al
                    anterior)
                </p>
            </div>

            {slots.map((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
                    rpe: slot.defaultRpe,
                };
                const stepTitle = formatRunSetLabel(slot.setLabel || slot.slotLabel);

                return (
                    <div key={slot.stepKey} className={ATHLETE_RUN_SLOT_LOGGER_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="relative z-[1] space-y-3">
                            <p className={ATHLETE_RUN_SLOT_LOGGER_LABEL}>
                                {stepTitle}
                            </p>
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
