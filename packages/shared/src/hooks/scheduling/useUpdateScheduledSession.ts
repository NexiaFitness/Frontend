/**
 * useUpdateScheduledSession.ts — Hook para actualizar sesión agendada
 *
 * Contexto:
 * - Encapsula la lógica de actualización de sesiones agendadas
 * - Maneja errores con try-catch
 * - Invalida cache automáticamente
 *
 * Uso:
 * ```tsx
 * const { updateSession, isUpdating, isError, error } = useUpdateScheduledSession();
 * 
 * await updateSession(1, { status: 'confirmed' });
 * ```
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import { useCallback } from "react";
import { useUpdateScheduledSessionMutation } from "../../api/schedulingApi";
import type { ScheduledSession, ScheduledSessionUpdate } from "../../types/scheduling";

interface UseUpdateScheduledSessionResult {
    updateSession: (sessionId: number, data: ScheduledSessionUpdate) => Promise<ScheduledSession>;
    isUpdating: boolean;
    isError: boolean;
    error: unknown;
}

export const useUpdateScheduledSession = (): UseUpdateScheduledSessionResult => {
    const [updateMutation, { isLoading: isUpdating, isError, error }] =
        useUpdateScheduledSessionMutation();

    const updateSession = useCallback(
        async (sessionId: number, data: ScheduledSessionUpdate): Promise<ScheduledSession> => {
            try {
                const result = await updateMutation({ sessionId, data }).unwrap();
                return result;
            } catch (err) {
                console.error("Error actualizando sesión agendada:", err);
                throw err;
            }
        },
        [updateMutation]
    );

    return {
        updateSession,
        isUpdating,
        isError,
        error,
    };
};

