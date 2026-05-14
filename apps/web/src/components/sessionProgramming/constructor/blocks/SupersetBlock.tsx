/**
 * SupersetBlock.tsx — Constructor card para tipo superset (2 ejercicios A1/A2).
 * Contexto: registro S1′; persistencia vía ConstructorRow con 2 slots fijos.
 * Notas de mantenimiento: sin invertir A1/A2; descanso intra-par mostrado como «—».
 * @spec docs/tipo-serie/07_superset-lovable-spec.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { FormSelect } from "@/components/ui/forms";
import { cn } from "@/lib/utils";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { SetType, TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE_LABELS } from "@nexia/shared/types/sessionProgramming";
import { getTrainingBlockDisplayName } from "../utils/trainingBlockDisplay";
import { normalizeSupersetRow } from "../utils/supersetRow";
import { SupersetGroupHeader } from "../primitives/SupersetGroupHeader";
import { GroupedExerciseRow } from "../primitives/GroupedExerciseRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";

const SET_TYPE_OPTIONS = Object.entries(SET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const SLOT_LABELS = ["A1", "A2"] as const;

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

    const blockSelectOptions = blockTypes.map((bt) => ({
        value: String(bt.id),
        label: getTrainingBlockDisplayName(bt.name),
    }));

    const handleSetTypeChange = (setType: SetType) => {
        onUpdate(normalized.id, { setType });
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
            </div>

            <SupersetGroupHeader
                groupLabel={groupLabel}
                sets={normalized.sets}
                restSeconds={normalized.rest}
                onSetsChange={(sets) => onUpdate(normalized.id, { sets })}
                onRestChange={(rest) => onUpdate(normalized.id, { rest })}
            />

            <div className="px-4 py-3 space-y-3">
                <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_140px_160px_72px] gap-3 px-[52px] text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span>Ejercicio</span>
                    <span className="text-center">Reps / Tiempo</span>
                    <span className="text-center">Carácter</span>
                    <span className="text-center">Descanso</span>
                </div>

                {normalized.exercises.map((ex, index) => (
                    <GroupedExerciseRow
                        key={ex.id}
                        slotLabel={SLOT_LABELS[index] ?? `A${index + 1}`}
                        isLast={index === normalized.exercises.length - 1}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_140px_160px_72px] gap-3 items-center">
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
                            <span className="text-center text-[10px] text-muted-foreground">—</span>
                        </div>
                    </GroupedExerciseRow>
                ))}
            </div>

            <p className="border-t border-border/60 px-4 py-2.5 text-[10px] italic text-muted-foreground">
                El Superset siempre contiene 2 ejercicios. Para más, usa Giant Set.
            </p>
        </div>
    );
};
