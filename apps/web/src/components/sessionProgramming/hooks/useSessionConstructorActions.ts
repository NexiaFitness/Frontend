/**
 * useSessionConstructorActions.ts — Acciones del constructor (filas y ejercicios).
 * Contexto: extrae mutaciones de SessionConstructor para mantener el JSX presentacional.
 * Notas de mantenimiento: setState funcional vía onRowsChange del padre.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow, ConstructorExercise } from "../constructorTypes";
import { applyConstructorRowUpdate, normalizeSupersetRow } from "../constructor/utils/supersetRow";
import { normalizeSingleSetRow } from "../constructor/utils/singleSetRow";
import { normalizeDropsetRow } from "../constructor/utils/dropsetRow";

function generateId(): string {
    return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useSessionConstructorActions(
    onRowsChange: (action: React.SetStateAction<ConstructorRow[]>) => void
) {
    const handleUpdateRow = React.useCallback(
        (rowId: string, updates: Partial<ConstructorRow>) => {
            onRowsChange((prev) =>
                prev.map((r) =>
                    r.id === rowId ? applyConstructorRowUpdate(r, updates) : r
                )
            );
        },
        [onRowsChange]
    );

    const handleRemoveExercise = React.useCallback(
        (rowId: string, exerciseId: string) => {
            onRowsChange((prev) =>
                prev.map((r) => {
                    if (r.id !== rowId) return r;
                    const exercises = r.exercises.filter((ex) => ex.id !== exerciseId);
                    return { ...r, exercises };
                })
            );
        },
        [onRowsChange]
    );

    const handleUpdateExercise = React.useCallback(
        (
            rowId: string,
            exerciseId: string,
            updates: Partial<ConstructorExercise>
        ) => {
            onRowsChange((prev) =>
                prev.map((r) => {
                    if (r.id !== rowId) return r;
                    const base =
                        r.setType === SET_TYPE.SUPERSET
                            ? normalizeSupersetRow(r)
                            : r;
                    const exercises = base.exercises.map((ex) =>
                        ex.id === exerciseId ? { ...ex, ...updates } : ex
                    );
                    return { ...base, exercises };
                })
            );
        },
        [onRowsChange]
    );

    const handleAddRow = React.useCallback(
        (blockTypeId: number) => {
            const newRow = normalizeSingleSetRow({
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
            });
            onRowsChange((prev) => [...prev, newRow]);
        },
        [onRowsChange]
    );

    const handleRemoveRow = React.useCallback(
        (rowId: string) => {
            onRowsChange((prev) => prev.filter((r) => r.id !== rowId));
        },
        [onRowsChange]
    );

    const handleRemoveBlock = React.useCallback(
        (blockTypeId: number) => {
            onRowsChange((prev) => prev.filter((r) => r.blockTypeId !== blockTypeId));
        },
        [onRowsChange]
    );

    const handleDuplicateRow = React.useCallback(
        (rowId: string) => {
            onRowsChange((prev) => {
                const index = prev.findIndex((r) => r.id === rowId);
                if (index === -1) return prev;

                const source = prev[index];
                const cloneId = generateId();
                const clone: ConstructorRow = {
                    ...source,
                    id: cloneId,
                    exercises: source.exercises.map((ex) => ({
                        ...ex,
                        id: `ex-${generateId()}`,
                    })),
                    setData: source.setData?.map((entry) => ({
                        ...entry,
                        id: `sd-${generateId()}`,
                    })),
                };

                let normalized = clone;
                if (clone.setType === SET_TYPE.SUPERSET) {
                    normalized = normalizeSupersetRow(clone);
                } else if (clone.setType === SET_TYPE.SINGLE_SET) {
                    normalized = normalizeSingleSetRow(clone);
                } else if (clone.setType === SET_TYPE.DROPSET) {
                    normalized = normalizeDropsetRow(clone);
                }

                const next = [...prev];
                next.splice(index + 1, 0, normalized);
                return next;
            });
        },
        [onRowsChange]
    );

    return {
        handleUpdateRow,
        handleRemoveExercise,
        handleUpdateExercise,
        handleAddRow,
        handleRemoveRow,
        handleRemoveBlock,
        handleDuplicateRow,
    };
}
