/**
 * ExerciseDetailReadingContent.tsx — Descripción, pasos y consejos del ejercicio.
 *
 * Solo entrenador y admin. Sin texto, no pinta secciones vacías.
 */

import React from "react";
import { useSelector } from "react-redux";
import { selectUser } from "@nexia/shared";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import { useGetExerciseContentQuery } from "@nexia/shared/api/exerciseContentApi";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import {
    EXERCISE_DETAIL_ALERT_SPACING,
    EXERCISE_DETAIL_BODY_MUTED_PRESERVE,
    EXERCISE_DETAIL_READING_ATTRIBUTION,
    EXERCISE_DETAIL_READING_COPY,
    EXERCISE_DETAIL_READING_LINK,
    EXERCISE_DETAIL_READING_LIST,
    EXERCISE_DETAIL_READING_NOTE,
    EXERCISE_DETAIL_READING_RETRY,
    EXERCISE_DETAIL_READING_SKELETON,
    EXERCISE_DETAIL_READING_SKELETON_LINE,
    EXERCISE_DETAIL_READING_SKELETON_LINE_SHORT,
    EXERCISE_DETAIL_READING_STACK,
    EXERCISE_DETAIL_READING_TIPS,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SPEC_LABEL,
} from "@/components/exercises/exerciseDetailPresentation";

interface ExerciseDetailReadingContentProps {
    exerciseId: number;
}

export const ExerciseDetailReadingContent: React.FC<ExerciseDetailReadingContentProps> = ({
    exerciseId,
}) => {
    const user = useSelector(selectUser);
    const canRead =
        user?.role === USER_ROLES.TRAINER || user?.role === USER_ROLES.ADMIN;
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
        <div className={EXERCISE_DETAIL_READING_STACK}>
            {data?.in_english ? (
                <p className={EXERCISE_DETAIL_READING_NOTE}>
                    {EXERCISE_DETAIL_SECTION_LABELS.inEnglish}
                </p>
            ) : null}
            {description ? (
                <section>
                    <h2 className={EXERCISE_DETAIL_SPEC_LABEL}>
                        {EXERCISE_DETAIL_SECTION_LABELS.description}
                    </h2>
                    <p className={EXERCISE_DETAIL_BODY_MUTED_PRESERVE}>{description}</p>
                </section>
            ) : null}
            {steps.length > 0 ? (
                <section>
                    <h2 className={EXERCISE_DETAIL_SPEC_LABEL}>
                        {EXERCISE_DETAIL_SECTION_LABELS.howTo}
                    </h2>
                    <ol className={EXERCISE_DETAIL_READING_LIST}>
                        {steps.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                        ))}
                    </ol>
                </section>
            ) : null}
            {tips.length > 0 ? (
                <section>
                    <h2 className={EXERCISE_DETAIL_SPEC_LABEL}>
                        {EXERCISE_DETAIL_SECTION_LABELS.tips}
                    </h2>
                    <ul className={EXERCISE_DETAIL_READING_TIPS}>
                        {tips.map((tip, index) => (
                            <li key={`${index}-${tip}`}>{tip}</li>
                        ))}
                    </ul>
                </section>
            ) : null}
            {data?.attribution ? (
                <p className={EXERCISE_DETAIL_READING_ATTRIBUTION}>
                    <a
                        className={EXERCISE_DETAIL_READING_LINK}
                        href={data.attribution.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {data.attribution.label}
                    </a>
                </p>
            ) : null}
        </div>
    );
};
