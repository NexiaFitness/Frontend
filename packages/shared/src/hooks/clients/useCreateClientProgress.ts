/**
 * useCreateClientProgress.ts — Hook para crear registros de progreso del cliente
 *
 * Contexto:
 * - Encapsula la lógica de creación de registros de progreso
 * - Maneja errores, loading y refresh automático de cache
 * - Confía en invalidación de tags de RTK Query para actualizar datos automáticamente
 *
 * Uso:
 * ```tsx
 * const { createProgressRecord, isLoading, error, isSuccess } = useCreateClientProgress(clientId);
 *
 * await createProgressRecord({
 *   fecha_registro: "2025-01-15",
 *   peso: 68.0,
 *   altura: 1.65,
 *   notas: "Registro inicial"
 * });
 * ```
 *
 * IMPORTANTE: No hace refetch manual. RTK Query invalida automáticamente
 * los tags "PROGRESS-{clientId}" y "ANALYTICS-{clientId}" después de crear,
 * lo que causa que todas las queries activas que usan esos tags se re-ejecuten
 * automáticamente (ej: useClientProgress en ClientProgressTab).
 *
 * @author Frontend Team
 * @since v4.3.0
 * @updated v4.4.0 - Eliminado refetch manual, confía en invalidación de tags
 */

import { useCallback } from "react";
import { useCreateProgressRecordMutation } from "../../api/clientsApi";
import type { CreateClientProgressData } from "../../types/progress";

interface UseCreateClientProgressResult {
    createProgressRecord: (data: Omit<CreateClientProgressData, "client_id">) => Promise<void>;
    isLoading: boolean;
    error: unknown | undefined;
    isSuccess: boolean;
}

/**
 * Hook para crear registros de progreso del cliente
 *
 * IMPORTANTE: No hace refetch manual. RTK Query invalida automáticamente
 * los tags "PROGRESS-{clientId}" y "ANALYTICS-{clientId}", lo que causa
 * que todas las queries activas que usan esos tags se re-ejecuten automáticamente.
 *
 * @param clientId - ID del cliente
 * @returns Objeto con función de creación y estados
 */
export const useCreateClientProgress = (clientId: number): UseCreateClientProgressResult => {
    const [createMutation, { isLoading, error, isSuccess }] = useCreateProgressRecordMutation();

    const createProgressRecord = useCallback(
        async (data: Omit<CreateClientProgressData, "client_id">) => {
            try {
                await createMutation({
                    ...data,
                    client_id: clientId,
                }).unwrap();

                // NO hacer refetch manual - RTK Query invalida automáticamente los tags:
                // - "PROGRESS-{clientId}" → re-ejecuta getClientProgressHistory
                // - "ANALYTICS-{clientId}" → re-ejecuta getProgressAnalytics
                // Las queries activas (en ClientProgressTab) se actualizarán automáticamente
            } catch (err) {
                // El error se maneja en el estado del hook
                throw err;
            }
        },
        [clientId, createMutation]
    );

    return {
        createProgressRecord,
        isLoading,
        error,
        isSuccess,
    };
};

