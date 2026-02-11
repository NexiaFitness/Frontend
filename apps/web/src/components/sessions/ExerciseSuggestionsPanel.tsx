/**
 * ExerciseSuggestionsPanel.tsx — Panel de sugerencias de ejercicios por tipo
 *
 * Contexto:
 * - Consume GET /training-sessions/exercise-selection/suggestions (TICK-S06)
 * - Muestra sugerencias multi-articular y monoarticular para balancear sesión 70/30
 * - Click en sugerencia → agregar ejercicio con valores por defecto
 *
 * @author Frontend Team
 * @since v6.2.0 - TICK-S06
 */

import React from "react";
import { useGetExerciseSelectionSuggestionsQuery } from "@nexia/shared/api/trainingSessionsApi";
import type { ExerciseSelectionSuggestionItem } from "@nexia/shared/types/trainingSessions";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";

const SUGGESTION_LIMIT = 6;

interface ExerciseSuggestionsPanelProps {
    onAddSuggestion: (exerciseId: number, exerciseName: string) => void;
}

function SuggestionItem({
    item,
    onAdd,
}: {
    item: ExerciseSelectionSuggestionItem;
    onAdd: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onAdd}
            className="text-left w-full px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
            <p className="font-medium text-slate-800 text-sm truncate">{item.nombre}</p>
            {(item.equipo || item.musculatura_principal) && (
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {[item.equipo, item.musculatura_principal].filter(Boolean).join(" · ")}
                </p>
            )}
        </button>
    );
}

export const ExerciseSuggestionsPanel: React.FC<ExerciseSuggestionsPanelProps> = ({
    onAddSuggestion,
}) => {
    const { data: multiData, isLoading: isLoadingMulti } = useGetExerciseSelectionSuggestionsQuery(
        { exercise_type: "multi_joint", limit: SUGGESTION_LIMIT }
    );
    const { data: singleData, isLoading: isLoadingSingle } =
        useGetExerciseSelectionSuggestionsQuery({
            exercise_type: "single_joint",
            limit: SUGGESTION_LIMIT,
        });

    const isLoading = isLoadingMulti || isLoadingSingle;
    const multiSuggestions = multiData?.suggestions ?? [];
    const singleSuggestions = singleData?.suggestions ?? [];

    if (isLoading && multiSuggestions.length === 0 && singleSuggestions.length === 0) {
        return (
            <div className="flex items-center justify-center py-6">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    if (multiSuggestions.length === 0 && singleSuggestions.length === 0 && !isLoading) {
        return null;
    }

    return (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm font-semibold text-slate-700 mb-3">
                Sugerencias por tipo (70% multi-articular / 30% monoarticular)
            </p>
            <p className="text-xs text-slate-500 mb-3">
                Haz clic en un ejercicio para agregarlo con 3 series × 10 reps por defecto.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                        Multi-articular
                    </h4>
                    <div className="space-y-2">
                        {isLoadingMulti ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            multiSuggestions.map((item) => (
                                <SuggestionItem
                                    key={item.id}
                                    item={item}
                                    onAdd={() => onAddSuggestion(item.id, item.nombre)}
                                />
                            ))
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                        Monoarticular
                    </h4>
                    <div className="space-y-2">
                        {isLoadingSingle ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            singleSuggestions.map((item) => (
                                <SuggestionItem
                                    key={item.id}
                                    item={item}
                                    onAdd={() => onAddSuggestion(item.id, item.nombre)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
