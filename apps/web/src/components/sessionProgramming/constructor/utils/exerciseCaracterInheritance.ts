/**
 * exerciseCaracterInheritance.ts — Herencia de carácter (RPE/RIR/%RM) entre ejercicios
 * de un mismo bloque cuando no se usa setData (superset, giant_set, amrap, for_time).
 *
 * Regla: el primer ejercicio (índice 0) actúa como maestro. Al editarlo se propaga
 * effortCharacter + effortValue a los demás ejercicios que NO hayan sido editados
 * manualmente (isManuallyEdited === true). Los ejercicios editados manualmente se
 * mantienen independientes.
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import type { ConstructorExercise, EmomWindow } from "../../constructorTypes";

export function applyCaracterUpdateWithInheritance(
    exercises: ConstructorExercise[],
    editedIndex: number,
    updates: Partial<ConstructorExercise>
): ConstructorExercise[] {
    const next = exercises.map((ex, i) => {
        if (i !== editedIndex) return ex;
        return {
            ...ex,
            ...updates,
            isManuallyEdited:
                editedIndex > 0
                    ? updates.isManuallyEdited ?? true
                    : ex.isManuallyEdited,
        };
    });

    if (editedIndex === 0) {
        const master = next[0];
        for (let i = 1; i < next.length; i++) {
            if (!next[i].isManuallyEdited) {
                next[i] = {
                    ...next[i],
                    effortCharacter: master.effortCharacter,
                    effortValue: master.effortValue,
                };
            }
        }
    }

    return next;
}

export function hasCaracterChange(
    updates: Partial<ConstructorExercise>
): boolean {
    return "effortCharacter" in updates || "effortValue" in updates;
}

export function applyEmomWindowCaracterInheritance(
    windows: EmomWindow[],
    windowId: string,
    exerciseId: string,
    updates: Partial<ConstructorExercise>
): EmomWindow[] {
    return windows.map((window) => {
        if (window.id !== windowId) return window;
        const editedIndex = window.exercises.findIndex(
            (ex) => ex.id === exerciseId
        );
        if (editedIndex < 0) return window;
        const nextExercises = applyCaracterUpdateWithInheritance(
            window.exercises,
            editedIndex,
            updates
        );
        return { ...window, exercises: nextExercises };
    });
}
