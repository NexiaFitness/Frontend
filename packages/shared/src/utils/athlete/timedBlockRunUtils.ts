/**
 * Timed block run — reference formatting + timed result payloads (F4).
 */

import type { AthleteRunReferencePoint } from "../../types/athleteRunReference";
import type { AthleteRunTimedResultCreate } from "../../types/athleteRunReference";
import type {
    AthleteEmomInterval,
    AthleteRunRoundSlot,
    AthleteRunStep,
} from "./buildAthleteRunSteps";
import { computeAmrapPartialTotal, formatAmrapResultSummary } from "./amrapResult";
import { formatForTimeDuration } from "./forTimeResult";

export function buildAthleteRunTimedReferenceQuery(
    sessionId: number,
    runStep: AthleteRunStep
) {
    return {
        training_session_id: sessionId,
        step_key: runStep.stepKey,
        exercise_id: runStep.exerciseId,
        group_kind: runStep.groupKind ?? undefined,
        group_id: runStep.groupId,
        input_mode:
            runStep.groupKind === "for_time"
                ? "duration"
                : runStep.groupKind === "amrap"
                  ? "rounds_only"
                  : "weight_reps",
    };
}

export function hasAthleteRunTimedReferencePoint(
    groupKind: string | null | undefined,
    point: AthleteRunReferencePoint | null | undefined
): boolean {
    if (!point || !groupKind) return false;
    if (groupKind === "amrap") {
        return (point.rounds_completed ?? 0) > 0 || (point.reps ?? 0) > 0;
    }
    if (groupKind === "for_time") {
        return point.total_seconds != null && point.total_seconds > 0;
    }
    if (groupKind === "emom") {
        return (point.rounds_completed ?? 0) > 0 || (point.reps ?? 0) > 0;
    }
    return false;
}

export function formatTimedReferenceValueLine(
    groupKind: string,
    point: AthleteRunReferencePoint
): string {
    if (groupKind === "amrap") {
        return formatAmrapResultSummary(point.rounds_completed ?? 0, point.reps ?? 0);
    }
    if (groupKind === "for_time" && point.total_seconds != null) {
        return formatForTimeDuration(point.total_seconds);
    }
    if (groupKind === "emom") {
        const completed = point.rounds_completed ?? 0;
        const total = point.reps ?? 0;
        if (total > 0) return `${completed}/${total} intervalos`;
        return `${completed} intervalos completados`;
    }
    return "—";
}

export function formatTimedPersonalBestLine(
    groupKind: string,
    metric: string,
    roundsCompleted: number | null | undefined,
    totalSeconds: number | null | undefined,
    partialReps: number | null | undefined
): string {
    if (groupKind === "amrap") {
        return formatAmrapResultSummary(roundsCompleted ?? 0, partialReps ?? 0);
    }
    if (groupKind === "for_time" && totalSeconds != null) {
        return formatForTimeDuration(totalSeconds);
    }
    if (groupKind === "emom") {
        const completed = roundsCompleted ?? 0;
        const total = partialReps ?? 0;
        if (total > 0) return `${completed}/${total} intervalos`;
        return `${completed} intervalos`;
    }
    return metric;
}

export function buildAmrapTimedResultPayload(input: {
    sessionId: number;
    runStep: AthleteRunStep;
    fullRounds: number;
    slots: readonly AthleteRunRoundSlot[];
    partialReps: Record<string, number>;
}): AthleteRunTimedResultCreate {
    const partialTotal = computeAmrapPartialTotal(
        input.slots.map((slot) => input.partialReps[slot.stepKey] ?? 0)
    );
    return {
        training_session_id: input.sessionId,
        group_id: input.runStep.groupId,
        step_key: input.runStep.stepKey,
        timed_mode: "amrap",
        session_block_id: input.runStep.blockId,
        rounds_completed: input.fullRounds,
        payload_json: JSON.stringify({
            partial_total: partialTotal,
            partial_by_slot: input.partialReps,
        }),
    };
}

export function buildEmomTimedResultPayload(input: {
    sessionId: number;
    runStep: AthleteRunStep;
    intervals: readonly AthleteEmomInterval[];
    asPlanned: boolean;
    failedCount: number;
}): AthleteRunTimedResultCreate {
    const intervalTotal = input.intervals.length;
    const failed = input.asPlanned ? 0 : input.failedCount;
    const completed = Math.max(0, intervalTotal - failed);
    return {
        training_session_id: input.sessionId,
        group_id: input.runStep.groupId,
        step_key: input.runStep.stepKey,
        timed_mode: "emom",
        session_block_id: input.runStep.blockId,
        emom_completed_count: completed,
        emom_failed_count: failed,
        payload_json: JSON.stringify({
            interval_total: intervalTotal,
            as_planned: input.asPlanned,
        }),
    };
}

export function buildForTimeTimedResultPayload(input: {
    sessionId: number;
    runStep: AthleteRunStep;
    totalSeconds: number;
    cumulativeSplits: readonly number[];
}): AthleteRunTimedResultCreate {
    return {
        training_session_id: input.sessionId,
        group_id: input.runStep.groupId,
        step_key: input.runStep.stepKey,
        timed_mode: "for_time",
        session_block_id: input.runStep.blockId,
        total_seconds: input.totalSeconds,
        payload_json: JSON.stringify({
            cumulative_splits: [...input.cumulativeSplits],
        }),
    };
}
