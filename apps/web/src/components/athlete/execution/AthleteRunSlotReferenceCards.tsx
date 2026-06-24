/**
 * AthleteRunSlotReferenceCards — Referencia compacta por slot (F3e superset/giant/dropset).
 */

import React from "react";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { AthleteRunRoundSlot } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { AthleteRunReferenceCard } from "./AthleteRunReferenceCard";
import {
    ATHLETE_RUN_SLOT_LOGGER_LABEL,
    ATHLETE_RUN_SLOT_LOGGER_NAME,
} from "./athleteRunPresentation";

export interface AthleteRunSlotReferenceCardsProps {
    slots: AthleteRunRoundSlot[];
    referencesBySlotKey: Record<string, AthleteRunReference | undefined>;
    isLoading?: boolean;
}

export const AthleteRunSlotReferenceCards: React.FC<AthleteRunSlotReferenceCardsProps> = ({
    slots,
    referencesBySlotKey,
    isLoading = false,
}) => {
    if (!slots.length) return null;

    return (
        <div className="space-y-3">
            {slots.map((slot) => (
                <div key={slot.stepKey} className="space-y-1.5">
                    <div className="min-w-0 px-0.5">
                        <p className={ATHLETE_RUN_SLOT_LOGGER_LABEL}>{slot.slotLabel}</p>
                        <p className={ATHLETE_RUN_SLOT_LOGGER_NAME}>{slot.exerciseName}</p>
                    </div>
                    <AthleteRunReferenceCard
                        data={referencesBySlotKey[slot.stepKey]}
                        isLoading={isLoading}
                    />
                </div>
            ))}
        </div>
    );
};
