/**
 * SessionConstructor.tsx — Tabla principal del Constructor de Sesión
 *
 * Cabeceras: BLOQUE | TIPO SERIE | SERIES | EJERCICIOS | REPS/TIEMPO | CARÁCTER | DESCANSO | [papelera]
 * "+ Añadir serie" añade fila con activeBlockTypeId y setType = "single_set"
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 4
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
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
    activeBlockTypeId: number | null;
    onRowsChange: (rows: ConstructorRow[]) => void;
    onAddExerciseRequest: (rowId: string) => void;
}

export const SessionConstructor: React.FC<SessionConstructorProps> = ({
    rows,
    blockTypes,
    activeBlockTypeId,
    onRowsChange,
    onAddExerciseRequest,
}) => {
    const handleUpdateRow = (rowId: string, updates: Partial<ConstructorRow>) => {
        onRowsChange(
            rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r))
        );
    };

    const handleRemoveRow = (rowId: string) => {
        onRowsChange(rows.filter((r) => r.id !== rowId));
    };

    const handleAddExercise = (rowId: string) => {
        onAddExerciseRequest(rowId);
    };

    const handleRemoveExercise = (rowId: string, exerciseId: string) => {
        onRowsChange(
            rows.map((r) => {
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
        onRowsChange(
            rows.map((r) => {
                if (r.id !== rowId) return r;
                const exercises = r.exercises.map((ex) =>
                    ex.id === exerciseId ? { ...ex, ...updates } : ex
                );
                return { ...r, exercises };
            })
        );
    };

    const handleAddRow = () => {
        const defaultBlockTypeId =
            activeBlockTypeId ?? blockTypes[0]?.id ?? 0;
        const newRow: ConstructorRow = {
            id: generateId(),
            blockTypeId: defaultBlockTypeId,
            setType: SET_TYPE.SINGLE_SET,
            sets: 3,
            rounds: null,
            timeCap: null,
            intervalSeconds: null,
            exercises: [],
            rest: 60,
        };
        onRowsChange([...rows, newRow]);
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[800px] text-sm">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">
                                BLOQUE
                            </th>
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">
                                TIPO SERIE
                            </th>
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground w-20">
                                SERIES
                            </th>
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground min-w-[180px]">
                                EJERCICIOS
                            </th>
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground min-w-[100px]">
                                REPS / TIEMPO
                            </th>
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground w-24">
                                CARÁCTER
                            </th>
                            <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground w-20">
                                DESCANSO
                            </th>
                            <th className="py-2 px-2 w-10" />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
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
                    </tbody>
                </table>
            </div>

            {rows.length === 0 ? (
                <div className="rounded-lg bg-surface py-12 text-center text-sm text-muted-foreground">
                    Selecciona un bloque de entrenamiento para comenzar a construir tu sesión.
                </div>
            ) : null}

            <Button
                type="button"
                variant="outline"
                onClick={handleAddRow}
                className="w-full"
            >
                + Añadir serie
            </Button>
        </div>
    );
};
