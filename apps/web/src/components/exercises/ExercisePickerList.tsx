/**
 * ExercisePickerList.tsx — Lista del selector de ejercicios: avisos, búsqueda y filas.
 *
 * Contexto: extraída de ExercisePickerPanel (PERF-7). El panel conserva el catálogo, el
 * lote de seguridad y el filtrado; esta lista solo pinta lo que recibe.
 * - Virtualizada (FE-2, @tanstack/react-virtual): con el catálogo completo montaba ~3.200
 *   nodos. Letras y filas van en una lista plana; la altura real se mide porque una fila
 *   con aviso se expande.
 * Notas de mantenimiento: fila en ExercisePickerRow; copy y clases en
 * exercisePickerPresentation.ts.
 *
 * @author Frontend Team
 * @since PERF-7
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, RotateCcw } from "lucide-react";
import type { ExercisePickerOut } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyResponse } from "@nexia/shared/types/engineSafety";
import { exerciseSafetyUiState } from "@nexia/shared/utils/exerciseSafetyState";
import { LoadingSpinner, Alert, NexiaSemanticIcon } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import { ExercisePickerRow } from "./ExercisePickerRow";
import {
    EXERCISE_PICKER_BATCH_ALERT,
    EXERCISE_PICKER_COPY,
    EXERCISE_PICKER_ESTIMATED_LETTER_PX,
    EXERCISE_PICKER_ESTIMATED_ROW_PX,
    EXERCISE_PICKER_INJURY_BANNER,
    EXERCISE_PICKER_LETTER,
    EXERCISE_PICKER_LETTER_GAP,
    EXERCISE_PICKER_LIST_CANVAS,
    EXERCISE_PICKER_LIST_ITEM,
    EXERCISE_PICKER_LIST_SCROLL,
    EXERCISE_PICKER_OVERSCAN,
    EXERCISE_PICKER_ROW_SLOT,
} from "./exercisePickerPresentation";

type PickerListItem =
    | { kind: "letter"; key: string; letter: string }
    | { kind: "exercise"; key: string; exercise: ExercisePickerOut };

/** Letras y filas en una sola lista plana para el virtualizador. */
function flattenGroups(groups: [string, ExercisePickerOut[]][]): PickerListItem[] {
    return groups.flatMap(([letter, exercises]) => [
        { kind: "letter" as const, key: `letter-${letter}`, letter },
        ...exercises.map((exercise) => ({
            kind: "exercise" as const,
            key: `exercise-${exercise.id}`,
            exercise,
        })),
    ]);
}

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
    const scrollRef = useRef<HTMLDivElement>(null);
    const items = useMemo(() => flattenGroups(filteredAndGrouped), [filteredAndGrouped]);
    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => scrollRef.current,
        getItemKey: (index) => items[index].key,
        estimateSize: (index) =>
            items[index].kind === "letter"
                ? EXERCISE_PICKER_ESTIMATED_LETTER_PX
                : EXERCISE_PICKER_ESTIMATED_ROW_PX,
        overscan: EXERCISE_PICKER_OVERSCAN,
    });

    // Cada búsqueda empieza arriba. Por el virtualizador, no por scrollTop: si no, al medir
    // las filas nuevas corrige el scroll con el offset viejo y la lista queda a media altura.
    useEffect(() => {
        virtualizer.scrollToOffset(0);
    }, [search, virtualizer]);

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
            <div ref={scrollRef} className={EXERCISE_PICKER_LIST_SCROLL}>
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
                    <div className={EXERCISE_PICKER_LIST_CANVAS} style={{ height: virtualizer.getTotalSize() }}>
                        {virtualizer.getVirtualItems().map((virtualItem) => {
                            const item = items[virtualItem.index];
                            let content: React.ReactNode;
                            if (item.kind === "letter") {
                                content = (
                                    <span
                                        className={cn(
                                            EXERCISE_PICKER_LETTER,
                                            virtualItem.index > 0 && EXERCISE_PICKER_LETTER_GAP
                                        )}
                                    >
                                        {item.letter}
                                    </span>
                                );
                            } else {
                                const ex = item.exercise;
                                const safety = safetyResults.get(ex.id);
                                const isExpanded = expandedExerciseId === ex.id;
                                const checkPending = safetyPending && safety == null;
                                content = (
                                    <div className={EXERCISE_PICKER_ROW_SLOT}>
                                        <ExercisePickerRow
                                            exercise={ex}
                                            safety={safety}
                                            state={
                                                safetyApplies
                                                    ? exerciseSafetyUiState(safety, {
                                                          checkFailed: safetyCheckFailed,
                                                          checkPending,
                                                      })
                                                    : null
                                            }
                                            checkPending={safetyApplies && checkPending}
                                            isExpanded={isExpanded}
                                            onToggle={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                                            onSelect={onSelect}
                                            onShowAlternatives={onShowAlternatives}
                                        />
                                    </div>
                                );
                            }
                            return (
                                <div
                                    key={virtualItem.key}
                                    data-index={virtualItem.index}
                                    ref={virtualizer.measureElement}
                                    className={EXERCISE_PICKER_LIST_ITEM}
                                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};
