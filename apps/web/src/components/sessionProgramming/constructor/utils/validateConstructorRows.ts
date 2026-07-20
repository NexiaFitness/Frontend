/**
 * validateConstructorRows.ts — Validación submit del constructor (reglas por set_type).
 * @see docs/tipo-serie/10_contrato-volumen-series-equivalentes.md
 */

import { SET_TYPE, type SetType } from "@nexia/shared/types/sessionProgramming";
import type {
    ConstructorExercise,
    ConstructorRow,
    ConstructorValidationIssue,
    ConstructorValidationResult,
} from "../../constructorTypes";
import { ensureAmrapStructure } from "./amrapRow";
import { normalizeDropsetRow } from "./dropsetRow";
import { normalizeEmomRow } from "./emomRow";
import { normalizeForTimeRow } from "./forTimeRow";
import { normalizeGiantSetRow } from "./giantSetRow";
import { getConstructorPersistLines, normalizeSingleSetRow } from "./singleSetRow";
import {
    isFilledConstructorExercise,
    normalizeSupersetRow,
    SUPERSET_SLOT_COUNT,
} from "./supersetRow";

function isPositiveInt(value: number | null | undefined): boolean {
    return value != null && Number.isFinite(value) && value >= 1;
}

function pushIssue(
    issues: ConstructorValidationIssue[],
    row: ConstructorRow,
    field: ConstructorValidationIssue["field"],
    message: string,
    exerciseSlotId?: string
): void {
    issues.push({
        rowId: row.id,
        setType: row.setType,
        field,
        exerciseSlotId,
        message,
    });
}

function requireFilledExercises(
    issues: ConstructorValidationIssue[],
    row: ConstructorRow,
    exercises: ConstructorExercise[],
    requireAll: boolean
): void {
    const unfilled = exercises.filter((ex) => !isFilledConstructorExercise(ex));
    if (unfilled.length === 0) {
        return;
    }
    if (requireAll) {
        for (const ex of unfilled) {
            pushIssue(issues, row, "exercise", "Selecciona un ejercicio para este slot.", ex.id);
        }
        return;
    }
    if (exercises.every((ex) => !isFilledConstructorExercise(ex))) {
        const first = exercises[0];
        if (first) {
            pushIssue(
                issues,
                row,
                "exercise",
                "Selecciona al menos un ejercicio en este bloque.",
                first.id
            );
        }
    }
}

function validateGlobalRow(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    if (!row.blockTypeId || row.blockTypeId <= 0) {
        pushIssue(issues, row, "blockTypeId", "Selecciona un tipo de bloque de entrenamiento.");
    }
}

function validateSingleSet(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    const normalized = normalizeSingleSetRow(row);
    if (!isPositiveInt(normalized.sets)) {
        pushIssue(issues, row, "sets", "Indica el número de series (mínimo 1).");
    }
    if (!normalized.setData?.length) {
        pushIssue(issues, row, "sets", "Añade al menos una serie de trabajo.");
    }
    const exercise = normalized.exercises[0];
    if (!exercise || !isFilledConstructorExercise(exercise)) {
        pushIssue(
            issues,
            row,
            "exercise",
            "Selecciona el ejercicio de esta serie.",
            exercise?.id
        );
    }
}

function validateSuperset(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    const normalized = normalizeSupersetRow(row);
    if (!isPositiveInt(normalized.sets)) {
        pushIssue(issues, row, "sets", "Indica el número de rondas del superset (mínimo 1).");
    }
    const slots = normalized.exercises.slice(0, SUPERSET_SLOT_COUNT);
    requireFilledExercises(issues, row, slots, true);
}

function validateGiantSet(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    const normalized = normalizeGiantSetRow(row);
    if (!isPositiveInt(normalized.sets)) {
        pushIssue(issues, row, "sets", "Indica el número de rondas (mínimo 1).");
    }
    requireFilledExercises(issues, row, normalized.exercises, true);
}

function validateDropset(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    const normalized = normalizeDropsetRow(row);
    if (!isPositiveInt(normalized.sets)) {
        pushIssue(issues, row, "sets", "Indica el número de rondas del dropset (mínimo 1).");
    }
    const exercise = normalized.exercises.find(isFilledConstructorExercise);
    if (!exercise) {
        const first = normalized.exercises[0];
        pushIssue(
            issues,
            row,
            "exercise",
            "Selecciona el ejercicio principal (MAIN) del dropset.",
            first?.id
        );
    }
    if (!normalized.setData?.length) {
        pushIssue(issues, row, "sets", "Configura al menos un paso en la secuencia dropset.");
    }
}

function validateAmrap(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    const normalized = ensureAmrapStructure(row);
    if (!isPositiveInt(row.timeCap) || (row.timeCap ?? 0) < 60) {
        pushIssue(issues, row, "timeCap", "Indica la duración total del AMRAP (mínimo 1 min).");
    }
    if (!isPositiveInt(row.rounds)) {
        pushIssue(
            issues,
            row,
            "rounds",
            "Indica las rondas objetivo del AMRAP (mínimo 1). Sin rondas no se cuenta volumen."
        );
    }
    requireFilledExercises(issues, row, normalized.exercises, false);
}

function validateEmom(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    if (!isPositiveInt(row.intervalSeconds) || (row.intervalSeconds ?? 0) < 60) {
        pushIssue(issues, row, "intervalSeconds", "Indica el intervalo EMOM (mínimo 1 min).");
    }
    if (!isPositiveInt(row.rounds)) {
        pushIssue(issues, row, "rounds", "Indica el número de rondas EMOM (mínimo 1).");
    }
    const normalized = normalizeEmomRow(row);
    const windows = normalized.emomWindows ?? [];
    const allExercises = windows.flatMap((w) => w.exercises);
    requireFilledExercises(issues, row, allExercises, false);
}

function validateForTime(issues: ConstructorValidationIssue[], row: ConstructorRow): void {
    if (!isPositiveInt(row.rounds)) {
        pushIssue(issues, row, "rounds", "Indica el número de rondas For Time (mínimo 1).");
    }
    const normalized = normalizeForTimeRow(row);
    requireFilledExercises(issues, row, normalized.exercises, false);
}

const VALIDATORS: Record<SetType, (issues: ConstructorValidationIssue[], row: ConstructorRow) => void> = {
    [SET_TYPE.SINGLE_SET]: validateSingleSet,
    [SET_TYPE.SUPERSET]: validateSuperset,
    [SET_TYPE.GIANT_SET]: validateGiantSet,
    [SET_TYPE.DROPSET]: validateDropset,
    [SET_TYPE.AMRAP]: validateAmrap,
    [SET_TYPE.EMOM]: validateEmom,
    [SET_TYPE.FOR_TIME]: validateForTime,
};

/**
 * Valida filas del constructor antes de guardar.
 * Constructor vacío (0 filas) → válido (sesión placeholder permitida).
 */
export function validateConstructorRows(rows: ConstructorRow[]): ConstructorValidationResult {
    if (rows.length === 0) {
        return { valid: true, issues: [] };
    }

    const issues: ConstructorValidationIssue[] = [];

    for (const row of rows) {
        validateGlobalRow(issues, row);
        const typeValidator = VALIDATORS[row.setType];
        if (typeValidator) {
            typeValidator(issues, row);
        }
        if (getConstructorPersistLines(row).length === 0) {
            const hasExerciseIssue = issues.some(
                (i) => i.rowId === row.id && i.field === "exercise"
            );
            if (!hasExerciseIssue) {
                pushIssue(
                    issues,
                    row,
                    "exercise",
                    "Completa este bloque: falta ejercicio o parámetros de serie."
                );
            }
        }
    }

    return { valid: issues.length === 0, issues };
}

export function constructorValidationIssuesToMap(
    issues: ConstructorValidationIssue[]
): Record<string, ConstructorValidationIssue> {
    const map: Record<string, ConstructorValidationIssue> = {};
    for (const issue of issues) {
        const key = `${issue.rowId}:${issue.field}${issue.exerciseSlotId ? `:${issue.exerciseSlotId}` : ""}`;
        if (!map[key]) {
            map[key] = issue;
        }
    }
    return map;
}
