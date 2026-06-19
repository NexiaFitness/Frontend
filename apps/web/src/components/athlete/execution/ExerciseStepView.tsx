/**
 * ExerciseStepView.tsx — Vista de un paso de ejecución (V05 Fase B premium).
 */

import React from "react";
import { Play } from "lucide-react";
import type { AthleteFlatExercise } from "@nexia/shared/offline";
import type { InjuryAlert } from "@nexia/shared/types/injuryAlert";
import type { AthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import type { AthleteSuggestedLoad } from "@nexia/shared/types/athleteSuggestedLoad";
import type { AthleteRunGroupContextView } from "@nexia/shared/utils/athlete/athleteRunGroupContext";
import { hasAthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import { shouldShowSuggestedLoad } from "@nexia/shared/types/athleteSuggestedLoad";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteExerciseInjuryAlert } from "@/components/athlete/AthleteExerciseInjuryAlert";
import { AthleteRunStepHeader } from "./AthleteRunStepHeader";
import { AthleteRunGroupContextCard } from "./AthleteRunGroupContextCard";
import { AthleteSetLogger } from "./AthleteSetLogger";
import { AthleteLastPerformanceHint } from "./AthleteLastPerformanceHint";
import { AthleteSuggestedLoadHint } from "./AthleteSuggestedLoadHint";
import {
    ATHLETE_RUN_HINT_CARD,
    ATHLETE_RUN_LOGGER_CARD,
    ATHLETE_RUN_LOGGER_SECTION_LABEL,
    ATHLETE_RUN_VIDEO_PLACEHOLDER,
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
    injuryConflict,
    lastPerformance,
    lastPerformanceDateLabel,
    onApplyLastPerformance,
    suggestedLoad,
    onApplySuggestedLoad,
    groupContext,
}) => {
    return (
        <div className="space-y-4">
            <AthleteRunStepHeader
                exercise={exercise}
                step={step}
                totalSteps={totalSteps}
                hideInstruction={Boolean(groupContext)}
                hideGroupMeta={Boolean(groupContext)}
            />

            {groupContext ? <AthleteRunGroupContextCard context={groupContext} /> : null}

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

            {exercise.videoUrl ? (
                <div className={`${ATHLETE_RUN_VIDEO_PLACEHOLDER} overflow-hidden`}>
                    <NexiaGlassAccentRim />
                    <video
                        src={exercise.videoUrl}
                        controls
                        playsInline
                        className="relative z-[1] h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className={ATHLETE_RUN_VIDEO_PLACEHOLDER}>
                    <NexiaGlassAccentRim />
                    <div className="relative z-[1] flex flex-col items-center gap-2 text-muted-foreground">
                        <Play className="size-8 opacity-40" aria-hidden />
                        <span className="text-caption">Vídeo no disponible</span>
                    </div>
                </div>
            )}

            <div className="space-y-2">
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
        </div>
    );
};
