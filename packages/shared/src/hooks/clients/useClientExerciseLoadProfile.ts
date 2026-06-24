/**
 * useClientExerciseLoadProfile — RM formal + e1RM estimado por ejercicio (CEO-01).
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

    const hasFormal = Boolean(data?.latest_formal_test);
    const hasEstimated = data?.latest_estimated_1rm_kg != null;
    const isEmpty = !isLoading && !hasFormal && !hasEstimated;

    return {
        profile: data,
        isLoading: isLoading || isFetching,
        error,
        refetch,
        hasFormal,
        hasEstimated,
        isEmpty,
    };
}
