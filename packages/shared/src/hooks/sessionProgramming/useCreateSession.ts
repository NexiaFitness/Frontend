/**
 * useCreateSession.ts — Hook para crear sesión manual
 *
 * Contexto:
 * - Encapsula lógica de crear sesión manualmente (Fase 6: training_plan_id only, no microcycle_id).
 * - Delega en buildTrainingSessionCreate para el payload.
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useCallback } from "react";
import { useCreateTrainingSessionMutation } from "../../api/sessionProgrammingApi";
import { buildTrainingSessionCreate } from "../../utils/sessionProgramming/buildTrainingSessionCreate";
import type { CreateSessionFormData } from "../../types/sessionProgramming";

interface UseCreateSessionParams {
    clientId: number;
    trainerId: number;
}

interface UseCreateSessionResult {
    createSession: (data: CreateSessionFormData) => Promise<void>;
    isCreating: boolean;
    isError: boolean;
    error: unknown;
}

export const useCreateSession = ({
    clientId,
    trainerId,
}: UseCreateSessionParams): UseCreateSessionResult => {
    const [createMutation, { isLoading, isError, error }] = useCreateTrainingSessionMutation();

    const createSession = useCallback(
        async (data: CreateSessionFormData) => {
            const sessionData = buildTrainingSessionCreate({
                formData: data,
                clientId,
                trainerId,
            });

            try {
                await createMutation(sessionData).unwrap();
            } catch (err) {
                console.error("Create session error:", err);
                throw err;
            }
        },
        [createMutation, clientId, trainerId]
    );

    return {
        createSession,
        isCreating: isLoading,
        isError,
        error,
    };
};


