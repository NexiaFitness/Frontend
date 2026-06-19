/**
 * AthleteAmrapRoundsLogger.tsx — Rondas completadas AMRAP (V05 Fase C).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteRunStepperControl } from "./AthleteRunStepperControl";
import {
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "./athleteRunPresentation";

export interface AthleteAmrapRoundsLoggerProps {
    rounds: number;
    targetRounds: number | null;
    onRoundsChange: (value: number) => void;
}

export const AthleteAmrapRoundsLogger: React.FC<AthleteAmrapRoundsLoggerProps> = ({
    rounds,
    targetRounds,
    onRoundsChange,
}) => {
    return (
        <div className={`${ATHLETE_RUN_AMRAP_ROUNDS_CARD} ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
                <div className="space-y-0.5">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Resultado AMRAP</p>
                    {targetRounds != null ? (
                        <p className="text-xs text-muted-foreground/85">
                            Objetivo del entrenador: {targetRounds} rondas
                        </p>
                    ) : null}
                </div>
                <AthleteRunStepperControl
                    label="Rondas completadas"
                    value={rounds}
                    onDecrease={() => onRoundsChange(Math.max(0, rounds - 1))}
                    onIncrease={() => onRoundsChange(rounds + 1)}
                    decreaseDisabled={rounds <= 0}
                />
            </div>
        </div>
    );
};
