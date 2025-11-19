/**
 * useCreateTestResult.ts — Hook para crear resultado de test físico
 *
 * Contexto:
 * - Encapsula lógica de creación de resultados de tests
 * - Usa RTK Query mutation
 * - Maneja estados de carga y error
 *
 * @author Frontend Team
 * @since v5.5.0
 */

import { useCallback } from "react";
import { useCreateTestResultMutation } from "../../api/clientsApi";
import type { CreateTestResultData } from "../../types/testing";

interface UseCreateTestResultReturn {
    createTestResult: (data: CreateTestResultData) => Promise<void>;
    isSubmitting: boolean;
    error: unknown;
}

/**
 * Hook para crear un resultado de test físico
 */
export const useCreateTestResult = (): UseCreateTestResultReturn => {
    const [createMutation, { isLoading: isSubmitting, error }] = useCreateTestResultMutation();

    const createTestResult = useCallback(
        async (data: CreateTestResultData): Promise<void> => {
            try {
                await createMutation(data).unwrap();
            } catch (err) {
                console.error("Error creating test result:", err);
                throw err;
            }
        },
        [createMutation]
    );

    return {
        createTestResult,
        isSubmitting,
        error,
    };
};


