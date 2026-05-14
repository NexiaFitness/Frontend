/**
 * SingleSetBlock.tsx — Constructor card para single_set (1 ejercicio, N sub-filas).
 * Contexto: herencia por sub-fila entera desde serie 1; persistencia N líneas API.
 * @spec docs/tipo-serie/08_single-set-card-borrador.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormSelect } from "@/components/ui/forms";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import { cn } from "@/lib/utils";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { SetType, TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE_LABELS } from "@nexia/shared/types/sessionProgramming";
import { getTrainingBlockDisplayName } from "../utils/trainingBlockDisplay";
import {
    normalizeSingleSetRow,
    setDataToExerciseView,
    updateSingleSetData,
} from "../utils/singleSetRow";
import { GroupedExerciseRow } from "../primitives/GroupedExerciseRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import { isFilledConstructorExercise } from "../utils/supersetRow";

const SET_TYPE_OPTIONS = Object.entries(SET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export interface SingleSetBlockProps {
    row: ConstructorRow;
    blockTypes: TrainingBlockType[];
    onUpdate: (rowId: string, updates: Partial<ConstructorRow>) => void;
    onAddExercise: (rowId: string, exerciseSlotId?: string) => void;
    onUpdateExercise: (
        rowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => void;
}

export const SingleSetBlock: React.FC<SingleSetBlockProps> = ({
    row,
    blockTypes,
    onUpdate,
    onAddExercise,
    onUpdateExercise: _onUpdateExercise,
}) => {
    const normalized = normalizeSingleSetRow(row);
    const repsTipo = normalized.repsTipo ?? "reps";
    const exercise = normalized.exercises[0];
    const hasExercise = exercise && isFilledConstructorExercise(exercise);

    const blockSelectOptions = blockTypes.map((bt) => ({
        value: String(bt.id),
        label: getTrainingBlockDisplayName(bt.name),
    }));

    const handleSetTypeChange = (setType: SetType) => {
        onUpdate(normalized.id, { setType });
    };

    const handleSetsChange = (sets: number | null) => {
        onUpdate(normalized.id, { sets });
    };

    const handleSetDataFieldChange = (
        setDataId: string,
        field: "reps" | "caracter" | "rest",
        updates: Record<string, unknown>
    ) => {
        const patch: Parameters<typeof updateSingleSetData>[2] = {};
        if (field === "reps") {
            Object.assign(patch, updates);
        } else if (field === "caracter") {
            Object.assign(patch, updates);
        } else if (field === "rest") {
            patch.rest = updates.rest as number | null;
        }
        const nextRow = updateSingleSetData(normalized, setDataId, patch);
        onUpdate(normalized.id, { setData: nextRow.setData, sets: nextRow.sets });
    };

    return (
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface/30 px-4 py-3">
                <FormSelect
                    size="xs"
                    value={normalized.blockTypeId ? String(normalized.blockTypeId) : ""}
                    onChange={(e) => {
                        const v = e.target.value;
                        onUpdate(normalized.id, {
                            blockTypeId: v ? Number(v) : 0,
                        });
                    }}
                    options={blockSelectOptions}
                    placeholder="Bloque"
                    aria-label="Bloque de entrenamiento"
                    className={cn(
                        "!h-8 !min-h-8 min-w-[160px] shrink-0 font-medium",
                        "border border-primary/40 !bg-primary/10 !shadow-none",
                        normalized.blockTypeId ? "!text-primary" : "!text-muted-foreground"
                    )}
                />
                <FormSelect
                    size="xs"
                    value={normalized.setType}
                    onChange={(e) => handleSetTypeChange(e.target.value as SetType)}
                    options={SET_TYPE_OPTIONS}
                    className="!h-8 !min-h-8 w-[130px] shrink-0"
                    aria-label="Tipo de serie"
                />
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[11px] text-muted-foreground">Series</span>
                    <InlineNumberInput
                        size="xs"
                        min={1}
                        value={normalized.sets ?? ""}
                        onChange={(e) =>
                            handleSetsChange(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-14"
                    />
                </div>
            </div>

            <div className="border-b border-border/60 px-4 py-3 bg-surface/10">
                {hasExercise ? (
                    <ExercisePickerField
                        exerciseName={exercise.exerciseName}
                        onPick={() => onAddExercise(normalized.id, exercise.id)}
                        onClear={() =>
                            onUpdate(normalized.id, {
                                exercises: [],
                                setData: normalized.setData?.map((s) => ({
                                    ...s,
                                    isManuallyEdited: false,
                                })),
                            })
                        }
                    />
                ) : (
                    <ExercisePickerField
                        exerciseName=""
                        onPick={() => onAddExercise(normalized.id)}
                    />
                )}
            </div>

            {hasExercise && normalized.setData ? (
                <div className="px-4 py-3 space-y-3">
                    <div className="hidden sm:grid sm:grid-cols-[140px_160px_72px] gap-3 px-[52px] text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <span className="text-center">Reps / Tiempo</span>
                        <span className="text-center">Carácter</span>
                        <span className="text-center">Descanso</span>
                    </div>

                    {normalized.setData.map((entry, index) => {
                        const view = setDataToExerciseView(entry);
                        const syntheticExercise: ConstructorExercise = {
                            ...exercise,
                            ...view,
                        };
                        return (
                            <GroupedExerciseRow
                                key={entry.id}
                                slotLabel={`S${index + 1}`}
                                isLast={index === normalized.setData!.length - 1}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-[140px_160px_72px] gap-3 items-center">
                                    <RepsTiempoField
                                        repsTipo={repsTipo}
                                        exercise={syntheticExercise}
                                        showModeSelector={index === 0}
                                        onRepsTipoChange={(mode) =>
                                            onUpdate(normalized.id, { repsTipo: mode })
                                        }
                                        onExerciseChange={(updates) =>
                                            handleSetDataFieldChange(entry.id, "reps", updates)
                                        }
                                    />
                                    <CaracterField
                                        exercise={syntheticExercise}
                                        onExerciseChange={(updates) =>
                                            handleSetDataFieldChange(entry.id, "caracter", updates)
                                        }
                                    />
                                    <div className="flex items-center justify-center gap-1 min-h-8">
                                        <InlineNumberInput
                                            size="xs"
                                            min={0}
                                            value={entry.rest ?? ""}
                                            onChange={(e) =>
                                                handleSetDataFieldChange(entry.id, "rest", {
                                                    rest: e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                })
                                            }
                                            className="w-14"
                                        />
                                        <span className="text-[10px] text-muted-foreground">seg</span>
                                    </div>
                                </div>
                            </GroupedExerciseRow>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};
