/**
 * athleteExerciseNoteUtils.ts — D6 nota libre atleta por block_exercise_id.
 *
 * Propósito: mapas desde progress, payloads PUT, dedupe offline.
 * Contexto: run guiado, registro al final, athleteSessionSync.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import type { AthleteRunProgress } from "../../types/athleteRunProgress";

export const ATHLETE_EXERCISE_NOTE_MAX_LENGTH = 4000;

export interface AthleteExerciseNoteUpsert {
    training_session_id: number;
    block_exercise_id: number;
    athlete_note: string | null;
}

export function buildExerciseNoteUpsertPayload(
    sessionId: number,
    blockExerciseId: number,
    athleteNote: string | null
): AthleteExerciseNoteUpsert {
    const trimmed = athleteNote?.trim() ?? "";
    return {
        training_session_id: sessionId,
        block_exercise_id: blockExerciseId,
        athlete_note: trimmed.length > 0 ? trimmed : null,
    };
}

export function exerciseNotesMapFromProgress(
    progress?: AthleteRunProgress | null
): Map<number, string> {
    const map = new Map<number, string>();
    for (const row of progress?.exercise_notes ?? []) {
        if (row.athlete_note?.trim()) {
            map.set(row.block_exercise_id, row.athlete_note.trim());
        }
    }
    return map;
}

export function collectBlockExerciseNotePayloads(
    sessionId: number,
    notesByBlockExerciseId: ReadonlyMap<number, string>
): AthleteExerciseNoteUpsert[] {
    const out: AthleteExerciseNoteUpsert[] = [];
    for (const [blockExerciseId, text] of notesByBlockExerciseId) {
        out.push(buildExerciseNoteUpsertPayload(sessionId, blockExerciseId, text));
    }
    return out;
}
