/**
 * useSessionConstructorActions.ts — Acciones del constructor (filas y ejercicios).
 * Contexto: extrae mutaciones de SessionConstructor para mantener el JSX presentacional.
 * Notas de mantenimiento: setState funcional vía onRowsChange del padre.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import { createBlockInstanceId } from "@nexia/shared/sessionProgramming/constructorBlockInstance";
import type { ConstructorRow, ConstructorExercise } from "../constructorTypes";
import { applyConstructorRowUpdate, normalizeSupersetRow } from "../constructor/utils/supersetRow";
import { normalizeSingleSetRow } from "../constructor/utils/singleSetRow";
import { normalizeDropsetRow } from "../constructor/utils/dropsetRow";
import { normalizeGiantSetRow } from "../constructor/utils/giantSetRow";
import { normalizeForTimeRow } from "../constructor/utils/forTimeRow";
import { normalizeEmomRow } from "../constructor/utils/emomRow";
import { normalizeAmrapRow } from "../constructor/utils/amrapRow";
import {
    resolveBlockInstanceId,
} from "@nexia/shared/sessionProgramming/constructorBlockInstance";

function generateId(): string {
    return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Normaliza la fila tras un cambio de setType (misma instancia = mismo tipo). */
export function normalizeConstructorRowForSetType(row: ConstructorRow): ConstructorRow {
    if (row.setType === SET_TYPE.SUPERSET) {
        return normalizeSupersetRow(row);
    }
    if (row.setType === SET_TYPE.SINGLE_SET) {
        return normalizeSingleSetRow(row);
    }
    if (row.setType === SET_TYPE.DROPSET) {
        return normalizeDropsetRow(row);
    }
    if (row.setType === SET_TYPE.GIANT_SET) {
        return normalizeGiantSetRow(row);
    }
    if (row.setType === SET_TYPE.FOR_TIME) {
        return normalizeForTimeRow(row);
    }
    if (row.setType === SET_TYPE.EMOM) {
        return normalizeEmomRow(row);
    }
    if (row.setType === SET_TYPE.AMRAP) {
        return normalizeAmrapRow(row);
    }
    return row;
}

export function useSessionConstructorActions(
    onRowsChange: (action: React.SetStateAction<ConstructorRow[]>) => void
) {
    const handleUpdateRow = React.useCallback(
        (rowId: string, updates: Partial<ConstructorRow>) => {
            onRowsChange((prev) => {
                const target = prev.find((r) => r.id === rowId);
                if (!target) return prev;

                if (updates.setType !== undefined) {
                    const instanceId = resolveBlockInstanceId(target);
                    return prev.map((r) => {
                        if (resolveBlockInstanceId(r) !== instanceId) return r;
                        const merged =
                            r.id === rowId
                                ? applyConstructorRowUpdate(r, updates)
                                : applyConstructorRowUpdate(r, {
                                      setType: updates.setType,
                                  });
                        return normalizeConstructorRowForSetType(merged);
                    });
                }

                return prev.map((r) =>
                    r.id === rowId ? applyConstructorRowUpdate(r, updates) : r
                );
            });
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
                            : r.setType === SET_TYPE.GIANT_SET
                              ? normalizeGiantSetRow(r)
                              : r.setType === SET_TYPE.FOR_TIME
                                ? normalizeForTimeRow(r)
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
        (args: {
            blockTypeId: number;
            blockInstanceId: string;
            setType: ConstructorRow["setType"];
        }) => {
            const { blockTypeId, blockInstanceId, setType } = args;
            const draft: ConstructorRow = {
                id: generateId(),
                blockInstanceId,
                blockTypeId,
                setType,
                sets: 3,
                rounds: null,
                timeCap: null,
                intervalSeconds: null,
                exercises: [],
                rest: 60,
                repsTipo: "reps",
            };
            let newRow = draft;
            if (setType === SET_TYPE.SUPERSET) {
                newRow = normalizeSupersetRow(draft);
            } else if (setType === SET_TYPE.SINGLE_SET) {
                newRow = normalizeSingleSetRow(draft);
            } else if (setType === SET_TYPE.DROPSET) {
                newRow = normalizeDropsetRow(draft);
            } else if (setType === SET_TYPE.GIANT_SET) {
                newRow = normalizeGiantSetRow(draft);
            } else if (setType === SET_TYPE.FOR_TIME) {
                newRow = normalizeForTimeRow(draft);
            } else if (setType === SET_TYPE.EMOM) {
                newRow = normalizeEmomRow(draft);
            } else if (setType === SET_TYPE.AMRAP) {
                newRow = normalizeAmrapRow(draft);
            }
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
                    blockInstanceId: source.blockInstanceId ?? createBlockInstanceId(),
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
                } else if (clone.setType === SET_TYPE.GIANT_SET) {
                    normalized = normalizeGiantSetRow(clone);
                } else if (clone.setType === SET_TYPE.FOR_TIME) {
                    normalized = normalizeForTimeRow(clone);
                } else if (clone.setType === SET_TYPE.EMOM) {
                    normalized = normalizeEmomRow({
                        ...clone,
                        emomWindows: clone.emomWindows?.map((w) => ({
                            ...w,
                            id: `emom-win-${generateId()}`,
                            exercises: w.exercises.map((ex) => ({
                                ...ex,
                                id: `ex-${generateId()}`,
                            })),
                        })),
                    });
                } else if (clone.setType === SET_TYPE.AMRAP) {
                    normalized = normalizeAmrapRow(clone);
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
        handleDuplicateRow,
    };
}
