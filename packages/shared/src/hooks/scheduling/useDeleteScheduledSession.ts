/**
 * useDeleteScheduledSession.ts — Hook para eliminar/cancelar sesión agendada
 *
 * Contexto:
 * - Encapsula la lógica de eliminación de sesiones agendadas
 * - Maneja errores con try-catch
 * - Invalida cache automáticamente
 *
 * Uso:
 * ```tsx
 * const { deleteSession, isDeleting, isError, error } = useDeleteScheduledSession();
 * 
 * await deleteSession(1);
 * ```
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import { useCallback } from "react";
import { useDeleteScheduledSessionMutation } from "../../api/schedulingApi";

interface UseDeleteScheduledSessionResult {
    deleteSession: (sessionId: number) => Promise<void>;
    isDeleting: boolean;
    isError: boolean;
    error: unknown;
}

export const useDeleteScheduledSession = (): UseDeleteScheduledSessionResult => {
    const [deleteMutation, { isLoading: isDeleting, isError, error }] =
        useDeleteScheduledSessionMutation();

    const deleteSession = useCallback(
        async (sessionId: number): Promise<void> => {
            try {
                await deleteMutation(sessionId).unwrap();
            } catch (err) {
                console.error("Error eliminando sesión agendada:", err);
                throw err;
            }
        },
        [deleteMutation]
    );

    return {
        deleteSession,
        isDeleting,
        isError,
        error,
    };
};

