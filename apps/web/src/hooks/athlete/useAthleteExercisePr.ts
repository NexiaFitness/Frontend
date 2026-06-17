/**
 * useAthleteExercisePr.ts — Histórico ejercicio para banner PR en run (F2-FE-10).
 */

import { useMemo } from "react";
import { useGetClientExerciseProgressTrackingQuery } from "@nexia/shared/api/clientsApi";
import { checkWeightPersonalRecord } from "@nexia/shared/utils/athlete/athletePrUtils";

export function useAthleteExercisePr(clientId: number | null, exerciseId: number | null) {
    const { data: tracking = [] } = useGetClientExerciseProgressTrackingQuery(
        { clientId: clientId ?? 0, exerciseId: exerciseId ?? 0, limit: 50 },
        { skip: !clientId || !exerciseId }
    );

    const previousMaxWeight = useMemo(() => {
        let max = 0;
        for (const row of tracking) {
            const w = row.max_weight ?? 0;
            if (w > max) max = w;
        }
        return max > 0 ? max : null;
    }, [tracking]);

    const evaluatePr = (weight: number) =>
        checkWeightPersonalRecord(weight, tracking);

    return { tracking, previousMaxWeight, evaluatePr };
}
