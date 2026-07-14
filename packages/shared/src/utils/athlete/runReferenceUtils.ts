/**
 * Helpers — run reference query, execution payload, logger defaults (SPEC §8–§10).
 */

import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import type {
    AthleteRunExecutionCreate,
    AthleteRunExecutionSuggestionSnapshot,
    AthleteRunReferencePoint,
    AthleteRunReferenceQuery,
} from "../../types/athleteRunReference";
import type { AthleteRunSuggestion } from "../../types/athleteRunSuggestion";
import { shouldShowRunSuggestion } from "../../types/athleteRunSuggestion";
import type {
    AthleteRunRoundSlot,
    AthleteRunStep,
} from "./buildAthleteRunSteps";

const DEFAULT_LOAD_STEP_KG = 2.5;

const SNAPSHOT_ACTIONS = new Set(["increase", "maintain", "decrease"] as const);
const SNAPSHOT_CONFIDENCE = new Set(["low", "medium", "high"] as const);

export function buildSuggestionSnapshotFromRunSuggestion(
    suggestion: AthleteRunSuggestion | null | undefined,
    options?: { loadStepKg?: number }
): AthleteRunExecutionSuggestionSnapshot | undefined {
    if (!shouldShowRunSuggestion(suggestion)) return undefined;
    if (suggestion.metric !== "weight_kg") return undefined;

    const action = SNAPSHOT_ACTIONS.has(
        suggestion.action as "increase" | "maintain" | "decrease"
    )
        ? (suggestion.action as "increase" | "maintain" | "decrease")
        : null;

    const confidence = SNAPSHOT_CONFIDENCE.has(
        suggestion.confidence as "low" | "medium" | "high"
    )
        ? (suggestion.confidence as "low" | "medium" | "high")
        : null;

    return {
        suggestion_shown: true,
        suggested_weight_kg: suggestion.suggested_value,
        reference_weight_kg: suggestion.reference_value,
        suggestion_action: action,
        load_step_kg: options?.loadStepKg ?? DEFAULT_LOAD_STEP_KG,
        confidence,
    };
}

export function attachSuggestionSnapshotToExecutionPayload(
    payload: AthleteRunExecutionCreate,
    suggestion: AthleteRunSuggestion | null | undefined
): AthleteRunExecutionCreate {
    const snapshot = buildSuggestionSnapshotFromRunSuggestion(suggestion);
    if (!snapshot) return payload;
    return { ...payload, suggestion_snapshot: snapshot };
}

export interface RunLoggerDefaultsInput {
    setIndex: number;
    prescribedReps: number;
    prescribedRpe: number | null;
    plannedWeight: number | null;
    defaultWeight: number;
    reference: AthleteRunReferencePoint | null | undefined;
}

export interface RunLoggerDefaults {
    weight: number;
    reps: number;
    rpe: number | null;
}

export function buildSlotFlatExercise(
    runStep: AthleteRunStep,
    slot: AthleteRunRoundSlot
): AthleteFlatExercise {
    return {
        stepKey: slot.stepKey,
        blockExerciseId: slot.blockExerciseId,
        exerciseId: slot.exerciseId,
        name: slot.exerciseName,
        blockName: runStep.blockName,
        groupKind: runStep.groupKind,
        setLabel: slot.setLabel,
        setIndex: runStep.roundIndex,
        totalSetsInSlot: runStep.roundTotal ?? 1,
        plannedLabel: slot.plannedLabel,
        plannedWeight: null,
        defaultWeight: slot.defaultWeight,
        defaultReps: slot.defaultReps,
        restSeconds: runStep.restAfterSeconds,
        defaultRpe: slot.defaultRpe,
        videoUrl: null,
        loggedSets: slot.loggedSets,
        badgeLabel: runStep.badgeLabel,
        groupId: runStep.groupId,
        roundIndex: runStep.roundIndex,
        roundTotal: runStep.roundTotal,
        slotLabel: slot.slotLabel,
        instruction: runStep.instruction || undefined,
    };
}

export function buildAthleteRunReferenceQueryFromSlot(
    sessionId: number,
    runStep: AthleteRunStep,
    slot: AthleteRunRoundSlot
): AthleteRunReferenceQuery {
    return buildAthleteRunReferenceQuery(sessionId, buildSlotFlatExercise(runStep, slot));
}

export function buildAthleteRunExecutionPayloadFromSlot(
    sessionId: number,
    runStep: AthleteRunStep,
    slot: AthleteRunRoundSlot,
    values: { weight: number; reps: number; rpe: number | null },
    suggestion?: AthleteRunSuggestion | null
): AthleteRunExecutionCreate {
    return buildAthleteRunExecutionPayload(
        sessionId,
        buildSlotFlatExercise(runStep, slot),
        values,
        suggestion
    );
}

export function buildAthleteRunReferenceQuery(
    sessionId: number,
    exercise: AthleteFlatExercise
): AthleteRunReferenceQuery {
    return {
        training_session_id: sessionId,
        step_key: exercise.stepKey,
        exercise_id: exercise.exerciseId,
        set_index: exercise.setIndex,
        round_index: exercise.roundIndex ?? undefined,
        slot_label: exercise.slotLabel ?? undefined,
        group_kind: exercise.groupKind ?? "single_set",
        prescribed_reps: exercise.defaultReps > 0 ? exercise.defaultReps : undefined,
        prescribed_reps_max: exercise.defaultReps > 0 ? exercise.defaultReps : undefined,
        prescribed_rpe: exercise.defaultRpe ?? undefined,
        input_mode: "weight_reps",
    };
}

export function buildAthleteRunExecutionPayload(
    sessionId: number,
    exercise: AthleteFlatExercise,
    values: { weight: number; reps: number; rpe: number | null },
    suggestion?: AthleteRunSuggestion | null
): AthleteRunExecutionCreate {
    const payload: AthleteRunExecutionCreate = {
        training_session_id: sessionId,
        step_key: exercise.stepKey,
        exercise_id: exercise.exerciseId,
        block_exercise_id: exercise.blockExerciseId,
        set_index: exercise.setIndex,
        set_label: exercise.setLabel,
        slot_label: exercise.slotLabel ?? undefined,
        round_index: exercise.roundIndex ?? undefined,
        group_kind: exercise.groupKind ?? "single_set",
        input_mode: "weight_reps",
        weight_kg: values.weight,
        reps: values.reps,
        rpe: values.rpe ?? undefined,
        source: "run_live",
    };
    return attachSuggestionSnapshotToExecutionPayload(payload, suggestion);
}

/** Defaults al entrar en logging_rest (SPEC §10). */
export function resolveRunLoggerDefaults(input: RunLoggerDefaultsInput): RunLoggerDefaults {
    const ref = input.reference;
    const fallbackWeight = input.plannedWeight ?? input.defaultWeight ?? 0;
    const weight = ref?.weight_kg ?? fallbackWeight;
    const reps = input.prescribedReps > 0 ? input.prescribedReps : 8;

    let rpe = input.prescribedRpe;
    if (input.setIndex > 1 && ref?.rpe != null) {
        rpe = ref.rpe;
    }

    return { weight, reps, rpe };
}

export function formatRunReferenceValueLine(
    weightKg: number | null,
    reps: number | null,
    rpe: number | null
): string {
    const parts: string[] = [];
    if (weightKg != null) parts.push(`${weightKg} kg`);
    if (reps != null) parts.push(`× ${reps}`);
    if (rpe != null) parts.push(`@ RPE ${rpe}`);
    return parts.join(" ") || "—";
}
