/**
 * ExerciseAlternativesSection.tsx — Sección de alternativas en ExerciseDetail
 */

import React from "react";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import {
    useGetExerciseAlternativesQuery,
    useGetAutoSuggestedAlternativesQuery,
} from "@nexia/shared/api/exerciseAlternativesApi";
import { formatEquipmentLabelLine } from "@/utils/exercises";
import {
    EXERCISE_DETAIL_ALT_DIVIDER,
    EXERCISE_DETAIL_ALT_EMPTY,
    EXERCISE_DETAIL_ALT_ITEM,
    EXERCISE_DETAIL_ALT_LIST,
    EXERCISE_DETAIL_ALT_LOADING,
    EXERCISE_DETAIL_ALT_META,
    EXERCISE_DETAIL_ALT_REASON,
    EXERCISE_DETAIL_ALT_SECTION_GAP,
    EXERCISE_DETAIL_ALT_SUBHEADING,
    EXERCISE_DETAIL_ALT_ITEM_TITLE,
    EXERCISE_DETAIL_ALT_BLOCK,
    EXERCISE_DETAIL_SECTION_LABELS,
    EXERCISE_DETAIL_SIDE_CARD,
    EXERCISE_DETAIL_SIDE_SECTION_TITLE,
    EXERCISE_DETAIL_SPEC_LABEL,
} from "./exerciseDetailPresentation";
import { cn } from "@/lib/utils";

interface ExerciseAlternativesSectionProps {
    exerciseId: number;
    variant?: "default" | "sidebar";
}

export const ExerciseAlternativesSection: React.FC<ExerciseAlternativesSectionProps> = ({
    exerciseId,
    variant = "default",
}) => {
    const isSidebar = variant === "sidebar";

    const {
        data: manualAlternatives = [],
        isLoading: isLoadingManual,
    } = useGetExerciseAlternativesQuery(exerciseId);

    const {
        data: suggestedAlternatives = [],
        isLoading: isLoadingSuggested,
    } = useGetAutoSuggestedAlternativesQuery(
        { exerciseId, limit: 6 },
        { skip: !exerciseId }
    );

    const isLoading = isLoadingManual || isLoadingSuggested;
    const hasManual = manualAlternatives.length > 0;
    const hasSuggested = suggestedAlternatives.length > 0;
    const isEmpty = !hasManual && !hasSuggested;
    const totalCount = manualAlternatives.length + suggestedAlternatives.length;

    const rootClass = isSidebar ? EXERCISE_DETAIL_SIDE_CARD : EXERCISE_DETAIL_ALT_DIVIDER;
    const titleClass = isSidebar ? EXERCISE_DETAIL_SIDE_SECTION_TITLE : EXERCISE_DETAIL_SPEC_LABEL;

    const title = isSidebar
        ? `${EXERCISE_DETAIL_SECTION_LABELS.alternatives}${totalCount > 0 ? ` · ${totalCount}` : ""}`
        : EXERCISE_DETAIL_SECTION_LABELS.alternatives;

    if (isLoading) {
        return (
            <div className={rootClass}>
                <p className={titleClass}>{title}</p>
                <div className={cn(EXERCISE_DETAIL_ALT_LOADING, isSidebar && "py-4")}>
                    <LoadingSpinner size="sm" />
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className={rootClass}>
                <p className={titleClass}>{title}</p>
                <p className={EXERCISE_DETAIL_ALT_EMPTY}>
                    No hay alternativas definidas ni sugerencias disponibles.
                </p>
            </div>
        );
    }

    return (
        <div className={rootClass}>
            <p className={titleClass}>{title}</p>

            {hasManual && (
                <div className={EXERCISE_DETAIL_ALT_BLOCK}>
                    <p className={EXERCISE_DETAIL_ALT_SUBHEADING}>
                        {EXERCISE_DETAIL_SECTION_LABELS.manualAlternatives}
                    </p>
                    <ul className={EXERCISE_DETAIL_ALT_LIST}>
                        {manualAlternatives.map((alt) => (
                            <li key={alt.id} className={EXERCISE_DETAIL_ALT_ITEM}>
                                <p className={EXERCISE_DETAIL_ALT_ITEM_TITLE}>
                                    {alt.alternative_exercise_name ??
                                        `Ejercicio #${alt.alternative_exercise_id}`}
                                </p>
                                {alt.alternative_exercise_equipo && (
                                    <p className={EXERCISE_DETAIL_ALT_META}>
                                        {formatEquipmentLabelLine(alt.alternative_exercise_equipo)}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {hasSuggested && (
                <div className={hasManual ? EXERCISE_DETAIL_ALT_SECTION_GAP : EXERCISE_DETAIL_ALT_BLOCK}>
                    <p className={EXERCISE_DETAIL_ALT_SUBHEADING}>
                        {EXERCISE_DETAIL_SECTION_LABELS.suggestedAlternatives}
                    </p>
                    <ul className={EXERCISE_DETAIL_ALT_LIST}>
                        {suggestedAlternatives.map((alt) => (
                            <li key={alt.id} className={EXERCISE_DETAIL_ALT_ITEM}>
                                <p className={EXERCISE_DETAIL_ALT_ITEM_TITLE}>{alt.nombre}</p>
                                <p className={EXERCISE_DETAIL_ALT_META}>
                                    {[
                                        alt.equipo && formatEquipmentLabelLine(alt.equipo),
                                        alt.musculatura_principal,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                                {alt.reason && (
                                    <p className={EXERCISE_DETAIL_ALT_REASON}>{alt.reason}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
