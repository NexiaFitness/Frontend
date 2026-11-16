/**
 * athleteRunFlatExercises.ts — Pasos de run a filas planas (offline / logger F1).
 * Extraído de buildAthleteRunSteps para no crecer un archivo ya sobre el límite
 * (agent.md §7.1) al persistir sessionBlockId (B-25).
 */

import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import { shouldRestAfterCompletingStep } from "./athleteRunGroupContext";
import type { AthleteRunStep } from "./buildAthleteRunSteps";

/** Expande pasos UI a filas planas para offline / compat F1. */
export function flattenRunStepsToFlatExercises(steps: AthleteRunStep[]): AthleteFlatExercise[] {
    const flat: AthleteFlatExercise[] = [];

    for (const step of steps) {
        if ((step.kind === "group_round" || step.kind === "timed_block") && step.slots?.length) {
            for (const slot of step.slots) {
                flat.push({
                    stepKey: slot.stepKey,
                    blockExerciseId: slot.blockExerciseId,
                    sessionBlockId: step.blockId,
                    exerciseId: slot.exerciseId,
                    name: slot.exerciseName,
                    blockName: step.blockName,
                    groupKind: step.groupKind,
                    setLabel: slot.setLabel,
                    setIndex: step.roundIndex,
                    totalSetsInSlot: step.roundTotal ?? 1,
                    plannedLabel: slot.plannedLabel,
                    plannedWeight: null,
                    plannedDurationSeconds: null,
                    inputMode: slot.inputMode,
                    defaultWeight: slot.defaultWeight,
                    defaultReps: slot.defaultReps,
                    restSeconds: step.restAfterSeconds,
                    defaultRpe: slot.defaultRpe,
                    videoUrl: null,
                    loggedSets: slot.loggedSets,
                    badgeLabel: step.badgeLabel,
                    groupId: step.groupId,
                    roundIndex: step.roundIndex,
                    roundTotal: step.roundTotal,
                    slotLabel: slot.slotLabel,
                    instruction: step.instruction || undefined,
                });
            }
            continue;
        }
        flat.push(runStepToFlatExercise(step));
    }

    return flat;
}

/** Adapta un paso de run al contrato offline/logger existente (F1). */
export function runStepToFlatExercise(step: AthleteRunStep): AthleteFlatExercise {
    return {
        stepKey: step.stepKey,
        blockExerciseId: step.blockExerciseId,
        sessionBlockId: step.blockId,
        exerciseId: step.exerciseId,
        name: step.exerciseName,
        blockName: step.blockName,
        groupKind: step.groupKind,
        setLabel: step.setLabel,
        setIndex: step.setIndex,
        totalSetsInSlot: step.totalSetsInSlot,
        plannedLabel: step.plannedLabel,
        plannedWeight: step.plannedWeight,
        plannedDurationSeconds: step.plannedDurationSeconds,
        inputMode: step.inputMode,
        defaultWeight: step.defaultWeight,
        defaultReps: step.defaultReps,
        restSeconds: step.restAfterSeconds,
        defaultRpe: step.defaultRpe,
        videoUrl: null,
        loggedSets: step.loggedSets,
        badgeLabel: step.badgeLabel,
        groupId: step.groupId,
        roundIndex: step.roundIndex,
        roundTotal: step.roundTotal,
        slotLabel: step.slotLabel,
        instruction: step.instruction || undefined,
    };
}

/**
 * Descanso tras confirmar el paso actual — regla canónica §5a.
 * Sin paso siguiente → null (fin de sesión; no overlay aunque el bloque prescriba rest).
 */
export function resolveRestAfterCompletingRunStep(
    current: AthleteRunStep,
    next: AthleteRunStep | undefined
): number | null {
    if (current.kind === "group_round" || current.kind === "timed_block") {
        const rest = current.restAfterSeconds;
        const prescribed = rest != null && rest > 0 ? rest : null;
        if (!next) {
            // FOR TIME: descanso post-bloque durante revisión aunque sea el último paso de la sesión (B4).
            if (current.kind === "timed_block" && current.groupKind === "for_time") {
                return prescribed;
            }
            return null;
        }
        return prescribed;
    }

    if (!next) return null;

    const flatCurrent = runStepToFlatExercise(current);
    const flatNext = runStepToFlatExercise(next);
    if (!shouldRestAfterCompletingStep(flatCurrent, flatNext)) return null;

    const seconds = flatCurrent.restSeconds;
    return seconds != null && seconds > 0 ? seconds : null;
}
