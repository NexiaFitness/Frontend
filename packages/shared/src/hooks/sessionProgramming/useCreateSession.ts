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
    microcycleId: number; // Requerido - el backend lo exige como NOT NULL
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
            // Validar que microcycleId sea obligatorio y válido
            if (data.microcycleId === undefined || data.microcycleId === null) {
                throw new Error(
                    "El microciclo es obligatorio. Por favor, seleccione un microciclo válido."
                );
            }

            const microcycleId = Number(data.microcycleId);
            if (isNaN(microcycleId) || microcycleId <= 0) {
                throw new Error("El microciclo seleccionado no es válido");
            }

            // Construir objeto base requerido
            const sessionDataBase: {
                microcycle_id: number;
                client_id: number;
                trainer_id: number;
                session_date: string;
                session_name: string;
                session_type: string;
                status: string;
            } = {
                microcycle_id: microcycleId,
                client_id: clientId,
                trainer_id: trainerId,
                session_date: data.sessionDate,
                session_name: data.sessionName,
                session_type: data.sessionType,
                status: "planned",
            };

            // Agregar campos opcionales solo si tienen valor (no null/undefined)
            const sessionData: TrainingSessionCreate = {
                ...sessionDataBase,
                ...(data.plannedDuration !== null && data.plannedDuration !== undefined
                    ? { planned_duration: data.plannedDuration }
                    : {}),
                ...(data.plannedIntensity !== null && data.plannedIntensity !== undefined
                    ? { planned_intensity: data.plannedIntensity }
                    : {}),
                ...(data.plannedVolume !== null && data.plannedVolume !== undefined
                    ? { planned_volume: data.plannedVolume }
                    : {}),
                ...(data.notes !== null && data.notes !== undefined && data.notes.trim() !== ""
                    ? { notes: data.notes }
                    : {}),
            };

            // DEBUG: Ver qué se envía al backend
            console.log("=== SENDING TO BACKEND ===");
            console.log("Session Data:", JSON.stringify(sessionData, null, 2));
            console.log("microcycle_id type:", typeof sessionData.microcycle_id);
            console.log("microcycle_id value:", sessionData.microcycle_id);
            console.log("==========================");

            try {
                await createMutation(sessionData).unwrap();
            } catch (error) {
                // DEBUG: Ver el error completo del backend
                console.error("=== BACKEND ERROR ===");
                console.error("Full error:", error);
                if (error && typeof error === "object" && "data" in error) {
                    console.error("Error data:", JSON.stringify((error as { data: unknown }).data, null, 2));
                }
                if (error && typeof error === "object" && "status" in error) {
                    console.error("Error status:", (error as { status: unknown }).status);
                }
                console.error("=====================");
                throw error;
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


