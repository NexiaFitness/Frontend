/**
 * Líneas persistidas de una sesión → POST /session-load/validate-draft.
 * Misma agregación que el constructor (exercise_id + block_type_id). No recalcula D1/D1b.
 */

import type { SessionLoadDraftExerciseIn } from "../types/sessionLoad";

export function sessionBlockLinesToLoadDraft(
    blocks: Array<{ id: number; block_type_id: number }>,
    lines: Array<{
        session_block_id: number;
        exercise_id: number;
        planned_sets?: number | null;
        planned_duration?: number | null;
    } | undefined>
): SessionLoadDraftExerciseIn[] {
    const typeByBlock = new Map(blocks.map((block) => [block.id, block.block_type_id]));
    const byLine = new Map<string, SessionLoadDraftExerciseIn>();

    for (const line of lines) {
        if (!line) {
            continue;
        }
        const blockTypeId = typeByBlock.get(line.session_block_id);
        if (blockTypeId == null) {
            continue;
        }
        const exerciseId = line.exercise_id;
        const planned = line.planned_sets ?? 0;
        const duration = line.planned_duration ?? null;
        if (!exerciseId || exerciseId <= 0) {
            continue;
        }
        if (planned <= 0 && (duration == null || duration <= 0)) {
            continue;
        }
        const key = `${exerciseId}:${blockTypeId}`;
        const previous = byLine.get(key);
        byLine.set(key, {
            exercise_id: exerciseId,
            planned_sets: (previous?.planned_sets ?? 0) + Math.max(0, planned),
            planned_duration: duration ?? previous?.planned_duration ?? undefined,
            block_type_id: blockTypeId,
        });
    }

    return [...byLine.values()];
}
