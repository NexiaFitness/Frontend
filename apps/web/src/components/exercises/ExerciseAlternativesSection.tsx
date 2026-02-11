/**
 * ExerciseAlternativesSection.tsx — Sección de alternativas en ExerciseDetail
 *
 * Contexto:
 * - Consume GET /exercise-alternatives/exercise/{id} (manual) + auto-suggest (TICK-E05)
 * - Muestra alternativas definidas por el trainer y sugerencias automáticas
 *
 * @author Frontend Team
 * @since v6.2.6 - TICK-E05
 */

import React from "react";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import {
    useGetExerciseAlternativesQuery,
    useGetAutoSuggestedAlternativesQuery,
} from "@nexia/shared/api/exerciseAlternativesApi";
import { getEquipmentLabel } from "@/utils/exercises";

interface ExerciseAlternativesSectionProps {
    exerciseId: number;
}

export const ExerciseAlternativesSection: React.FC<ExerciseAlternativesSectionProps> = ({
    exerciseId,
}) => {
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

    if (isLoading) {
        return (
            <div className="mb-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
                    Alternativas
                </p>
                <div className="flex justify-center py-6">
                    <LoadingSpinner size="sm" />
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="mb-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">
                    Alternativas
                </p>
                <p className="text-sm text-slate-500">
                    No hay alternativas definidas ni sugerencias disponibles.
                </p>
            </div>
        );
    }

    return (
        <div className="mb-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
                Alternativas
            </p>

            {hasManual && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Definidas manualmente</p>
                    <ul className="space-y-2">
                        {manualAlternatives.map((alt) => (
                            <li
                                key={alt.id}
                                className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                            >
                                <p className="font-medium text-slate-800">
                                    {alt.alternative_exercise_name ?? `Ejercicio #${alt.alternative_exercise_id}`}
                                </p>
                                {alt.alternative_exercise_equipo && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {getEquipmentLabel(alt.alternative_exercise_equipo)}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {hasSuggested && (
                <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Sugerencias automáticas</p>
                    <ul className="space-y-2">
                        {suggestedAlternatives.map((alt) => (
                            <li
                                key={alt.id}
                                className="p-3 rounded-lg bg-blue-50/50 border border-blue-100"
                            >
                                <p className="font-medium text-slate-800">{alt.nombre}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {[alt.equipo && getEquipmentLabel(alt.equipo), alt.musculatura_principal]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                                {alt.reason && (
                                    <p className="text-xs text-blue-600 mt-1">{alt.reason}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
