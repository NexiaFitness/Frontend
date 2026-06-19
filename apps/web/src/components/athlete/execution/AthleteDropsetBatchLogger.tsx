/**
 * AthleteDropsetBatchLogger.tsx — Registro batch post-secuencia (V05 B.2.1).
 * Un ejercicio, N escalones — peso/reps por escalón; RPE compartido al cierre.
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
    ATHLETE_RUN_DROPSET_LOGGER_HEADER,
    ATHLETE_RUN_DROPSET_LOGGER_SUB,
    formatRunSetLabel,
} from "./athleteRunPresentation";
import type { SlotLogValues } from "./AthleteMultiSlotLogger";

export interface AthleteDropsetBatchLoggerProps {
    slots: AthleteRunRoundSlot[];
    slotLogs: Record<string, SlotLogValues>;
    onSlotChange: (slotKey: string, patch: Partial<SlotLogValues>) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

export const AthleteDropsetBatchLogger: React.FC<AthleteDropsetBatchLoggerProps> = ({
    slots,
    slotLogs,
    onSlotChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    if (!slots.length) return null;

    const exerciseName = slots[0]?.exerciseName ?? "";

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className="space-y-0.5 px-0.5">
                <p className={ATHLETE_RUN_DROPSET_LOGGER_HEADER}>{exerciseName}</p>
                <p className={ATHLETE_RUN_DROPSET_LOGGER_SUB}>
                    Registra peso y reps de cada escalón (baja ~15–25&nbsp;% respecto al
                    anterior)
                </p>
            </div>

            {slots.map((slot) => {
                const log = slotLogs[slot.stepKey] ?? {
                    weight: slot.defaultWeight,
                    reps: slot.defaultReps,
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
                variant="dropset"
                value={roundRpe}
                onChange={onRoundRpeChange}
            />
        </div>
    );
};
