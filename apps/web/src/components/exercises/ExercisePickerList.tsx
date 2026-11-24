/**
 * ExercisePickerList.tsx — Lista del selector de ejercicios: avisos, búsqueda y filas.
 *
 * Contexto: extraída de ExercisePickerPanel (PERF-7). El panel conserva el catálogo, el
 * lote de seguridad y el filtrado; esta lista solo pinta lo que recibe.
 * Notas de mantenimiento: fila en ExercisePickerRow; copy y clases en
 * exercisePickerPresentation.ts.
 *
 * @author Frontend Team
 * @since PERF-7
 */

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import type { ExercisePickerOut } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import { exerciseSafetyUiState } from "@nexia/shared/utils/exerciseSafetyState";
import { LoadingSpinner, Alert, NexiaSemanticIcon } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { ExercisePickerRow } from "./ExercisePickerRow";
import {
    EXERCISE_PICKER_BATCH_ALERT,
    EXERCISE_PICKER_COPY,
    EXERCISE_PICKER_INJURY_BANNER,
} from "./exercisePickerPresentation";

export interface ExercisePickerListProps {
    isLoading: boolean;
    catalogFailed: boolean;
    onRetryCatalog: () => void;
    isLoadingBatch: boolean;
    hasActiveInjuries: boolean;
    search: string;
    setSearch: (s: string) => void;
    filteredAndGrouped: [string, ExercisePickerOut[]][];
    safetyApplies: boolean;
    safetyResults: Map<number, ExerciseSafetyResponse>;
    safetyCheckFailed: boolean;
    safetyPending: boolean;
    onRetrySafety: () => void;
    expandedExerciseId: number | null;
    setExpandedExerciseId: (id: number | null) => void;
    onSelect: (exercise: ExercisePickerOut) => void;
    onShowAlternatives: (exerciseId: number) => void;
}

export const ExercisePickerList: React.FC<ExercisePickerListProps> = ({
    isLoading,
    catalogFailed,
    onRetryCatalog,
    isLoadingBatch,
    hasActiveInjuries,
    search,
    setSearch,
    filteredAndGrouped,
    safetyApplies,
    safetyResults,
    safetyCheckFailed,
    safetyPending,
    onRetrySafety,
    expandedExerciseId,
    setExpandedExerciseId,
    onSelect,
    onShowAlternatives,
}) => {
    return (
        <>
            {/* Aviso lesiones */}
            {hasActiveInjuries && (
                <div className={EXERCISE_PICKER_INJURY_BANNER}>
                    <NexiaSemanticIcon tone="warning" size="sm" />
                    <span>{EXERCISE_PICKER_COPY.injuryBanner}</span>
                </div>
            )}

            {/* Batch loading indicator */}
            {isLoadingBatch && (
                <div className="mx-3 mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <LoadingSpinner size="sm" />
                    <span>Verificando seguridad...</span>
                </div>
            )}

            {safetyCheckFailed ? (
                <Alert
                    variant="error"
                    className={EXERCISE_PICKER_BATCH_ALERT}
                    description={EXERCISE_PICKER_COPY.batchFailed}
                    action={
                        <Button variant="ghost-primary" size="sm" onClick={onRetrySafety}>
                            <RotateCcw aria-hidden />
                            {EXERCISE_PICKER_COPY.retry}
                        </Button>
                    }
                />
            ) : null}

            {/* Busqueda */}
            <div className="relative mx-3 mt-3 min-w-0">
                <Search className="absolute left-2 top-1.5 h-3 w-3 text-primary pointer-events-none z-10" />
                <Input
                    type="text"
                    size="compact"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ejercicio..."
                    className="w-full pl-7"
                    aria-label="Buscar ejercicio"
                />
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0 scrollbar-primary">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="md" />
                    </div>
                ) : catalogFailed ? (
                    <Alert
                        variant="error"
                        description={EXERCISE_PICKER_COPY.catalogFailed}
                        action={
                            <Button variant="ghost-primary" size="sm" onClick={onRetryCatalog}>
                                <RotateCcw aria-hidden />
                                {EXERCISE_PICKER_COPY.retry}
                            </Button>
                        }
                    />
                ) : filteredAndGrouped.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No se encontraron ejercicios.
                    </p>
                ) : (
                    filteredAndGrouped.map(([letter, groupExercises]) => (
                        <div key={letter}>
                            <span className="block text-[11px] font-bold text-primary/70 mb-1">
                                {letter}
                            </span>
                            <div className="space-y-0.5">
                                {groupExercises.map((ex) => {
                                    const safety = safetyResults.get(ex.id);
                                    const isExpanded = expandedExerciseId === ex.id;
                                    return (
                                        <ExercisePickerRow
                                            key={ex.id}
                                            exercise={ex}
                                            safety={safety}
                                            state={
                                                safetyApplies
                                                    ? exerciseSafetyUiState(safety, {
                                                          checkFailed: safetyCheckFailed,
                                                          checkPending: safetyPending && safety == null,
                                                      })
                                                    : null
                                            }
                                            isExpanded={isExpanded}
                                            onToggle={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                                            onSelect={onSelect}
                                            onShowAlternatives={onShowAlternatives}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};
