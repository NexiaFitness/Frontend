/**
 * DropsetBlock.tsx — Constructor card dropset (diseño Lovable, acento naranja).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Timer } from "lucide-react";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import {
    normalizeDropsetRow,
    setDataToExerciseView,
    updateDropsetData,
} from "../utils/dropsetRow";
import { ConstructorCardHeader } from "../primitives/ConstructorCardHeader";
import { ConstructorGroupParamsBar } from "../primitives/ConstructorGroupParamsBar";
import { DropStepRow } from "../primitives/DropStepRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import { isFilledConstructorExercise } from "../utils/supersetRow";
import {
    CONSTRUCTOR_DROPSET_CARD_CLASS,
    CONSTRUCTOR_COLUMN_HEADER_CLASS,
    CONSTRUCTOR_FIELD_LABEL_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../primitives/constructorCardStyles";

const EXERCISE_GRID_CLASS =
    "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_102px_102px] gap-2 items-center sm:justify-items-stretch [&>*:nth-child(2)]:sm:justify-self-center [&>*:nth-child(3)]:sm:justify-self-center";

const COLUMN_HEADER_GRID_CLASS =
    "sm:grid-cols-[44px_minmax(0,1fr)_102px_102px] [&>span:nth-child(3)]:justify-self-center [&>span:nth-child(4)]:justify-self-center";

export interface DropsetBlockProps {
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

export const DropsetBlock: React.FC<DropsetBlockProps> = ({
    row,
    blockTypes,
    groupLabel,
    onUpdate,
    onAddExercise,
    onUpdateExercise: _onUpdateExercise,
    onDuplicate,
    onRemove,
}) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const normalized = normalizeDropsetRow(row);
    const repsTipo = normalized.repsTipo ?? "reps";
    const exercise = normalized.exercises[0];
    const hasExercise = exercise && isFilledConstructorExercise(exercise);
    const setData = normalized.setData ?? [];

    const handleSetDataFieldChange = (
        setDataId: string,
        updates: Record<string, unknown>
    ) => {
        const nextRow = updateDropsetData(normalized, setDataId, updates);
        onUpdate(normalized.id, { setData: nextRow.setData, sets: nextRow.sets });
    };

    const placeholderExercise: ConstructorExercise = {
        id: `ex-drop-${normalized.id}`,
        exerciseId: 0,
        exerciseName: "",
        plannedReps: null,
        plannedWeight: null,
        plannedDuration: null,
        effortCharacter: null,
        effortValue: null,
        notes: null,
    };

    const baseExercise = exercise ?? placeholderExercise;

    return (
        <div className={CONSTRUCTOR_DROPSET_CARD_CLASS}>
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
                    <ConstructorGroupParamsBar badgeLabel={groupLabel} variant="dropset">
                        <div className="flex items-center gap-2">
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>Series</span>
                            <InlineNumberInput
                                size="xs"
                                min={2}
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
                            <Timer className="h-3.5 w-3.5 text-orange-600/70 dark:text-orange-400/70" />
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>
                                Descanso tras secuencia
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
                        <span className="text-center w-full">Carácter</span>
                    </div>

                    <div className="space-y-2 px-4 pb-3 pt-1">
                        {setData.map((entry, index) => {
                            const view = setDataToExerciseView(entry);
                            const syntheticExercise: ConstructorExercise = {
                                ...baseExercise,
                                ...view,
                            };
                            const isMain = index === 0;
                            return (
                                <DropStepRow
                                    key={entry.id}
                                    stepIndex={index}
                                    isLast={index === setData.length - 1}
                                >
                                    <div className={EXERCISE_GRID_CLASS}>
                                        {isMain ? (
                                            hasExercise ? (
                                                <ExercisePickerField
                                                    exerciseName={exercise.exerciseName}
                                                    onPick={() =>
                                                        onAddExercise(
                                                            normalized.id,
                                                            exercise.id
                                                        )
                                                    }
                                                    onClear={() =>
                                                        onUpdate(normalized.id, {
                                                            exercises: [],
                                                            setData: setData.map((s) => ({
                                                                ...s,
                                                                isManuallyEdited: false,
                                                            })),
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <ExercisePickerField
                                                    exerciseName=""
                                                    onPick={() =>
                                                        onAddExercise(normalized.id)
                                                    }
                                                />
                                            )
                                        ) : (
                                            <span className="block h-8" aria-hidden />
                                        )}
                                        <RepsTiempoField
                                            exercise={syntheticExercise}
                                            rowRepsTipo={repsTipo}
                                            onRowRepsTipoChange={(mode) =>
                                                onUpdate(normalized.id, { repsTipo: mode })
                                            }
                                            onExerciseChange={(updates) =>
                                                handleSetDataFieldChange(entry.id, updates)
                                            }
                                        />
                                        <CaracterField
                                            exercise={syntheticExercise}
                                            onExerciseChange={(updates) =>
                                                handleSetDataFieldChange(entry.id, updates)
                                            }
                                        />
                                    </div>
                                </DropStepRow>
                            );
                        })}
                    </div>

                    <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>
                        Sin descanso entre drops · Mismo ejercicio con carga descendente en cada
                        paso
                    </p>
                </>
            ) : null}
        </div>
    );
};
