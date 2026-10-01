/**
 * AthleteForTimeLiveProgress.tsx — Referencia de rondas FOR TIME durante el bloque (B4).
 */

import React, { useMemo } from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_RUN_FOR_TIME_LIVE_CARD,
    ATHLETE_RUN_FOR_TIME_NEXT_ACTION,
    ATHLETE_RUN_FOR_TIME_SPLITS_LABEL,
} from "./athleteRunPresentation";

export interface AthleteForTimeLiveProgressProps {
    roundTotal: number;
    blockWorkIsReady?: boolean;
}

export const AthleteForTimeLiveProgress: React.FC<AthleteForTimeLiveProgressProps> = ({
    roundTotal,
    blockWorkIsReady = false,
}) => {
    const nextActionHint = useMemo(() => {
        if (blockWorkIsReady) return null;
        const roundsLabel =
            roundTotal === 1 ? "1 ronda" : `${roundTotal} rondas`;
        return `Completa las ${roundsLabel} a tu ritmo y pulsa «Terminar» cuando acabes el bloque.`;
    }, [blockWorkIsReady, roundTotal]);

    if (blockWorkIsReady || roundTotal === 0) return null;

    return (
        <div className={ATHLETE_RUN_FOR_TIME_LIVE_CARD}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-2">
                <p className={ATHLETE_RUN_FOR_TIME_SPLITS_LABEL}>Progreso FOR TIME</p>
                <p className="text-sm text-muted-foreground">
                    {roundTotal === 1
                        ? "1 ronda prescrita — el cronómetro mide el tiempo total del bloque."
                        : `${roundTotal} rondas prescritas — el cronómetro mide el tiempo total del bloque.`}
                </p>
                {nextActionHint ? (
                    <p className={ATHLETE_RUN_FOR_TIME_NEXT_ACTION}>{nextActionHint}</p>
                ) : null}
            </div>
        </div>
    );
};
