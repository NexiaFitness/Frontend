/**
 * useWellbeingCheckIn.ts — Pre-session wellbeing triage (F2 / B7).
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { useCallback } from "react";
import { useSubmitWellbeingCheckInMutation } from "@nexia/shared/api/trainingSessionsApi";

export type WellbeingLevel = 1 | 2 | 3;

export type WellbeingSubmitResult = "saved" | "failed";

export function useWellbeingCheckIn(sessionId: number) {
    const [submitMutation, { isLoading }] = useSubmitWellbeingCheckInMutation();

    const submit = useCallback(
        async (level: WellbeingLevel): Promise<WellbeingSubmitResult> => {
            try {
                await submitMutation({
                    sessionId,
                    body: { pre_fatigue_level: level },
                }).unwrap();
                return "saved";
            } catch {
                return "failed";
            }
        },
        [sessionId, submitMutation]
    );

    return { submit, isLoading };
}
