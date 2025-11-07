/**
 * useCreateClientProgress.ts — Hook para crear registros de progreso del cliente
 *
 * Contexto:
 * - Encapsula la lógica de creación de registros de progreso
 * - Maneja errores, loading y refresh automático de cache
 * - Refresca automáticamente los datos de progreso y analytics después de crear
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
 * @author Frontend Team
 * @since v4.3.0
 */

import { useCallback } from "react";
import { useCreateProgressRecordMutation } from "../../api/clientsApi";
import { useGetClientProgressHistoryQuery, useGetProgressAnalyticsQuery } from "../../api/clientsApi";
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
 * @param clientId - ID del cliente
 * @returns Objeto con función de creación y estados
 */
export const useCreateClientProgress = (clientId: number): UseCreateClientProgressResult => {
    const [createMutation, { isLoading, error, isSuccess }] = useCreateProgressRecordMutation();

    // Queries para invalidar cache después de crear
    const { refetch: refetchHistory } = useGetClientProgressHistoryQuery(
        { clientId, skip: 0, limit: 100 },
        { skip: true } // No ejecutar automáticamente, solo para refetch
    );

    const { refetch: refetchAnalytics } = useGetProgressAnalyticsQuery(clientId, {
        skip: true, // No ejecutar automáticamente, solo para refetch
    });

    const createProgressRecord = useCallback(
        async (data: Omit<CreateClientProgressData, "client_id">) => {
            try {
                await createMutation({
                    ...data,
                    client_id: clientId,
                }).unwrap();

                // Refrescar datos después de crear exitosamente
                // RTK Query invalida automáticamente los tags, pero forzamos refetch
                // para asegurar que los datos se actualicen inmediatamente
                await Promise.all([refetchHistory(), refetchAnalytics()]);
            } catch (err) {
                // El error se maneja en el estado del hook
                throw err;
            }
        },
        [clientId, createMutation, refetchHistory, refetchAnalytics]
    );

    return {
        createProgressRecord,
        isLoading,
        error,
        isSuccess,
    };
};

