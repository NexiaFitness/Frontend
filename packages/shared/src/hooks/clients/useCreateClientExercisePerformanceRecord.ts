/**
 * useCreateClientExercisePerformanceRecord — POST PR manual (Spec 02 F3).
 */

import { useCallback } from "react";
import { useCreateClientExercisePerformanceRecordMutation } from "../../api/clientsApi";
import type { ExercisePerformanceRecordCreate } from "../../types/exercisePerformance";

interface UseCreateClientExercisePerformanceRecordResult {
    createPerformanceRecord: (body: ExercisePerformanceRecordCreate) => Promise<void>;
    isLoading: boolean;
    error: unknown | undefined;
    isSuccess: boolean;
}

export function useCreateClientExercisePerformanceRecord(
    clientId: number,
    exerciseId: number,
): UseCreateClientExercisePerformanceRecordResult {
    const [createMutation, { isLoading, error, isSuccess }] =
        useCreateClientExercisePerformanceRecordMutation();

    const createPerformanceRecord = useCallback(
        async (body: ExercisePerformanceRecordCreate) => {
            await createMutation({ clientId, exerciseId, body }).unwrap();
        },
        [clientId, exerciseId, createMutation],
    );

    return {
        createPerformanceRecord,
        isLoading,
        error,
        isSuccess,
    };
}
