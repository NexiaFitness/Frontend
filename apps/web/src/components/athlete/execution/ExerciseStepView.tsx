/**
 * ExerciseStepView.tsx — Vista de un paso single_set (V05 Fase B premium).
 */

import React, { useMemo } from "react";
import type { AthleteFlatExercise } from "@nexia/shared/offline";
import type { InjuryAlert } from "@nexia/shared/types/injuryAlert";
import type { AthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import type { AthleteSuggestedLoad } from "@nexia/shared/types/athleteSuggestedLoad";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import { hasAthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import { shouldShowSuggestedLoad } from "@nexia/shared/types/athleteSuggestedLoad";
import type { AthleteRunRestPhase } from "@/hooks/athlete/useAthleteRunRestFlow";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteExerciseInjuryAlert } from "@/components/athlete/AthleteExerciseInjuryAlert";
import {
    AthleteRunGroupContextCard,
    type GroupContextSlotMeta,
} from "./AthleteRunGroupContextCard";
import { AthleteSetLogger } from "./AthleteSetLogger";
import { AthleteLastPerformanceHint } from "./AthleteLastPerformanceHint";
import { AthleteSuggestedLoadHint } from "./AthleteSuggestedLoadHint";
import { AthleteRunProgressHeader } from "./AthleteRunProgressHeader";
import { AthleteRunLoggingSummary } from "./AthleteRunLoggingSummary";
import { AthleteRunGroupHero } from "./AthleteRunGroupHero";
import { AthleteRunSessionReadyCard } from "./AthleteRunSessionReadyCard";
import type { AthleteExerciseTechniqueTarget } from "./athleteExerciseTechniqueUtils";
import {
    buildAthleteRunSingleSetContext,
    buildSingleSetLoggingSummary,
} from "./athleteRunSingleSetContext";
import {
    ATHLETE_RUN_HINT_CARD,
    ATHLETE_RUN_LOGGER_CARD,
    ATHLETE_RUN_LOGGER_REVEAL,
    ATHLETE_RUN_LOGGER_SECTION_LABEL,
} from "./athleteRunPresentation";

export interface ExerciseStepViewProps {
    exercise: AthleteFlatExercise;
    step: number;
    totalSteps: number;
    weight: number;
    reps: number;
    rpe: number | null;
    onWeightChange: (value: number) => void;
    onRepsChange: (value: number) => void;
    onRpeChange: (value: number | null) => void;
    restPhase: AthleteRunRestPhase;
    injuryConflict?: {
        alert: InjuryAlert;
        onConsultTrainer: () => void;
    };
    lastPerformance?: AthleteLastPerformance;
    lastPerformanceDateLabel?: string | null;
    onApplyLastPerformance?: () => void;
    suggestedLoad?: AthleteSuggestedLoad;
    onApplySuggestedLoad?: () => void;
    groupContext?: AthleteRunGroupContextView | null;
    showLogger?: boolean;
    onViewTechnique?: (target: AthleteExerciseTechniqueTarget) => void;
    sessionReadyToFinish?: boolean;
}

export const ExerciseStepView: React.FC<ExerciseStepViewProps> = ({
    exercise,
    step,
    totalSteps,
    weight,
    reps,
    rpe,
    onWeightChange,
    onRepsChange,
    onRpeChange,
    restPhase,
    injuryConflict,
    lastPerformance,
    lastPerformanceDateLabel,
    onApplyLastPerformance,
    suggestedLoad,
    onApplySuggestedLoad,
    groupContext,
    showLogger = true,
    onViewTechnique,
    sessionReadyToFinish = false,
}) => {
    const isDoingPhase = restPhase === "doing";
    const isLoggingRest = restPhase === "logging_rest";

    const singleSetContext = useMemo(
        () => buildAthleteRunSingleSetContext(exercise),
        [exercise.stepKey]
    );

    const displayContext = groupContext ?? singleSetContext;
    const badgeLabel = displayContext.groupBadgeLabel ?? displayContext.sectionLabel;
    const roundLabel = displayContext.roundLabel ?? "";
    const loggingSummaryLabel = groupContext
        ? `${badgeLabel} · ${roundLabel}`
        : buildSingleSetLoggingSummary(exercise);

    const slotMeta = useMemo<GroupContextSlotMeta[]>(
        () => [
            {
                exerciseId: exercise.exerciseId,
                videoUrl: exercise.videoUrl,
                instruction: exercise.instruction ?? null,
            },
        ],
        [exercise.exerciseId, exercise.instruction, exercise.videoUrl]
    );

    if (sessionReadyToFinish && isDoingPhase) {
        return <AthleteRunSessionReadyCard />;
    }

    return (
        <div className="space-y-4">
            <AthleteRunProgressHeader
                step={step}
                totalSteps={totalSteps}
                blockName={exercise.blockName}
            />

            {isDoingPhase ? (
                <div className="space-y-4">
                    <AthleteRunGroupHero badgeLabel={badgeLabel} roundLabel={roundLabel} />

                        <AthleteRunGroupContextCard
                            context={displayContext}
                            slotMeta={slotMeta}
                            onViewTechnique={onViewTechnique}
                        />

                        {injuryConflict && (
                            <AthleteExerciseInjuryAlert
                                exerciseName={exercise.name}
                                alert={injuryConflict.alert}
                                onConsultTrainer={injuryConflict.onConsultTrainer}
                                compact
                            />
                        )}

                        {hasAthleteLastPerformance(lastPerformance) && onApplyLastPerformance && (
                            <AthleteLastPerformanceHint
                                weightKg={lastPerformance.weight_kg}
                                reps={lastPerformance.reps}
                                rpe={lastPerformance.rpe}
                                performedAtLabel={lastPerformanceDateLabel ?? ""}
                                onApply={onApplyLastPerformance}
                                className={ATHLETE_RUN_HINT_CARD}
                            />
                        )}

                        {shouldShowSuggestedLoad(suggestedLoad) && onApplySuggestedLoad && (
                            <AthleteSuggestedLoadHint
                                suggestedWeightKg={suggestedLoad.suggested_weight_kg}
                                explanation={suggestedLoad.explanation}
                                onApply={onApplySuggestedLoad}
                                className={ATHLETE_RUN_HINT_CARD}
                            />
                        )}
                </div>
            ) : null}

            {isLoggingRest ? <AthleteRunLoggingSummary label={loggingSummaryLabel} /> : null}

            {showLogger ? (
                <div className={`space-y-2 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
                    <p className={ATHLETE_RUN_LOGGER_SECTION_LABEL}>Registro de serie</p>
                    <div className={ATHLETE_RUN_LOGGER_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="relative z-[1]">
                            <AthleteSetLogger
                                weight={weight}
                                reps={reps}
                                rpe={rpe}
                                onWeightChange={onWeightChange}
                                onRepsChange={onRepsChange}
                                onRpeChange={onRpeChange}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
