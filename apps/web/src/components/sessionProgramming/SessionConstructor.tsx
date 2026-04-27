/**
 * SessionConstructor.tsx — Tabla principal del Constructor de Sesión
 * Contexto: aplica actualizaciones sobre filas (series, descanso, AMRAP, etc.) hacia el padre.
 * Notas: todas las transiciones de estado usan setState en forma funcional para no perder
 * el último `prev` (clics rápidos, múltiples orígenes) cuando `onRowsChange` es un setter.
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 4
 * @spec Lovable — Bloques + Constructor dinámico
 */

import React from "react";
import { Plus, Trash2, Timer } from "lucide-react";
import { SessionConstructorRow } from "./SessionConstructorRow";
import type { ConstructorRow, ConstructorExercise } from "./constructorTypes";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";

function generateId(): string {
    return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface SessionConstructorProps {
    rows: ConstructorRow[];
    blockTypes: TrainingBlockType[];
    /** Típico: `setConstructorRows` de useState, admite array o updater funcional. */
    onRowsChange: (action: React.SetStateAction<ConstructorRow[]>) => void;
    onAddExerciseRequest: (rowId: string) => void;
}

export const SessionConstructor: React.FC<SessionConstructorProps> = ({
    rows,
    blockTypes,
    onRowsChange,
    onAddExerciseRequest,
}) => {
    const handleUpdateRow = (rowId: string, updates: Partial<ConstructorRow>) => {
        onRowsChange((prev) =>
            prev.map((r) => (r.id === rowId ? { ...r, ...updates } : r))
        );
    };

    const handleAddExercise = (rowId: string) => {
        onAddExerciseRequest(rowId);
    };

    const handleRemoveExercise = (rowId: string, exerciseId: string) => {
        onRowsChange((prev) =>
            prev.map((r) => {
                if (r.id !== rowId) return r;
                const exercises = r.exercises.filter((ex) => ex.id !== exerciseId);
                return { ...r, exercises };
            })
        );
    };

    const handleUpdateExercise = (
        rowId: string,
        exerciseId: string,
        updates: Partial<ConstructorExercise>
    ) => {
        onRowsChange((prev) =>
            prev.map((r) => {
                if (r.id !== rowId) return r;
                const exercises = r.exercises.map((ex) =>
                    ex.id === exerciseId ? { ...ex, ...updates } : ex
                );
                return { ...r, exercises };
            })
        );
    };

    const handleAddRow = (blockTypeId: number) => {
        const newRow: ConstructorRow = {
            id: generateId(),
            blockTypeId,
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            rounds: null,
            timeCap: null,
            intervalSeconds: null,
            exercises: [],
            rest: 60,
            repsTipo: "reps",
        };
        onRowsChange((prev) => [...prev, newRow]);
    };

    const handleRemoveRow = (rowId: string) => {
        onRowsChange((prev) => prev.filter((r) => r.id !== rowId));
    };

    const handleRemoveBlock = (blockTypeId: number) => {
        onRowsChange((prev) => prev.filter((r) => r.blockTypeId !== blockTypeId));
    };

    /** Agrupar filas por blockTypeId para mostrar pie por bloque */
    const rowsByBlock = React.useMemo(() => {
        const map = new Map<number, ConstructorRow[]>();
        for (const row of rows) {
            if (!row.blockTypeId) continue;
            const list = map.get(row.blockTypeId) ?? [];
            list.push(row);
            map.set(row.blockTypeId, list);
        }
        return map;
    }, [rows]);

    const showTable = rows.length > 0;

    return (
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                    Constructor de Sesión
                </h3>
            </div>

            {!showTable ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                    Selecciona un bloque de entrenamiento para comenzar a construir tu sesión.
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {/* Cabeceras — grid: más espacio Reps/Tiempo, Carácter, Descanso; menos Ejercicios */}
                    <div className="grid grid-cols-[170px_110px_70px_minmax(140px,1fr)_140px_160px_100px] gap-2 px-4 py-2.5 bg-surface/50 text-[11px] font-medium text-muted-foreground uppercase tracking-wider items-center">
                        <span>Bloque</span>
                        <span>Tipo Serie</span>
                        <span>Series</span>
                        <span>Ejercicios</span>
                        <span className="flex items-center justify-center w-full text-center">Reps / Tiempo</span>
                        <span className="flex items-center justify-center w-full text-center">Carácter</span>
                        <span className="flex items-center justify-center gap-1 w-full text-center">
                            <Timer className="h-3 w-3 shrink-0" aria-hidden />
                            Descanso
                        </span>
                    </div>

                    {/* Filas agrupadas por bloque — cada grupo tiene su pie con + Añadir serie | Eliminar bloque */}
                    {Array.from(rowsByBlock.entries()).map(([blockTypeId, blockRows]) => (
                        <React.Fragment key={blockTypeId}>
                            {blockRows.map((row) => (
                                <SessionConstructorRow
                                    key={row.id}
                                    row={row}
                                    blockTypes={blockTypes}
                                    onUpdate={handleUpdateRow}
                                    onRemove={handleRemoveRow}
                                    onAddExercise={handleAddExercise}
                                    onRemoveExercise={handleRemoveExercise}
                                    onUpdateExercise={handleUpdateExercise}
                                />
                            ))}
                            <div className="flex items-center justify-between px-4 py-2 bg-surface/20 border-t border-border/40">
                                <button
                                    type="button"
                                    onClick={() => handleAddRow(blockTypeId)}
                                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Plus className="h-3 w-3" aria-hidden />
                                    Añadir serie
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveBlock(blockTypeId)}
                                    className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" aria-hidden />
                                    Eliminar bloque
                                </button>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};
