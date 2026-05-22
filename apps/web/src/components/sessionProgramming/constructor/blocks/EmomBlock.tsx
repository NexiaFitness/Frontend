/**
 * EmomBlock.tsx — Constructor card emom (ventanas V1…Vn, 1+ ejercicios por ventana).
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
    addEmomWindow,
    addEmomWindowExercise,
    computeEmomTotalMinutes,
    emomWindowLabel,
    MIN_EMOM_WINDOWS,
    normalizeEmomRow,
    removeEmomWindow,
    removeEmomWindowLastExercise,
} from "../utils/emomRow";
import { ConstructorCardHeader } from "../primitives/ConstructorCardHeader";
import { ConstructorGroupParamsBar } from "../primitives/ConstructorGroupParamsBar";
import { ExercisePickerField } from "../primitives/ExercisePickerField";
import { RepsTiempoField } from "../primitives/RepsTiempoField";
import { CaracterField } from "../primitives/CaracterField";
import {
    applyEmomWindowCaracterInheritance,
    hasCaracterChange,
} from "../utils/exerciseCaracterInheritance";
import {
    CONSTRUCTOR_COLUMN_HEADER_CLASS,
    CONSTRUCTOR_EMOM_CARD_CLASS,
    CONSTRUCTOR_EMOM_WINDOW_LABEL_CLASS,
    CONSTRUCTOR_FIELD_LABEL_CLASS,
    CONSTRUCTOR_FOOTER_HINT_CLASS,
} from "../primitives/constructorCardStyles";

const EXERCISE_GRID_CLASS =
    "grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_102px_102px] gap-2 items-center sm:justify-items-stretch [&>*:nth-child(2)]:sm:justify-self-center [&>*:nth-child(3)]:sm:justify-self-center";

const COLUMN_HEADER_GRID_CLASS =
    "sm:grid-cols-[44px_minmax(0,1fr)_102px_102px] [&>span:nth-child(3)]:justify-self-center [&>span:nth-child(4)]:justify-self-center";

export interface EmomBlockProps {
    row: ConstructorRow;
    blockTypes: TrainingBlockType[];
    groupLabel: string;
    onUpdate: (rowId: string, updates: Partial<ConstructorRow>) => void;
    onAddExercise: (rowId: string, exerciseSlotId?: string) => void;
    onDuplicate?: (rowId: string) => void;
    onRemove?: (rowId: string) => void;
}

export const EmomBlock: React.FC<EmomBlockProps> = ({
    row,
    blockTypes,
    groupLabel,
    onUpdate,
    onAddExercise,
    onDuplicate,
    onRemove,
}) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const normalized = normalizeEmomRow(row);
    const windows = normalized.emomWindows ?? [];
    const windowCount = windows.length;
    const rounds = normalized.rounds ?? 3;
    const intervalMinutes = Math.max(
        1,
        Math.floor((normalized.intervalSeconds ?? 60) / 60)
    );
    const totalMinutes = computeEmomTotalMinutes(normalized);
    const canRemoveWindow = windowCount > MIN_EMOM_WINDOWS;

    const handleExerciseChange = (
        windowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => {
        if (hasCaracterChange(updates)) {
            const nextWindows = applyEmomWindowCaracterInheritance(
                windows,
                windowId,
                exerciseId,
                updates
            );
            onUpdate(normalized.id, { emomWindows: nextWindows });
        } else {
            const nextWindows = windows.map((window) =>
                window.id !== windowId
                    ? window
                    : {
                          ...window,
                          exercises: window.exercises.map((ex) =>
                              ex.id === exerciseId ? { ...ex, ...updates } : ex
                          ),
                      }
            );
            onUpdate(normalized.id, { emomWindows: nextWindows });
        }
    };

    return (
        <div className={CONSTRUCTOR_EMOM_CARD_CLASS}>
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
                    <ConstructorGroupParamsBar
                        badgeLabel={`${groupLabel} · ${totalMinutes}'`}
                        variant="emom"
                        metaLabel={`${windowCount} ventana${windowCount === 1 ? "" : "s"} · ${rounds} ronda${rounds === 1 ? "" : "s"}`}
                    >
                        <div className="flex items-center gap-2">
                            <Timer
                                className="h-3.5 w-3.5 text-purple-600/70 dark:text-purple-400/70 shrink-0"
                                aria-hidden
                            />
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>
                                Duración ventana
                            </span>
                            <InlineNumberInput
                                size="xs"
                                min={1}
                                max={3}
                                step={1}
                                value={intervalMinutes}
                                onChange={(e) =>
                                    onUpdate(normalized.id, {
                                        intervalSeconds: Number(e.target.value) * 60,
                                    })
                                }
                                className="w-12"
                            />
                            <span className="text-[10px] text-muted-foreground">min</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>Rondas</span>
                            <InlineNumberInput
                                size="xs"
                                min={1}
                                value={rounds}
                                onChange={(e) =>
                                    onUpdate(normalized.id, {
                                        rounds: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-12"
                            />
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

                    <div className="space-y-4 px-4 pb-3 pt-1">
                        {windows.map((window, windowIndex) => {
                            const exerciseCount = window.exercises.length;
                            const canRemoveExercise = exerciseCount > 1;
                            return (
                                <div
                                    key={window.id}
                                    className={
                                        windowIndex > 0
                                            ? "space-y-2 border-t border-border/40 pt-3"
                                            : "space-y-2"
                                    }
                                >
                                        {window.exercises.map((ex, exerciseIndex) => (
                                            <div
                                                key={ex.id}
                                                className="grid grid-cols-1 sm:grid-cols-[44px_1fr] gap-3 items-start"
                                            >
                                                {exerciseIndex === 0 ? (
                                                    <span
                                                        className={
                                                            CONSTRUCTOR_EMOM_WINDOW_LABEL_CLASS
                                                        }
                                                    >
                                                        {emomWindowLabel(windowIndex)}
                                                    </span>
                                                ) : (
                                                    <span aria-hidden />
                                                )}
                                                <div className={EXERCISE_GRID_CLASS}>
                                                    <ExercisePickerField
                                                        exerciseName={ex.exerciseName}
                                                        onPick={() =>
                                                            onAddExercise(
                                                                normalized.id,
                                                                ex.id
                                                            )
                                                        }
                                                        onClear={() =>
                                                            handleExerciseChange(
                                                                window.id,
                                                                ex.id,
                                                                {
                                                                    exerciseId: 0,
                                                                    exerciseName: "",
                                                                }
                                                            )
                                                        }
                                                    />
                                                    <RepsTiempoField
                                                        exercise={ex}
                                                        rowRepsTipo={normalized.repsTipo}
                                                        onRowRepsTipoChange={(mode) =>
                                                            onUpdate(normalized.id, {
                                                                repsTipo: mode,
                                                            })
                                                        }
                                                        onExerciseChange={(updates) =>
                                                            handleExerciseChange(
                                                                window.id,
                                                                ex.id,
                                                                updates
                                                            )
                                                        }
                                                    />
                                                    <CaracterField
                                                        exercise={ex}
                                                        onExerciseChange={(updates) =>
                                                            handleExerciseChange(
                                                                window.id,
                                                                ex.id,
                                                                updates
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                    <div className="flex flex-wrap items-center gap-2 pl-[calc(44px+0.75rem)] sm:pl-[calc(44px+0.75rem)]">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onUpdate(normalized.id, {
                                                    emomWindows: addEmomWindowExercise(
                                                        normalized,
                                                        window.id
                                                    ).emomWindows,
                                                })
                                            }
                                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-purple-500/40 px-3 text-[11px] font-medium text-purple-700 transition-colors hover:border-purple-500/60 hover:bg-purple-500/[0.06] dark:text-purple-400"
                                        >
                                            <Plus className="h-3.5 w-3.5 shrink-0" />
                                            Añadir ejercicio
                                        </button>
                                        {canRemoveExercise ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onUpdate(normalized.id, {
                                                        emomWindows:
                                                            removeEmomWindowLastExercise(
                                                                normalized,
                                                                window.id
                                                            ).emomWindows,
                                                    })
                                                }
                                                className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                                            >
                                                Quitar último
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdate(normalized.id, {
                                        emomWindows: addEmomWindow(normalized).emomWindows,
                                    })
                                }
                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-dashed border-purple-500/40 px-3 text-[11px] font-medium text-purple-700 transition-colors hover:border-purple-500/60 hover:bg-purple-500/[0.06] dark:text-purple-400"
                            >
                                <Plus className="h-3.5 w-3.5 shrink-0" />
                                Añadir ventana
                            </button>
                            {canRemoveWindow ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onUpdate(normalized.id, {
                                            emomWindows: removeEmomWindow(normalized)
                                                .emomWindows,
                                        })
                                    }
                                    className="text-[11px] text-muted-foreground transition-colors hover:text-destructive"
                                >
                                    Quitar última ventana
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <p className={CONSTRUCTOR_FOOTER_HINT_CLASS}>
                        Completa los ejercicios de cada ventana dentro del tiempo establecido y
                        descansa el tiempo restante. Repite el patrón durante las rondas
                        indicadas.
                    </p>
                </>
            ) : null}
        </div>
    );
};
