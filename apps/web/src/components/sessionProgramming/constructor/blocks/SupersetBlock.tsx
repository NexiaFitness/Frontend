/**
 * SupersetBlock.tsx — Constructor card superset (diseño Lovable).
 * @spec docs/tipo-serie/07_superset-lovable-spec.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Timer } from "lucide-react";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { normalizeSupersetRow } from "../utils/supersetRow";
import { ConstructorCardHeader } from "../primitives/ConstructorCardHeader";
import { ConstructorGroupParamsBar } from "../primitives/ConstructorGroupParamsBar";
import { GroupedExerciseRow } from "../primitives/GroupedExerciseRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import {
    CONSTRUCTOR_CARD_CLASS,
    CONSTRUCTOR_COLUMN_HEADER_CLASS,
    CONSTRUCTOR_FIELD_LABEL_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../primitives/constructorCardStyles";

const SLOT_LABELS = ["A1", "A2"] as const;

const EXERCISE_GRID_CLASS =
    "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_132px_148px_64px] gap-2.5 items-center";

const COLUMN_HEADER_GRID_CLASS =
    "sm:grid-cols-[40px_minmax(0,1fr)_132px_148px_64px]";

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
}

export const SupersetBlock: React.FC<SupersetBlockProps> = ({
    row,
    blockTypes,
    groupLabel,
    onUpdate,
    onAddExercise,
    onUpdateExercise,
}) => {
    const normalized = normalizeSupersetRow(row);
    const repsTipo = normalized.repsTipo ?? "reps";

    return (
        <div className={CONSTRUCTOR_CARD_CLASS}>
            <ConstructorCardHeader
                blockTypeId={normalized.blockTypeId}
                blockTypes={blockTypes}
                setType={normalized.setType}
                onSetTypeChange={(setType) => onUpdate(normalized.id, { setType })}
            />

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
                    <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>Descanso por ronda</span>
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
                <span className="text-center">Reps / Tiempo</span>
                <span className="text-center">Carácter</span>
                <span className="text-center">Descanso</span>
            </div>

            <div className="space-y-2 px-4 pb-3 pt-1">
                {normalized.exercises.map((ex, index) => (
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
                                repsTipo={repsTipo}
                                exercise={ex}
                                showModeSelector={index === 0}
                                onRepsTipoChange={(mode) =>
                                    onUpdate(normalized.id, { repsTipo: mode })
                                }
                                onExerciseChange={(updates) =>
                                    onUpdateExercise(normalized.id, ex.id, updates)
                                }
                            />
                            <CaracterField
                                exercise={ex}
                                onExerciseChange={(updates) =>
                                    onUpdateExercise(normalized.id, ex.id, updates)
                                }
                            />
                            <span className="text-center text-[11px] text-muted-foreground/70">
                                —
                            </span>
                        </div>
                    </GroupedExerciseRow>
                ))}
            </div>

            <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>
                El Superset siempre contiene 2 ejercicios. Para más, usa Giant Set.
            </p>
        </div>
    );
};
