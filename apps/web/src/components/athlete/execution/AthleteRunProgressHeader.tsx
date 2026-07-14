/**
 * AthleteRunProgressHeader.tsx — Barra de progreso sesión (V05 run).
 */

import React from "react";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { ATHLETE_RUN_STEP_CAPTION } from "./athleteRunPresentation";

export interface AthleteRunProgressHeaderProps {
    step: number;
    totalSteps: number;
    blockName?: string | null;
}

export const AthleteRunProgressHeader: React.FC<AthleteRunProgressHeaderProps> = ({
    step,
    totalSteps,
    blockName,
}) => {
    const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;

    return (
        <header className="space-y-2">
            <p className={ATHLETE_RUN_STEP_CAPTION}>
                Paso {step + 1} / {totalSteps}
                {blockName ? ` · ${blockName}` : ""}
            </p>
            <AthleteProgressBar
                value={progress}
                tone="primary"
                aria-label={`Progreso de sesión ${step + 1} de ${totalSteps}`}
            />
        </header>
    );
};
