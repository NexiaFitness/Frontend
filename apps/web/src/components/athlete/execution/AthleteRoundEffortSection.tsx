/**
 * AthleteRoundEffortSection.tsx — RPE compartido post-slots (superset / giant / dropset).
 * Separado visualmente de las cards por slot para no leerse como «del último ejercicio».
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteRunRpePicker } from "./AthleteRunRpePicker";
import {
    ATHLETE_RUN_ROUND_EFFORT_BRIDGE,
    ATHLETE_RUN_ROUND_EFFORT_BRIDGE_LABEL,
    ATHLETE_RUN_ROUND_EFFORT_CARD,
    ATHLETE_RUN_ROUND_EFFORT_SUB,
    ATHLETE_RUN_ROUND_EFFORT_TITLE,
    getAthleteRoundEffortCopy,
    type AthleteRoundEffortVariant,
} from "./athleteRunPresentation";

export interface AthleteRoundEffortSectionProps {
    variant: AthleteRoundEffortVariant;
    value: number | null;
    onChange: (value: number | null) => void;
}

export const AthleteRoundEffortSection: React.FC<AthleteRoundEffortSectionProps> = ({
    variant,
    value,
    onChange,
}) => {
    const copy = getAthleteRoundEffortCopy(variant);

    return (
        <div className="space-y-3">
            <div className={ATHLETE_RUN_ROUND_EFFORT_BRIDGE} aria-hidden>
                <span className={ATHLETE_RUN_ROUND_EFFORT_BRIDGE_LABEL}>{copy.bridgeLabel}</span>
            </div>

            <section
                className={ATHLETE_RUN_ROUND_EFFORT_CARD}
                aria-label={copy.ariaLabel}
            >
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-4">
                    <div className="space-y-1">
                        <h3 className={ATHLETE_RUN_ROUND_EFFORT_TITLE}>{copy.title}</h3>
                        <p className={ATHLETE_RUN_ROUND_EFFORT_SUB}>{copy.subtitle}</p>
                    </div>
                    <AthleteRunRpePicker value={value} onChange={onChange} hideHeader />
                </div>
            </section>
        </div>
    );
};
