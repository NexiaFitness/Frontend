/**
 * useAthleteRunExerciseNotes.ts — D6 nota libre por block_exercise_id en run.
 *
 * Propósito: borrador, persistencia PUT/cola, mapa desde progress.
 * Contexto: AthleteSessionRunPage + registro al final.
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AthleteRunProgress } from "@nexia/shared/types/athleteRunProgress";
import {
    buildExerciseNoteUpsertPayload,
    exerciseNotesMapFromProgress,
} from "@nexia/shared/utils/athlete/athleteExerciseNoteUtils";
import { usePutAthleteExerciseNoteMutation } from "@nexia/shared/api/athleteApi";
import { queueExerciseNoteLog } from "@nexia/shared/offline/athleteSessionSync";

export interface UseAthleteRunExerciseNotesOptions {
    sessionId: number;
    progress?: AthleteRunProgress | null;
    registrationEditable: boolean;
    isOnline: boolean;
}

export function useAthleteRunExerciseNotes({
    sessionId,
    progress,
    registrationEditable,
    isOnline,
}: UseAthleteRunExerciseNotesOptions) {
    const savedMap = useMemo(() => exerciseNotesMapFromProgress(progress), [progress]);
    const [draftBySlot, setDraftBySlot] = useState<Map<number, string>>(() => new Map());
    const [putNote] = usePutAthleteExerciseNoteMutation();

    useEffect(() => {
        setDraftBySlot(new Map(savedMap));
    }, [savedMap]);

    const setDraftForSlot = useCallback((blockExerciseId: number, value: string) => {
        setDraftBySlot((prev) => {
            const next = new Map(prev);
            next.set(blockExerciseId, value);
            return next;
        });
    }, []);

    const getDraftForSlot = useCallback(
        (blockExerciseId: number) => draftBySlot.get(blockExerciseId) ?? "",
        [draftBySlot]
    );

    const persistSlotNote = useCallback(
        async (blockExerciseId: number) => {
            if (!registrationEditable) return;
            const draft = draftBySlot.get(blockExerciseId) ?? "";
            const saved = savedMap.get(blockExerciseId) ?? "";
            const normalizedDraft = draft.trim();
            const normalizedSaved = saved.trim();
            if (normalizedDraft === normalizedSaved) return;

            const payload = buildExerciseNoteUpsertPayload(
                sessionId,
                blockExerciseId,
                normalizedDraft.length > 0 ? normalizedDraft : null
            );

            if (isOnline) {
                await putNote(payload).unwrap();
            } else {
                await queueExerciseNoteLog({
                    sessionId,
                    blockExerciseId,
                    payload,
                });
            }
        },
        [draftBySlot, isOnline, putNote, registrationEditable, savedMap, sessionId]
    );

    const persistSlots = useCallback(
        async (blockExerciseIds: readonly number[]) => {
            for (const id of blockExerciseIds) {
                await persistSlotNote(id);
            }
        },
        [persistSlotNote]
    );

    return {
        exerciseNotesBySlot: draftBySlot,
        savedExerciseNotesBySlot: savedMap,
        setDraftForSlot,
        getDraftForSlot,
        persistSlotNote,
        persistSlots,
        registrationEditable,
    };
}
