/**
 * AthleteRunStepHeader.tsx — Progreso, badge de grupo y contexto de ronda (V05 Fase B).
 */

import React from "react";
import type { AthleteFlatExercise } from "@nexia/shared/offline";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    ATHLETE_RUN_EXERCISE_TITLE,
    ATHLETE_RUN_GROUP_BADGE,
    ATHLETE_RUN_INSTRUCTION,
    ATHLETE_RUN_PRESCRIPTION,
    ATHLETE_RUN_ROUND_PILL,
    ATHLETE_RUN_STEP_CAPTION,
    formatRunContextLine,
    formatRunPrescriptionLine,
    resolveRunGroupBadge,
} from "./athleteRunPresentation";

export interface AthleteRunStepHeaderProps {
    exercise: AthleteFlatExercise;
    step: number;
    totalSteps: number;
    hideInstruction?: boolean;
    /** Superset/giant/dropset: la card de grupo ya muestra badges y prescripción. */
    hideGroupMeta?: boolean;
}

export const AthleteRunStepHeader: React.FC<AthleteRunStepHeaderProps> = ({
    exercise,
    step,
    totalSteps,
    hideInstruction = false,
    hideGroupMeta = false,
}) => {
    const progress = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0;
    const groupBadge = hideGroupMeta ? null : resolveRunGroupBadge(exercise);
    const contextLine = hideGroupMeta ? null : formatRunContextLine(exercise);

    return (
        <header className="space-y-3">
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <p className={ATHLETE_RUN_STEP_CAPTION}>
                        Paso {step + 1} / {totalSteps}
                        {exercise.blockName ? ` · ${exercise.blockName}` : ""}
                    </p>
                </div>
                <AthleteProgressBar
                    value={progress}
                    tone="primary"
                    aria-label={`Progreso de sesión ${step + 1} de ${totalSteps}`}
                />
            </div>

            {(groupBadge || contextLine) && (
                <div className="flex flex-wrap items-center gap-2">
                    {groupBadge && <span className={ATHLETE_RUN_GROUP_BADGE}>{groupBadge}</span>}
                    {contextLine && <span className={ATHLETE_RUN_ROUND_PILL}>{contextLine}</span>}
                </div>
            )}

            <div className={hideGroupMeta ? "space-y-0" : "space-y-2"}>
                <h1 className={ATHLETE_RUN_EXERCISE_TITLE}>{exercise.name}</h1>
                {!hideGroupMeta ? (
                    <p className={ATHLETE_RUN_PRESCRIPTION}>{formatRunPrescriptionLine(exercise)}</p>
                ) : null}
            </div>

            {exercise.instruction && !hideInstruction ? (
                <p className={ATHLETE_RUN_INSTRUCTION}>{exercise.instruction}</p>
            ) : null}

            {!hideGroupMeta ? <NexiaPremiumDivider className="w-full" /> : null}
        </header>
    );
};
