/**
 * useCreateSession.ts — Hook para crear sesión manual
 *
 * Contexto:
 * - Encapsula lógica de crear sesión manualmente
 * - Maneja validaciones y transformaciones
 * - Sin dependencias de UI
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import { useCallback } from "react";
import { useCreateTrainingSessionMutation } from "../../api/sessionProgrammingApi";
import type { TrainingSessionCreate } from "../../types/sessionProgramming";

interface UseCreateSessionParams {
    clientId: number;
    trainerId: number;
}

interface CreateSessionFormData {
    sessionName: string;
    sessionDate: string; // ISO date YYYY-MM-DD
    sessionType: string;
    plannedDuration?: number | null;
    plannedIntensity?: number | null;
    plannedVolume?: number | null;
    microcycleId?: number;
    notes?: string | null;
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
            const sessionData: TrainingSessionCreate = {
                microcycle_id: data.microcycleId || 0,
                client_id: clientId,
                trainer_id: trainerId,
                session_date: data.sessionDate,
                session_name: data.sessionName,
                session_type: data.sessionType,
                planned_duration: data.plannedDuration,
                planned_intensity: data.plannedIntensity,
                planned_volume: data.plannedVolume,
                status: "planned",
                notes: data.notes,
            };

            await createMutation(sessionData).unwrap();
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

