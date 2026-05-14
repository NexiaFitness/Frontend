/**
 * AmrapBlock.tsx — Constructor card amrap (secuencia numerada = 1 ronda, time cap).
 * @spec docs/tipo-serie/02_comportamiento-y-render-por-tipo.md
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Plus, Timer } from "lucide-react";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";
import type { ConstructorExercise, ConstructorRow } from "../../constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import {
    addAmrapExerciseSlot,
    MIN_AMRAP_SLOTS,
    normalizeAmrapRow,
} from "../utils/amrapRow";
import { ConstructorCardHeader } from "../primitives/ConstructorCardHeader";
import { ConstructorGroupParamsBar } from "../primitives/ConstructorGroupParamsBar";
import { GroupedExerciseRow } from "../primitives/GroupedExerciseRow";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import {
    CONSTRUCTOR_AMRAP_CARD_CLASS,
    CONSTRUCTOR_COLUMN_HEADER_CLASS,
    CONSTRUCTOR_FIELD_LABEL_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../primitives/constructorCardStyles";

const EXERCISE_GRID_CLASS =
    "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_102px_102px] gap-2 items-center sm:justify-items-stretch [&>*:nth-child(2)]:sm:justify-self-center [&>*:nth-child(3)]:sm:justify-self-center";

const COLUMN_HEADER_GRID_CLASS =
    "sm:grid-cols-[40px_minmax(0,1fr)_102px_102px] [&>span:nth-child(3)]:justify-self-center [&>span:nth-child(4)]:justify-self-center";

function slotLabel(index: number): string {
    return String(index + 1);
}

export interface AmrapBlockProps {
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

export const AmrapBlock: React.FC<AmrapBlockProps> = ({
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
    const normalized = normalizeAmrapRow(row);
    const exerciseCount = normalized.exercises.length;
    const canRemoveLast = exerciseCount > MIN_AMRAP_SLOTS;
    const durationMinutes =
        normalized.timeCap != null ? Math.floor(normalized.timeCap / 60) : "";

    const handleAddSlot = () => {
        const next = addAmrapExerciseSlot(normalized);
        onUpdate(normalized.id, { exercises: next.exercises });
    };

    const handleRemoveLastSlot = () => {
        if (!canRemoveLast) return;
        onUpdate(normalized.id, {
            exercises: normalized.exercises.slice(0, -1),
        });
    };

    return (
        <div className={CONSTRUCTOR_AMRAP_CARD_CLASS}>
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
                    <ConstructorGroupParamsBar badgeLabel={groupLabel} variant="amrap">
                        <div className="flex items-center gap-2">
                            <Timer
                                className="h-3.5 w-3.5 text-red-600/70 dark:text-red-400/70 shrink-0"
                                aria-hidden
                            />
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>
                                Duración total
                            </span>
                            <InlineNumberInput
                                size="xs"
                                min={1}
                                value={durationMinutes}
                                onChange={(e) =>
                                    onUpdate(normalized.id, {
                                        timeCap: e.target.value
                                            ? Number(e.target.value) * 60
                                            : null,
                                    })
                                }
                                className="w-12"
                            />
                            <span className="text-[10px] text-muted-foreground">min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>
                                Rondas objetivo
                            </span>
                            <InlineNumberInput
                                size="xs"
                                min={1}
                                value={normalized.rounds ?? ""}
                                onChange={(e) =>
                                    onUpdate(normalized.id, {
                                        rounds: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                className="w-12"
                            />
                            <span className="text-[10px] italic text-muted-foreground">
                                opcional
                            </span>
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
                        {normalized.exercises.map((ex, index) => (
                            <GroupedExerciseRow
                                key={ex.id}
                                slotLabel={slotLabel(index)}
                                variant="amrap"
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
                                        exercise={ex}
                                        rowRepsTipo={normalized.repsTipo}
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
                                </div>
                            </GroupedExerciseRow>
                        ))}

                        <div className="grid grid-cols-[40px_1fr] gap-3 pt-1">
                            <span />
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddSlot}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-red-500/40 px-3 text-[11px] font-medium text-red-700 transition-colors hover:border-red-500/60 hover:bg-red-500/[0.06] dark:text-red-400"
                                >
                                    <Plus className="h-3.5 w-3.5 shrink-0" />
                                    Añadir ejercicio ({exerciseCount})
                                </button>
                                {canRemoveLast ? (
                                    <button
                                        type="button"
                                        onClick={handleRemoveLastSlot}
                                        className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                                    >
                                        Quitar último
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>
                        Completa los {exerciseCount} ejercicios en orden = 1 ronda. Máximo de
                        rondas posibles.
                    </p>
                </>
            ) : null}
        </div>
    );
};
