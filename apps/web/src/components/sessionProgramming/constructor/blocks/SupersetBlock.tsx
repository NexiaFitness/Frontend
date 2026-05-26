/**
 * SupersetBlock.tsx — Constructor card superset (diseño Lovable).
 * @spec docs/tipo-serie/07_superset-lovable-spec.md
 * @author Frontend Team
 * @since v5.3.0
 * @updated v6.1.0 — Navegación de series por ejercicio A1/A2 con setData independiente
 */

import React from "react";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import {
    normalizeSupersetRow,
    updateSupersetExerciseSetData,
} from "../utils/supersetRow";
import { ConstructorCardHeader } from "../primitives/ConstructorCardHeader";
import { ConstructorGroupParamsBar } from "../primitives/ConstructorGroupParamsBar";
import { GroupedExerciseRow } from "../primitives/GroupedExerciseRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import {
    applyCaracterUpdateWithInheritance,
    hasCaracterChange,
} from "../utils/exerciseCaracterInheritance";
import {
    CONSTRUCTOR_CARD_CLASS,
    CONSTRUCTOR_COLUMN_HEADER_CLASS,
    CONSTRUCTOR_FIELD_LABEL_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../primitives/constructorCardStyles";

const SLOT_LABELS = ["A1", "A2"] as const;

const EXERCISE_GRID_CLASS =
    "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_102px_102px] gap-2 items-center sm:justify-items-stretch [&>*:nth-child(2)]:sm:justify-self-center [&>*:nth-child(3)]:sm:justify-self-center";

const COLUMN_HEADER_GRID_CLASS =
    "sm:grid-cols-[40px_minmax(0,1fr)_102px_102px] [&>span:nth-child(3)]:justify-self-center [&>span:nth-child(4)]:justify-self-center";

function getExerciseSetView(
    exercise: ConstructorExercise,
    setIndex: number
): ConstructorExercise {
    const entry = exercise.setData?.[setIndex];
    if (!entry) return exercise;
    return {
        ...exercise,
        plannedReps: entry.plannedReps,
        plannedWeight: entry.plannedWeight,
        plannedDuration: entry.plannedDuration,
        effortCharacter: entry.effortCharacter,
        effortValue: entry.effortValue,
    };
}

export interface SupersetBlockProps {
    row: ConstructorRow;
    blockTypes: TrainingBlockType[];
    groupLabel: string;
    onUpdate: (rowId: string, updates: Partial<ConstructorRow>) => void;
    onAddExercise: (rowId: string, exerciseSlotId?: string) => void;
    onUpdateExercise: (
        rowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => void;
    onDuplicate?: (rowId: string) => void;
    onRemove?: (rowId: string) => void;
}

export const SupersetBlock: React.FC<SupersetBlockProps> = ({
    row,
    blockTypes,
    groupLabel,
    onUpdate,
    onAddExercise,
    onUpdateExercise,
    onDuplicate,
    onRemove,
}) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [activeSetIndex, setActiveSetIndex] = React.useState(0);
    const normalized = normalizeSupersetRow(row);
    const totalSets = normalized.sets ?? 3;

    const handleExerciseChange = (
        index: number,
        updates: Partial<ConstructorExercise>
    ) => {
        if (hasCaracterChange(updates)) {
            const nextExercises = applyCaracterUpdateWithInheritance(
                normalized.exercises,
                index,
                updates
            );
            onUpdate(normalized.id, { exercises: nextExercises });
        } else {
            onUpdateExercise(normalized.id, normalized.exercises[index].id, updates);
        }
    };

    const handleSetDataChange = (
        index: number,
        updates: Partial<ConstructorExercise>
    ) => {
        const exercise = normalized.exercises[index];
        const setData = exercise.setData;
        if (!setData || setData.length === 0) {
            // Legacy path: no setData, update exercise directly
            handleExerciseChange(index, updates);
            return;
        }
        const entryId = setData[activeSetIndex]?.id;
        if (!entryId) return;

        const mapped: Partial<import("../../constructorTypes").ConstructorSetData> = {};
        if ("plannedReps" in updates) mapped.plannedReps = updates.plannedReps ?? null;
        if ("plannedWeight" in updates) mapped.plannedWeight = updates.plannedWeight ?? null;
        if ("plannedDuration" in updates) mapped.plannedDuration = updates.plannedDuration ?? null;
        if ("effortCharacter" in updates) mapped.effortCharacter = updates.effortCharacter ?? null;
        if ("effortValue" in updates) mapped.effortValue = updates.effortValue ?? null;

        const nextExercise = updateSupersetExerciseSetData(exercise, entryId, mapped);
        const nextExercises = [...normalized.exercises];
        nextExercises[index] = nextExercise;
        onUpdate(normalized.id, { exercises: nextExercises });
    };

    const canGoBack = activeSetIndex > 0;
    const canGoForward = activeSetIndex < totalSets - 1;

    return (
        <div className={CONSTRUCTOR_CARD_CLASS} data-constructor-row-id={normalized.id}>
            <ConstructorCardHeader
                blockTypeId={normalized.blockTypeId}
                blockTypes={blockTypes}
                setType={normalized.setType}
                onSetTypeChange={(setType) => onUpdate(normalized.id, { setType })}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((v) => !v)}
                onDuplicate={onDuplicate ? () => onDuplicate(normalized.id) : undefined}
                onRemove={onRemove ? () => onRemove(normalized.id) : undefined}
            />

            {!collapsed ? (
                <>
                    <ConstructorGroupParamsBar badgeLabel={groupLabel}>
                        <div className="flex items-center gap-2">
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>Series</span>
                            <InlineNumberInput
                                size="xs"
                                min={1}
                                value={normalized.sets ?? ""}
                                onChange={(e) =>
                                    onUpdate(normalized.id, {
                                        sets: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-12"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Timer className="h-3 w-3 text-primary/70 shrink-0" aria-hidden />
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>
                                Descanso por ronda
                            </span>
                            <InlineNumberInput
                                size="xs"
                                min={0}
                                value={normalized.rest ?? ""}
                                onChange={(e) =>
                                    onUpdate(normalized.id, {
                                        rest: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-12"
                            />
                            <span className="text-[10px] text-muted-foreground">seg</span>
                        </div>
                    </ConstructorGroupParamsBar>

                    <div
                        className={`${CONSTRUCTOR_COLUMN_HEADER_CLASS} ${COLUMN_HEADER_GRID_CLASS}`}
                    >
                        <span />
                        <span>Ejercicio</span>
                        <span className="text-center w-full">Reps / Tiempo</span>
                        <span className="text-center w-full">Caracter</span>
                    </div>

                    <div className="space-y-2 px-4 pb-3 pt-1">
                        {normalized.exercises.map((ex, index) => {
                            const setView = getExerciseSetView(ex, activeSetIndex);
                            return (
                                <GroupedExerciseRow
                                    key={ex.id}
                                    slotLabel={SLOT_LABELS[index] ?? `A${index + 1}`}
                                    isLast={index === normalized.exercises.length - 1}
                                >
                                    <div className={EXERCISE_GRID_CLASS}>
                                        <ExercisePickerField
                                            exerciseName={ex.exerciseName}
                                            onPick={() => onAddExercise(normalized.id, ex.id)}
                                            onClear={() =>
                                                onUpdateExercise(normalized.id, ex.id, {
                                                    exerciseId: 0,
                                                    exerciseName: "",
                                                })
                                            }
                                        />
                                        <RepsTiempoField
                                            exercise={setView}
                                            rowRepsTipo={normalized.repsTipo}
                                            onExerciseChange={(updates) =>
                                                handleSetDataChange(index, updates)
                                            }
                                        />
                                        <CaracterField
                                            exercise={setView}
                                            onExerciseChange={(updates) =>
                                                handleSetDataChange(index, updates)
                                            }
                                        />
                                    </div>
                                </GroupedExerciseRow>
                            );
                        })}
                    </div>

                    {/* Navegación de rondas compartida */}
                    <div className="flex items-center justify-center gap-1.5 pb-2 pt-3">
                        <button
                            type="button"
                            onClick={() => setActiveSetIndex((i) => Math.max(0, i - 1))}
                            disabled={!canGoBack}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Ronda anterior"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                            Ronda {activeSetIndex + 1} de {totalSets}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setActiveSetIndex((i) =>
                                    Math.min(totalSets - 1, i + 1)
                                )
                            }
                            disabled={!canGoForward}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Ronda siguiente"
                        >
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                        </button>
                    </div>

                    <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>
                        El Superset siempre contiene 2 ejercicios. Para más, usa Giant Set.
                    </p>
                </>
            ) : null}
        </div>
    );
};
