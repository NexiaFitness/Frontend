/**
 * loadInheritance.ts — Preserva valores distintos al hidratar desde API.
 *
 * El constructor hereda carga del paso MAIN/S1 a pasos siguientes solo cuando
 * isManuallyEdited es false. Tras cargar desde servidor, los pasos con datos
 * distintos al maestro deben marcarse como editados para no perder reps/RPE.
 */

export interface LoadInheritanceComparable {
    plannedReps?: string | null;
    plannedWeight?: number | null;
    plannedDuration?: number | null;
    effortCharacter?: string | null;
    effortValue?: number | null;
    rest?: number | null;
}

export function loadFieldsDiffer(
    master: LoadInheritanceComparable,
    step: LoadInheritanceComparable
): boolean {
    return (
        (master.plannedReps ?? null) !== (step.plannedReps ?? null) ||
        (master.plannedWeight ?? null) !== (step.plannedWeight ?? null) ||
        (master.plannedDuration ?? null) !== (step.plannedDuration ?? null) ||
        (master.effortCharacter ?? null) !== (step.effortCharacter ?? null) ||
        (master.effortValue ?? null) !== (step.effortValue ?? null) ||
        (master.rest ?? null) !== (step.rest ?? null)
    );
}

export function markDistinctStepsFromMaster<T extends { isManuallyEdited: boolean }>(
    steps: T[],
    differs: (master: T, step: T) => boolean = loadFieldsDiffer as (master: T, step: T) => boolean
): T[] {
    if (steps.length <= 1) return steps;
    const master = steps[0];
    return steps.map((step, index) => {
        if (index === 0) return step;
        if (differs(master, step)) {
            return { ...step, isManuallyEdited: true };
        }
        return step;
    });
}
