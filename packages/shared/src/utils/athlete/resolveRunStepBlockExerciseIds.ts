/**
 * resolveRunStepBlockExerciseIds.ts — Slots D6 por paso de run.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import type { AthleteRunStep } from "./buildAthleteRunSteps";
import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";

export function blockExerciseIdsForRunStep(
    runStep: AthleteRunStep | null | undefined,
    flatExercise?: AthleteFlatExercise | null
): number[] {
    if (!runStep) return [];
    if (runStep.groupKind === "emom") return [];
    if (runStep.slots?.length) {
        const ids = runStep.slots.map((s) => s.blockExerciseId);
        return [...new Set(ids)];
    }
    if (flatExercise?.blockExerciseId) return [flatExercise.blockExerciseId];
    if (runStep.blockExerciseId) return [runStep.blockExerciseId];
    return [];
}
