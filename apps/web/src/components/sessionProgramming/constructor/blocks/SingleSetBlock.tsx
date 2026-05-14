/**
 * SingleSetBlock.tsx — Constructor card single_set (diseño Lovable).
 * @spec docs/tipo-serie/08_single-set-card-borrador.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import {
    normalizeSingleSetRow,
    setDataToExerciseView,
    updateSingleSetData,
} from "../utils/singleSetRow";
import { ConstructorCardHeader } from "../primitives/ConstructorCardHeader";
import { ConstructorGroupParamsBar } from "../primitives/ConstructorGroupParamsBar";
import { GroupedExerciseRow } from "../primitives/GroupedExerciseRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import { isFilledConstructorExercise } from "../utils/supersetRow";
import {
    CONSTRUCTOR_CARD_CLASS,
    CONSTRUCTOR_COLUMN_HEADER_CLASS,
    CONSTRUCTOR_FIELD_LABEL_CLASS,
} from "../primitives/constructorCardStyles";

const SET_GRID_CLASS =
    "grid grid-cols-1 sm:grid-cols-[108px_108px_72px] gap-2 items-center";

const COLUMN_HEADER_GRID_CLASS = "sm:grid-cols-[40px_108px_108px_72px]";

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
    onDuplicate?: (rowId: string) => void;
    onRemove?: (rowId: string) => void;
}

export const SingleSetBlock: React.FC<SingleSetBlockProps> = ({
    row,
    blockTypes,
    onUpdate,
    onAddExercise,
    onUpdateExercise: _onUpdateExercise,
    onDuplicate,
    onRemove,
}) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const normalized = normalizeSingleSetRow(row);
    const repsTipo = normalized.repsTipo ?? "reps";
    const exercise = normalized.exercises[0];
    const hasExercise = exercise && isFilledConstructorExercise(exercise);

    const handleSetDataFieldChange = (
        setDataId: string,
        field: "reps" | "caracter" | "rest",
        updates: Record<string, unknown>
    ) => {
        const patch: Parameters<typeof updateSingleSetData>[2] = {};
        if (field === "reps" || field === "caracter") {
            Object.assign(patch, updates);
        } else if (field === "rest") {
            patch.rest = updates.rest as number | null;
        }
        const nextRow = updateSingleSetData(normalized, setDataId, patch);
        onUpdate(normalized.id, { setData: nextRow.setData, sets: nextRow.sets });
    };

    return (
        <div className={CONSTRUCTOR_CARD_CLASS}>
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
                    <ConstructorGroupParamsBar badgeLabel="SINGLE SET">
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
                    </ConstructorGroupParamsBar>

                    <div className="border-b border-border/40 px-4 py-3 bg-surface/20">
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
                        <>
                            <div
                                className={`${CONSTRUCTOR_COLUMN_HEADER_CLASS} ${COLUMN_HEADER_GRID_CLASS}`}
                            >
                                <span />
                                <span className="text-center">Reps / Tiempo</span>
                                <span className="text-center">Carácter</span>
                                <span className="text-center">Descanso</span>
                            </div>
                            <div className="space-y-2 px-4 pb-3 pt-1">
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
                                            isLast={
                                                index === normalized.setData!.length - 1
                                            }
                                        >
                                            <div className={SET_GRID_CLASS}>
                                                <RepsTiempoField
                                                    repsTipo={repsTipo}
                                                    exercise={syntheticExercise}
                                                    showModeSelector={index === 0}
                                                    onRepsTipoChange={(mode) =>
                                                        onUpdate(normalized.id, {
                                                            repsTipo: mode,
                                                        })
                                                    }
                                                    onExerciseChange={(updates) =>
                                                        handleSetDataFieldChange(
                                                            entry.id,
                                                            "reps",
                                                            updates
                                                        )
                                                    }
                                                />
                                                <CaracterField
                                                    exercise={syntheticExercise}
                                                    onExerciseChange={(updates) =>
                                                        handleSetDataFieldChange(
                                                            entry.id,
                                                            "caracter",
                                                            updates
                                                        )
                                                    }
                                                />
                                                <div className="flex h-8 items-center justify-center gap-1">
                                                    <InlineNumberInput
                                                        size="xs"
                                                        min={0}
                                                        value={entry.rest ?? ""}
                                                        onChange={(e) =>
                                                            handleSetDataFieldChange(
                                                                entry.id,
                                                                "rest",
                                                                {
                                                                    rest: e.target.value
                                                                        ? Number(e.target.value)
                                                                        : null,
                                                                }
                                                            )
                                                        }
                                                        className="w-12"
                                                    />
                                                    <span className="text-[10px] text-muted-foreground">
                                                        seg
                                                    </span>
                                                </div>
                                            </div>
                                        </GroupedExerciseRow>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                </>
            ) : null}
        </div>
    );
};
