/**
 * useClientExerciseLoadProfile — PR + e1RM estimado por ejercicio (Spec 02 v2).
 */

import { useGetClientExerciseLoadProfileQuery } from "../../api/clientsApi";

export interface UseClientExerciseLoadProfileOptions {
    clientId: number | null | undefined;
    exerciseId: number | null | undefined;
    weeks?: number;
}

export function useClientExerciseLoadProfile({
    clientId,
    exerciseId,
    weeks = 12,
}: UseClientExerciseLoadProfileOptions) {
    const resolvedClientId = clientId ?? 0;
    const resolvedExerciseId = exerciseId ?? 0;
    const skip = !clientId || !exerciseId;

    const { data, isLoading, isFetching, error, refetch } =
        useGetClientExerciseLoadProfileQuery(
            {
                clientId: resolvedClientId,
                exerciseId: resolvedExerciseId,
                weeks,
            },
            { skip },
        );

    const hasBestWeight = data?.current_best_weight_kg != null;
    const hasBestE1rm = data?.current_best_e1rm_kg != null;
    const hasEstimated = data?.latest_estimated_1rm_kg != null;
    const isEmpty =
        !isLoading && !hasBestWeight && !hasBestE1rm && !hasEstimated;

    return {
        profile: data,
        isLoading: isLoading || isFetching,
        error,
        refetch,
        hasBestWeight,
        hasBestE1rm,
        hasEstimated,
        isEmpty,
        /** @deprecated Spec 02 v2 — use hasBestWeight */
        hasFormal: hasBestWeight,
        /** @deprecated Spec 02 v2 — removed link model */
        isLinked: false,
    };
}
