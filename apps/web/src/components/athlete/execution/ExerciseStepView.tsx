/**
 * ExerciseStepView.tsx — Vista de un paso de ejecución (1 serie).
 */

import React from "react";
import { Play } from "lucide-react";
import type { AthleteFlatExercise } from "@nexia/shared/offline";
import type { InjuryAlert } from "@nexia/shared/types/injuryAlert";
import { Badge } from "@/components/ui/Badge";
import { AthleteExerciseInjuryAlert } from "@/components/athlete/AthleteExerciseInjuryAlert";
import { AthleteSetLogger } from "./AthleteSetLogger";
import { AthleteLastPerformanceHint } from "./AthleteLastPerformanceHint";
import type { AthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";
import { hasAthleteLastPerformance } from "@nexia/shared/types/athleteLastPerformance";

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
}) => {
    return (
        <div className="space-y-4">
            <p className="text-caption text-muted-foreground">
                Serie {step + 1} / {totalSteps}
                {exercise.blockName ? ` · ${exercise.blockName}` : ""}
            </p>

            {exercise.groupKind && exercise.groupKind !== "single_set" && (
                <Badge variant="outline">{exercise.groupKind.replace("_", " ").toUpperCase()}</Badge>
            )}

            <h1 className="text-2xl font-bold text-foreground">{exercise.name}</h1>
            <p className="text-lg text-muted-foreground">{exercise.plannedLabel}</p>

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
                />
            )}

            {exercise.videoUrl ? (
                <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                    <video
                        src={exercise.videoUrl}
                        controls
                        playsInline
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-muted/40">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Play className="size-8 opacity-40" aria-hidden />
                        <span className="text-caption">Vídeo no disponible</span>
                    </div>
                </div>
            )}

            <AthleteSetLogger
                weight={weight}
                reps={reps}
                rpe={rpe}
                onWeightChange={onWeightChange}
                onRepsChange={onRepsChange}
                onRpeChange={onRpeChange}
            />
        </div>
    );
};
