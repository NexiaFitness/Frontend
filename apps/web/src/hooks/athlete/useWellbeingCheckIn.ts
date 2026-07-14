/**
 * useWellbeingCheckIn.ts — Pre-session wellbeing triage (F2).
 */

import { useCallback } from "react";
import { useSubmitWellbeingCheckInMutation } from "@nexia/shared/api/trainingSessionsApi";

export type WellbeingLevel = 1 | 2 | 3;

export function useWellbeingCheckIn(sessionId: number) {
    const [submitMutation, { isLoading }] = useSubmitWellbeingCheckInMutation();

    const submit = useCallback(
        async (level: WellbeingLevel) => {
            await submitMutation({
                sessionId,
                body: { pre_fatigue_level: level },
            }).unwrap();
        },
        [sessionId, submitMutation]
    );

    return { submit, isLoading };
}
