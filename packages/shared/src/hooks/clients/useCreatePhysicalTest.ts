/**
 * useCreatePhysicalTest.ts — Hook para crear definición de evaluación física
 *
 * Contexto:
 * - Encapsula POST /physical-tests/ (Spec 01 F0)
 * - Usado por CreateTestEvaluation para evaluaciones custom del entrenador
 */

import { useCallback } from "react";
import { useCreatePhysicalTestMutation } from "../../api/clientsApi";
import type { PhysicalTestCreate, PhysicalTestOut } from "../../types/testing";

interface UseCreatePhysicalTestReturn {
    createPhysicalTest: (data: PhysicalTestCreate) => Promise<PhysicalTestOut>;
    isSubmitting: boolean;
    error: unknown;
}

export const useCreatePhysicalTest = (): UseCreatePhysicalTestReturn => {
    const [createMutation, { isLoading: isSubmitting, error }] =
        useCreatePhysicalTestMutation();

    const createPhysicalTest = useCallback(
        async (data: PhysicalTestCreate): Promise<PhysicalTestOut> => {
            return createMutation({
                ...data,
                is_standard: data.is_standard ?? false,
            }).unwrap();
        },
        [createMutation],
    );

    return {
        createPhysicalTest,
        isSubmitting,
        error,
    };
};
