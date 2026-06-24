/**
 * useCreatePhysicalTest — POST definición evaluación física (Spec 01 F0).
 */

import { useCallback } from "react";
import { useCreatePhysicalTestMutation } from "../../api/clientsApi";
import type { PhysicalTestCreate, PhysicalTestOut } from "../../types/testing";

interface UseCreatePhysicalTestResult {
    createPhysicalTest: (data: PhysicalTestCreate) => Promise<PhysicalTestOut>;
    isLoading: boolean;
    error: unknown | undefined;
    isSuccess: boolean;
}

export function useCreatePhysicalTest(): UseCreatePhysicalTestResult {
    const [createMutation, { isLoading, error, isSuccess }] =
        useCreatePhysicalTestMutation();

    const createPhysicalTest = useCallback(
        async (data: PhysicalTestCreate) => {
            return createMutation(data).unwrap();
        },
        [createMutation],
    );

    return {
        createPhysicalTest,
        isLoading,
        error,
        isSuccess,
    };
}
