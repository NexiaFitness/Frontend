/**
 * ExerciseDetailReadingContent.tsx — Técnica del ejercicio en la ficha del entrenador.
 *
 * Solo entrenador y admin. Carga el texto y delega el render en ExerciseTechniqueText
 * (SPEC_H10 §6.2). Sin texto, no pinta nada. Sin atribución por ejercicio desde H8-A
 * (decisión de Nelson, 2026-11-06): vive solo en /creditos.
 */

import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@nexia/shared";
import { canReadExerciseContent } from "@nexia/shared/utils/exerciseContentAccess";
import { useGetExerciseContentQuery } from "@nexia/shared/api/exerciseContentApi";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import {
    EXERCISE_DETAIL_ALERT_SPACING,
    EXERCISE_DETAIL_READING_COPY,
    EXERCISE_DETAIL_READING_RETRY,
    EXERCISE_DETAIL_READING_SKELETON,
    EXERCISE_DETAIL_READING_SKELETON_LINE,
    EXERCISE_DETAIL_READING_SKELETON_LINE_SHORT,
} from "@/components/exercises/exerciseDetailPresentation";
import { ExerciseTechniqueText } from "@/components/exercises/ExerciseTechniqueText";

interface ExerciseDetailReadingContentProps {
    exerciseId: number;
}

export const ExerciseDetailReadingContent: React.FC<ExerciseDetailReadingContentProps> = ({
    exerciseId,
}) => {
    const user = useSelector(selectUser);
    const canRead = canReadExerciseContent(user?.role);
    const { data, isLoading, isError, refetch } = useGetExerciseContentQuery(exerciseId, {
        skip: !canRead,
    });

    if (!canRead) return null;

    if (isLoading) {
        return (
            <div
                className={EXERCISE_DETAIL_READING_SKELETON}
                role="status"
                aria-label={EXERCISE_DETAIL_READING_COPY.loadingLabel}
            >
                <div className={EXERCISE_DETAIL_READING_SKELETON_LINE} />
                <div className={EXERCISE_DETAIL_READING_SKELETON_LINE} />
                <div className={EXERCISE_DETAIL_READING_SKELETON_LINE_SHORT} />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                variant="error"
                className={EXERCISE_DETAIL_ALERT_SPACING}
                title={EXERCISE_DETAIL_READING_COPY.errorTitle}
                action={
                    <Button
                        type="button"
                        variant="ghost-primary"
                        className={EXERCISE_DETAIL_READING_RETRY}
                        onClick={() => void refetch()}
                    >
                        {EXERCISE_DETAIL_READING_COPY.retry}
                    </Button>
                }
            />
        );
    }

    const description = data?.description?.trim() ?? "";
    const steps = data?.steps ?? [];
    const tips = data?.tips ?? [];
    if (!description && steps.length === 0 && tips.length === 0) return null;

    return (
        <ExerciseTechniqueText
            description={description}
            steps={steps}
            tips={tips}
            inEnglish={data?.in_english ?? false}
        />
    );
};
