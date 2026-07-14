/**
 * localRunReferenceUtils.ts — Referencia intra-sesión desde cola offline (F5-OFF-04).
 */

import type { AthleteRunReferencePoint } from "../../types/athleteRunReference";
import type { LocalSetExecution } from "../../offline/athleteSessionTypes";

const GROUP_ROUND_KINDS = new Set(["superset", "giant_set", "dropset"]);
const TIMED_KINDS = new Set(["amrap", "emom", "for_time"]);

export function executionToLocalReferencePoint(
    row: LocalSetExecution
): AthleteRunReferencePoint {
    return {
        source: "same_session_offline",
        weight_kg: row.weight_kg,
        reps: row.reps,
        rpe: row.rpe,
        rounds_completed: row.rounds_completed ?? null,
        total_seconds: row.total_seconds ?? null,
        performed_at: new Date(row.performed_at).toISOString(),
        session_date_label: "Hoy · offline",
    };
}

export function resolveLocalRunReference(input: {
    exerciseId: number;
    setIndex?: number | null;
    roundIndex?: number | null;
    slotLabel?: string | null;
    groupKind?: string | null;
    localExecutions: readonly LocalSetExecution[];
}): AthleteRunReferencePoint | null {
    const { exerciseId, setIndex, roundIndex, slotLabel, groupKind, localExecutions } =
        input;

    if (groupKind && GROUP_ROUND_KINDS.has(groupKind) && slotLabel && roundIndex != null) {
        if (roundIndex > 1) {
            const intra = localExecutions.find(
                (row) =>
                    row.exercise_id === exerciseId &&
                    row.slot_label === slotLabel &&
                    row.round_index === roundIndex - 1
            );
            if (intra) return executionToLocalReferencePoint(intra);
        }
        return null;
    }

    if (groupKind && TIMED_KINDS.has(groupKind)) {
        return null;
    }

    if (setIndex != null && setIndex > 1) {
        const intra = localExecutions.find(
            (row) =>
                row.exercise_id === exerciseId &&
                row.set_index === setIndex - 1
        );
        if (intra) return executionToLocalReferencePoint(intra);
    }

    return null;
}
