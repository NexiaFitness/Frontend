/**
 * SessionConstructorRow.tsx — Fila del Constructor de Sesión
 *
 * Render condicional por tipo de serie (for_time, emom, amrap, single_set, etc.).
 * Columnas: BLOQUE | TIPO SERIE | SERIES | EJERCICIOS | REPS/TIEMPO | CARÁCTER | DESCANSO | [papelera]
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 4
 */

import React from "react";
import { Input, FormSelect } from "@/components/ui/forms";
import { Button } from "@/components/ui/buttons";
import type { ConstructorRow, ConstructorExercise } from "./constructorTypes";
import type {
    TrainingBlockType,
    SetType,
    EffortCharacter,
} from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE_LABELS, EFFORT_CHARACTER } from "@nexia/shared/types/sessionProgramming";

const BLOCK_TYPE_TRANSLATIONS: Record<string, string> = {
    "Warm Up": "Calentamiento",
    Core: "Core",
    Conditioning: "Acondicionamiento",
    "Maximum Strength": "Fuerza Máxima",
    "Strength-Speed": "Fuerza-Velocidad",
    "Hypertrophy Strength": "Hipertrofia",
    Plyometrics: "Pliometría",
    "Intensive Aerobic": "Aeróbico Intensivo",
    "Extensive Aerobic": "Aeróbico Extensivo",
};

function getBlockDisplayName(name: string): string {
    return BLOCK_TYPE_TRANSLATIONS[name] ?? name;
}

const SET_TYPE_OPTIONS = Object.entries(SET_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const EFFORT_OPTIONS = [
    { value: "", label: "—" },
    { value: EFFORT_CHARACTER.RPE, label: "RPE" },
    { value: EFFORT_CHARACTER.RIR, label: "RIR" },
    { value: EFFORT_CHARACTER.VELOCITY_LOSS, label: "Vel. Loss" },
];

export interface SessionConstructorRowProps {
    row: ConstructorRow;
    blockTypes: TrainingBlockType[];
    onUpdate: (rowId: string, updates: Partial<ConstructorRow>) => void;
    onRemove: (rowId: string) => void;
    onAddExercise: (rowId: string) => void;
    onRemoveExercise: (rowId: string, exerciseId: string) => void;
    onUpdateExercise: (
        rowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => void;
}

export const SessionConstructorRow: React.FC<SessionConstructorRowProps> = ({
    row,
    blockTypes,
    onUpdate,
    onRemove,
    onAddExercise,
    onRemoveExercise,
    onUpdateExercise,
}) => {

    const showSetsInput =
        row.setType === "single_set" ||
        row.setType === "superset" ||
        row.setType === "giant_set";
    const showRoundsInSeriesCol = row.setType === "circuit";

    const blockOptions = [
        { value: "", label: "Seleccionar" },
        ...blockTypes.map((bt) => ({
            value: bt.id.toString(),
            label: getBlockDisplayName(bt.name),
        })),
    ];

    return (
        <tr className="border-b border-border hover:bg-muted/30">
            {/* BLOQUE */}
            <td className="py-2 px-2 align-top">
                <FormSelect
                    value={row.blockTypeId ? row.blockTypeId.toString() : "0"}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        onUpdate(row.id, { blockTypeId: v || 0 });
                    }}
                    options={blockOptions}
                />
            </td>

            {/* TIPO SERIE */}
            <td className="py-2 px-2 align-top min-w-[160px]">
                <FormSelect
                    value={row.setType}
                    onChange={(e) => onUpdate(row.id, { setType: e.target.value as SetType })}
                    options={SET_TYPE_OPTIONS}
                />
                {row.setType === "for_time" && (
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Rondas</span>
                            <Input
                                type="number"
                                value={row.rounds ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        rounds: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                min={1}
                                className="w-14 h-8"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Time cap (s)</span>
                            <Input
                                type="number"
                                value={row.timeCap ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        timeCap: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-14 h-8"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Objetivo: menor tiempo</p>
                    </div>
                )}
                {row.setType === "emom" && (
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Cada (s)</span>
                            <Input
                                type="number"
                                value={row.intervalSeconds ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        intervalSeconds: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                placeholder="60"
                                className="w-14 h-8"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Rondas</span>
                            <Input
                                type="number"
                                value={row.rounds ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        rounds: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-14 h-8"
                            />
                        </div>
                    </div>
                )}
                {row.setType === "amrap" && (
                    <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Time cap (s)</span>
                            <Input
                                type="number"
                                value={row.timeCap ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        timeCap: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-14 h-8"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Rondas</span>
                            <Input
                                type="number"
                                value={row.rounds ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        rounds: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-14 h-8"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Objetivo: máximo rendimiento</p>
                    </div>
                )}
            </td>

            {/* SERIES */}
            <td className="py-2 px-2 align-top w-20">
                {showSetsInput ? (
                    <Input
                        type="number"
                        value={row.sets ?? ""}
                        onChange={(e) =>
                            onUpdate(row.id, {
                                sets: e.target.value ? Number(e.target.value) : null,
                            })
                        }
                        min={1}
                        className="w-16"
                    />
                ) : showRoundsInSeriesCol ? (
                    <Input
                        type="number"
                        value={row.rounds ?? ""}
                        onChange={(e) =>
                            onUpdate(row.id, {
                                rounds: e.target.value ? Number(e.target.value) : null,
                            })
                        }
                        min={1}
                        className="w-16"
                    />
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </td>

            {/* EJERCICIOS */}
            <td className="py-2 px-2 align-top min-w-[180px]">
                <div className="space-y-1">
                    {row.exercises.map((ex) => (
                        <div
                            key={ex.id}
                            className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1"
                        >
                            <span className="flex-1 truncate">{ex.exerciseName}</span>
                            <button
                                type="button"
                                onClick={() => onRemoveExercise(row.id, ex.id)}
                                className="text-destructive hover:text-destructive/80 text-xs"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddExercise(row.id)}
                        className="text-xs h-7"
                    >
                        + Ejercicio
                    </Button>
                </div>
            </td>

            {/* REPS / TIEMPO */}
            <td className="py-2 px-2 align-top min-w-[100px]">
                <div className="space-y-1">
                    {row.exercises.map((ex) => (
                        <Input
                            key={ex.id}
                            type="text"
                            value={ex.plannedReps ?? ""}
                            onChange={(e) =>
                                onUpdateExercise(row.id, ex.id, {
                                    plannedReps: e.target.value || null,
                                })
                            }
                            placeholder="Reps"
                            className="w-full text-sm h-8"
                        />
                    ))}
                </div>
            </td>

            {/* CARÁCTER */}
            <td className="py-2 px-2 align-top w-24">
                <div className="space-y-1">
                    {row.exercises.map((ex) => (
                        <div key={ex.id} className="flex gap-1">
                            <FormSelect
                                value={ex.effortCharacter ?? ""}
                                onChange={(e) =>
                                    onUpdateExercise(row.id, ex.id, {
                                        effortCharacter: (e.target.value ||
                                            null) as EffortCharacter | null,
                                    })
                                }
                                options={EFFORT_OPTIONS}
                                className="flex-1"
                            />
                            {(ex.effortCharacter === EFFORT_CHARACTER.RPE ||
                                ex.effortCharacter === EFFORT_CHARACTER.RIR ||
                                ex.effortCharacter === EFFORT_CHARACTER.VELOCITY_LOSS) && (
                                <Input
                                    type="number"
                                    value={ex.effortValue ?? ""}
                                    onChange={(e) =>
                                        onUpdateExercise(row.id, ex.id, {
                                            effortValue: e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        })
                                    }
                                    className="w-12 h-8"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </td>

            {/* DESCANSO */}
            <td className="py-2 px-2 align-top w-20">
                <Input
                    type="number"
                    value={row.rest ?? ""}
                    onChange={(e) =>
                        onUpdate(row.id, {
                            rest: e.target.value ? Number(e.target.value) : null,
                        })
                    }
                    placeholder="s"
                    className="w-16 h-8"
                />
            </td>

            {/* Papelera */}
            <td className="py-2 px-2 align-top w-10">
                <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    className="text-destructive hover:text-destructive/80 p-1"
                    title="Eliminar fila"
                >
                    🗑
                </button>
            </td>
        </tr>
    );
};
