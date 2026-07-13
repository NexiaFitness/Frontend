/**
 * useCreateTestEvaluation.ts — Orquestación del flujo registrar evaluación (Spec 01 F1)
 *
 * Contexto:
 * - Combina creación de definición custom + registro de resultado
 * - Sin lógica de UI; delegado desde CreateTestEvaluation.tsx
 */

import { useCallback } from "react";
import { useCreatePhysicalTestMutation, useCreateTestResultMutation } from "../../api/clientsApi";
import type {
    CreateTestResultData,
    PhysicalTestCreate,
    PhysicalTestOut,
    TestCategory,
} from "../../types/testing";

export interface RegisterEvaluationPayload {
    client_id: number;
    trainer_id: number;
    test_id: number;
    test_date: string;
    value: number;
    unit: string;
    is_baseline?: boolean;
    notes?: string | null;
    surface?: string | null;
    conditions?: string | null;
}

export interface CreateCustomTestPayload {
    name: string;
    category: TestCategory;
    unit: string;
    description?: string | null;
    default_frequency_weeks?: number | null;
}

interface UseCreateTestEvaluationReturn {
    registerEvaluation: (payload: RegisterEvaluationPayload) => Promise<void>;
    createCustomTest: (payload: CreateCustomTestPayload) => Promise<PhysicalTestOut>;
    isSubmitting: boolean;
    error: unknown;
}

export const useCreateTestEvaluation = (): UseCreateTestEvaluationReturn => {
    const [createResultMutation, resultState] = useCreateTestResultMutation();
    const [createTestMutation, testState] = useCreatePhysicalTestMutation();

    const registerEvaluation = useCallback(
        async (payload: RegisterEvaluationPayload): Promise<void> => {
            const body: CreateTestResultData = {
                client_id: payload.client_id,
                test_id: payload.test_id,
                trainer_id: payload.trainer_id,
                test_date: payload.test_date,
                value: payload.value,
                unit: payload.unit,
                is_baseline: payload.is_baseline ?? false,
                notes: payload.notes ?? null,
                surface: payload.surface ?? null,
                conditions: payload.conditions ?? null,
            };
            await createResultMutation(body).unwrap();
        },
        [createResultMutation],
    );

    const createCustomTest = useCallback(
        async (payload: CreateCustomTestPayload): Promise<PhysicalTestOut> => {
            const body: PhysicalTestCreate = {
                name: payload.name.trim(),
                category: payload.category,
                unit: payload.unit.trim(),
                description: payload.description ?? null,
                default_frequency_weeks: payload.default_frequency_weeks ?? null,
                is_standard: false,
            };
            return createTestMutation(body).unwrap();
        },
        [createTestMutation],
    );

    return {
        registerEvaluation,
        createCustomTest,
        isSubmitting: resultState.isLoading || testState.isLoading,
        error: resultState.error ?? testState.error,
    };
};
