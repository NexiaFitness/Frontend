/**
 * SessionConstructorRow.tsx — Fila del Constructor de Sesión
 *
 * Grid: 170px 110px 70px 1fr 140px 160px 100px (sin papelera por fila).
 * Bloque: chip con nombre + X visible en group-hover. Click abre selector.
 * Eliminar bloque: solo en pie (Eliminar bloque).
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 4
 */

import React, { useRef } from "react";
import { Plus, X, Timer } from "lucide-react";
import { Input, FormSelect, FormCombobox } from "@/components/ui/forms";
import type { ConstructorRow, ConstructorExercise, RepsTipo } from "./constructorTypes";
import {
    getCaracterTipoFromEffortCharacter,
    getEffortCharacterForCaracterTipo,
    type CaracterTipo,
} from "@nexia/shared/utils/sessionProgramming";
import type { TrainingBlockType, SetType } from "@nexia/shared/types/sessionProgramming";
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

const REPS_TIPO_OPTIONS: { value: RepsTipo; label: string }[] = [
    { value: "reps", label: "Reps" },
    { value: "tiempo", label: "Tiempo" },
];

const CARACTER_TIPO_OPTIONS: { value: CaracterTipo; label: string }[] = [
    { value: "rpe", label: "RPE" },
    { value: "rir", label: "RIR" },
    { value: "pct_rm", label: "%RM" },
];

/** Altura unificada para todos los inputs del constructor (alineación consistente, ! para evitar override) */
const INPUT_H = "!h-8";

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

    const activeBlock = blockTypes.find((bt) => bt.id === row.blockTypeId);
    const blockDisplayName = activeBlock ? getBlockDisplayName(activeBlock.name) : "Seleccionar";
    const blockSelectRef = useRef<HTMLSelectElement>(null);

    return (
        <div
            className="grid grid-cols-[170px_110px_70px_minmax(140px,1fr)_140px_160px_100px] gap-2 px-4 py-2 items-start hover:bg-surface/30 transition-colors group border-b border-border"
            role="row"
        >
            {/* BLOQUE — chip compacto h-8, misma altura que resto de inputs */}
            <div className="relative flex min-w-0 items-center">
                <div className={`inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary min-w-0 shrink-0 ${INPUT_H}`}>
                    <span className="truncate">{blockDisplayName}</span>
                    <button
                        type="button"
                        onClick={() => blockSelectRef.current?.click()}
                        className="h-6 w-6 shrink-0 rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent hover:text-accent-foreground text-muted-foreground hover:text-destructive flex items-center justify-center"
                        aria-label="Cambiar bloque"
                    >
                        <X className="h-3 w-3" aria-hidden />
                    </button>
                </div>
                <select
                    ref={blockSelectRef}
                    value={row.blockTypeId ? row.blockTypeId.toString() : ""}
                    onChange={(e) => {
                        const v = Number(e.target.value);
                        onUpdate(row.id, { blockTypeId: v || 0 });
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    aria-label="Cambiar bloque"
                >
                    {blockOptions.map((opt) => (
                        <option key={opt.value} value={opt.value || "0"}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* TIPO SERIE — h-8 forzado, alineado con Series */}
            <div className="min-w-0 h-8 flex items-center [&_select]:!h-8 [&_select]:!min-h-8">
                <FormSelect
                    size="xs"
                    value={row.setType}
                    onChange={(e) => onUpdate(row.id, { setType: e.target.value as SetType })}
                    options={SET_TYPE_OPTIONS}
                    className="!h-8 !min-h-8 shrink-0"
                />
            </div>

            {/* SERIES — h-8 forzado, alineado con Tipo Serie */}
            <div className="h-8 flex items-center [&_input]:!h-8 [&_input]:!min-h-8">
                {showSetsInput ? (
                    <Input
                        size="xs"
                        type="number"
                        value={row.sets ?? ""}
                        onChange={(e) =>
                            onUpdate(row.id, {
                                sets: e.target.value ? Number(e.target.value) : null,
                            })
                        }
                        min={1}
                        className="w-14 h-8 text-center text-xs"
                    />
                ) : showRoundsInSeriesCol ? (
                    <Input
                        size="xs"
                        type="number"
                        value={row.rounds ?? ""}
                        onChange={(e) =>
                            onUpdate(row.id, {
                                rounds: e.target.value ? Number(e.target.value) : null,
                            })
                        }
                        min={1}
                        className="w-14 text-center"
                    />
                ) : (
                    <span className="text-[10px] text-muted-foreground pt-2 block text-center">—</span>
                )}
            </div>

            {/* EJERCICIOS */}
            <div className="min-w-0">
                <div className="space-y-1">
                    {row.exercises.map((ex) => (
                        <div
                            key={ex.id}
                            className={`flex items-center gap-2 rounded-md bg-surface border border-border/60 px-2 py-1 text-xs ${INPUT_H}`}
                        >
                            <span className="flex-1 truncate">{ex.exerciseName}</span>
                            <button
                                type="button"
                                onClick={() => onRemoveExercise(row.id, ex.id)}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                                aria-label="Quitar ejercicio"
                            >
                                <X className="h-3 w-3" aria-hidden />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => onAddExercise(row.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors"
                    >
                        <Plus className="h-3 w-3" aria-hidden />
                        Ejercicio
                    </button>
                </div>
            </div>

            {/* REPS / TIEMPO — h-8 alineado con ejercicios */}
            <div className="min-w-[108px] flex flex-col gap-1 items-stretch">
                {row.exercises.map((ex, idx) => {
                    const repsTipo = row.repsTipo ?? "reps";
                    const showCombobox = idx === 0;
                    const inputCls = `flex ${INPUT_H} w-[50px] shrink-0 rounded-md border border-border/60 bg-surface px-2 py-1.5 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0`;
                    return (
                        <div key={ex.id} className="flex items-center gap-1 min-h-8">
                            {showCombobox ? (
                                <FormCombobox
                                    size="sm"
                                    value={repsTipo}
                                    onChange={(v) => onUpdate(row.id, { repsTipo: v as RepsTipo })}
                                    options={REPS_TIPO_OPTIONS}
                                    placeholder="Reps"
                                    aria-label="Modo Reps/Tiempo"
                                />
                            ) : (
                                <span
                                    className={`flex ${INPUT_H} w-[58px] shrink-0 items-center justify-center rounded-md border border-border/60 bg-surface px-2 py-1.5 text-[10px] text-muted-foreground`}
                                    aria-hidden
                                >
                                    {repsTipo === "tiempo" ? "Tiempo" : "Reps"}
                                </span>
                            )}
                            {repsTipo === "reps" ? (
                                <input
                                    type="text"
                                    value={ex.plannedReps ?? ""}
                                    onChange={(e) =>
                                        onUpdateExercise(row.id, ex.id, {
                                            plannedReps: e.target.value || null,
                                        })
                                    }
                                    placeholder="—"
                                    className={inputCls}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={
                                        ex.plannedDuration != null
                                            ? ex.plannedDuration >= 60
                                                ? `${Math.floor(ex.plannedDuration / 60)}:${(ex.plannedDuration % 60).toString().padStart(2, "0")}`
                                                : String(ex.plannedDuration)
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value.trim();
                                        if (!v) {
                                            onUpdateExercise(row.id, ex.id, {
                                                plannedDuration: null,
                                            });
                                            return;
                                        }
                                        if (v.includes(":")) {
                                            const [m, s] = v.split(":").map(Number);
                                            const total =
                                                !isNaN(m) && !isNaN(s) ? m * 60 + s : null;
                                            onUpdateExercise(row.id, ex.id, {
                                                plannedDuration: total,
                                            });
                                        } else {
                                            const parsed = parseInt(v, 10);
                                            onUpdateExercise(row.id, ex.id, {
                                                plannedDuration:
                                                    !isNaN(parsed) ? parsed : null,
                                            });
                                        }
                                    }}
                                    placeholder="—"
                                    className={inputCls}
                                />
                            )}
                        </div>
                    );
                })}
                {row.exercises.length === 0 && (
                    <div className="flex items-center gap-1 min-h-8">
                        <div className={`${INPUT_H} w-[58px] shrink-0 rounded-md border border-border/60 bg-surface`} />
                        <div className={`${INPUT_H} w-[50px] shrink-0 rounded-md border border-border/60 bg-surface`} />
                    </div>
                )}
            </div>

            {/* CARÁCTER — Par combobox 62×32 + input 50×32: RPE (1-10), RIR (0-5), %RM (1-100) */}
            <div className="min-w-[120px] flex flex-col gap-1 items-stretch">
                {row.exercises.map((ex) => {
                    const caracterTipo = getCaracterTipoFromEffortCharacter(ex.effortCharacter);
                    const inputClassName = `flex ${INPUT_H} w-[50px] shrink-0 rounded-md border border-border/60 bg-surface px-2 py-1.5 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0`;
                    return (
                        <div key={ex.id} className="flex items-center gap-1">
                            <FormCombobox
                                size="sm"
                                value={caracterTipo}
                                onChange={(v) => {
                                    const val = v as CaracterTipo;
                                    if (val === "rpe") {
                                        onUpdateExercise(row.id, ex.id, {
                                            effortCharacter: EFFORT_CHARACTER.RPE,
                                            effortValue: ex.effortValue,
                                            notes: null,
                                        });
                                    } else if (val === "rir") {
                                        onUpdateExercise(row.id, ex.id, {
                                            effortCharacter: EFFORT_CHARACTER.RIR,
                                            effortValue: ex.effortValue,
                                            notes: null,
                                        });
                                    } else {
                                        onUpdateExercise(row.id, ex.id, {
                                            effortCharacter: EFFORT_CHARACTER.PCT_RM,
                                            effortValue: ex.effortValue,
                                            notes: null,
                                        });
                                    }
                                }}
                                options={CARACTER_TIPO_OPTIONS}
                                placeholder="RPE"
                                aria-label="Carácter"
                            />
                            {caracterTipo === "rpe" ? (
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={ex.effortValue ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onUpdateExercise(row.id, ex.id, {
                                            effortCharacter:
                                                ex.effortCharacter ?? getEffortCharacterForCaracterTipo("rpe"),
                                            effortValue: val ? Number(val) : null,
                                        });
                                    }}
                                    placeholder="1-10"
                                    className={inputClassName}
                                />
                            ) : caracterTipo === "rir" ? (
                                <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    value={ex.effortValue ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onUpdateExercise(row.id, ex.id, {
                                            effortCharacter:
                                                ex.effortCharacter ?? getEffortCharacterForCaracterTipo("rir"),
                                            effortValue: val ? Number(val) : null,
                                        });
                                    }}
                                    placeholder="0-5"
                                    className={inputClassName}
                                />
                            ) : (
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={ex.effortValue ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onUpdateExercise(row.id, ex.id, {
                                            effortCharacter:
                                                ex.effortCharacter ?? getEffortCharacterForCaracterTipo("pct_rm"),
                                            effortValue: val ? Number(val) : null,
                                        });
                                    }}
                                    placeholder="0-100"
                                    className={inputClassName}
                                />
                            )}
                        </div>
                    );
                })}
                {row.exercises.length === 0 && (
                    <div className="flex items-center gap-1 min-h-8">
                        <div className={`${INPUT_H} w-[62px] shrink-0 rounded-md border border-border/60 bg-surface`} />
                        <div className={`${INPUT_H} w-[50px] shrink-0 rounded-md border border-border/60 bg-surface`} />
                    </div>
                )}
            </div>

            {/* DESCANSO — input + "seg" en cada línea, h-8 alineado */}
            <div className="min-w-[100px] flex flex-col gap-1 items-stretch">
                {row.exercises.length > 0 ? (
                    row.exercises.map((ex) => (
                        <div key={ex.id} className="flex items-center gap-0.5 min-h-8">
                            <input
                                type="number"
                                value={row.rest ?? ""}
                                onChange={(e) =>
                                    onUpdate(row.id, {
                                        rest: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="60"
                                className={`${INPUT_H} w-14 shrink-0 rounded-md border border-border/60 bg-surface px-2 py-1.5 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0`}
                            />
                            <span className="text-[10px] text-muted-foreground shrink-0">seg</span>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center gap-0.5 min-h-8">
                        <input
                            type="number"
                            value={row.rest ?? ""}
                            onChange={(e) =>
                                onUpdate(row.id, {
                                    rest: e.target.value ? Number(e.target.value) : null,
                                })
                            }
                            placeholder="60"
                            className={`${INPUT_H} w-14 shrink-0 rounded-md border border-border/60 bg-surface px-2 py-1.5 text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0`}
                        />
                        <span className="text-[10px] text-muted-foreground shrink-0">seg</span>
                    </div>
                )}
            </div>

            {/* Barra config — ancho completo, alineada a la izquierda (debajo de Bloque) */}
            {(row.setType === "amrap" ||
                row.setType === "for_time" ||
                row.setType === "emom" ||
                row.setType === "circuit") && (
                <div className="col-span-full flex flex-wrap items-center gap-3 py-2 bg-accent/30 border-t border-border/40 mt-2">
                    {row.setType === "amrap" && (
                        <>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold border-primary/40 text-primary">
                                AMRAP
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Timer className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden />
                                <span className="text-[11px] text-muted-foreground">Time Cap:</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={
                                        row.timeCap != null
                                            ? Math.floor(row.timeCap / 60)
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        onUpdate(row.id, {
                                            timeCap: v ? Number(v) * 60 : null,
                                        });
                                    }}
                                    placeholder="12"
                                    className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                />
                                <span className="text-[10px] text-muted-foreground">min</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground italic">
                                Objetivo: máx. rondas
                            </span>
                        </>
                    )}
                    {row.setType === "for_time" && (
                        <>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold border-primary/40 text-primary">
                                For Time
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">Rondas:</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={row.rounds ?? ""}
                                    onChange={(e) =>
                                        onUpdate(row.id, {
                                            rounds: e.target.value ? Number(e.target.value) : null,
                                        })
                                    }
                                    placeholder="3"
                                    className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Timer className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden />
                                <span className="text-[11px] text-muted-foreground">Time Cap:</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={
                                        row.timeCap != null
                                            ? Math.floor(row.timeCap / 60)
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        onUpdate(row.id, {
                                            timeCap: v ? Number(v) * 60 : null,
                                        });
                                    }}
                                    placeholder="12"
                                    className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                />
                                <span className="text-[10px] text-muted-foreground">min</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground italic">
                                Objetivo: menor tiempo
                            </span>
                        </>
                    )}
                    {row.setType === "emom" && (
                        <>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold border-primary/40 text-primary">
                                EMOM
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">Cada:</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={
                                        row.intervalSeconds != null
                                            ? Math.floor(row.intervalSeconds / 60)
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        onUpdate(row.id, {
                                            intervalSeconds: v ? Number(v) * 60 : null,
                                        });
                                    }}
                                    placeholder="1"
                                    className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                />
                                <span className="text-[10px] text-muted-foreground">min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">Rondas:</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={row.rounds ?? ""}
                                    onChange={(e) =>
                                        onUpdate(row.id, {
                                            rounds: e.target.value ? Number(e.target.value) : null,
                                        })
                                    }
                                    placeholder="10"
                                    className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                />
                            </div>
                            {row.rounds != null && row.rounds > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Timer className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden />
                                    <span className="text-[11px] text-muted-foreground">Time Cap:</span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={
                                            row.timeCap != null
                                                ? Math.floor(row.timeCap / 60)
                                                : ""
                                        }
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            onUpdate(row.id, {
                                                timeCap: v ? Number(v) * 60 : null,
                                            });
                                        }}
                                        placeholder="12"
                                        className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                    />
                                    <span className="text-[10px] text-muted-foreground">min</span>
                                </div>
                            )}
                        </>
                    )}
                    {row.setType === "circuit" && (
                        <>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold border-primary/40 text-primary">
                                Circuit
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-muted-foreground">Rondas:</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={row.rounds ?? ""}
                                    onChange={(e) =>
                                        onUpdate(row.id, {
                                            rounds: e.target.value ? Number(e.target.value) : null,
                                        })
                                    }
                                    placeholder="3"
                                    className="h-7 w-14 bg-surface border border-border/60 rounded-md text-center text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
