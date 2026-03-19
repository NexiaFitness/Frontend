/**
 * useUpdateClientProgress.ts — Hook para actualizar registros de progreso
 * 
 * Responsabilidades:
 * - Validar datos antes de enviar
 * - Manejar estados de loading/error/success
 * - Wrapper sobre useUpdateProgressRecordMutation
 * 
 * Contexto:
 * - Backend calcula IMC automáticamente
 * - Altura debe venir en centímetros (100-250 cm)
 * 
 * Separación de responsabilidades:
 * - useClientProgress: READ operations (queries + transformación)
 * - useCreateClientProgress: CREATE operations (ya existe)
 * - useUpdateClientProgress: UPDATE operations (este archivo)
 * 
 * Uso:
 * ```tsx
 * const { updateProgressRecord, isLoading, error } = useUpdateClientProgress({ clientId });
 * 
 * await updateProgressRecord(progressId, {
 *     peso: 75.5,
 *     altura: 175, // centímetros (100-250)
 *     notas: "Actualización"
 * });
 * ```
 * 
 * @author Frontend Team
 * @since v4.4.0
 * @updated v4.5.0 - Eliminado cálculo de IMC (backend lo hace)
 */

import { useCallback } from "react";
import { useUpdateProgressRecordMutation } from "../../api/clientsApi";
import type { UpdateClientProgressData } from "../../types/progress";

interface UseUpdateClientProgressOptions {
    clientId: number;
}

interface UseUpdateClientProgressResult {
    updateProgressRecord: (
        progressId: number,
        data: UpdateClientProgressData
    ) => Promise<void>;
    isLoading: boolean;
    error: unknown;
    isSuccess: boolean;
}

/**
 * Hook para actualizar registros de progreso existentes
 * 
 * Features:
 * - Wrapper sobre RTK Query mutation
 * - Estados de loading/error/success
 * - Invalidación automática de cache (PROGRESS + ANALYTICS)
 * - Re-throw de errores para manejo en componente
 * - El backend calcula el IMC automáticamente
 * 
 * Invalidación de cache:
 * - PROGRESS-{clientId}: Lista de registros
 * - ANALYTICS-{clientId}: Tendencias y métricas
 * 
 * @param options - { clientId } para logs y debugging
 * @returns Hook result con función de actualización y estados
 */
export const useUpdateClientProgress = (
    options: UseUpdateClientProgressOptions
): UseUpdateClientProgressResult => {
    const { clientId } = options;
    
    const [updateMutation, { isLoading, error, isSuccess }] =
        useUpdateProgressRecordMutation();

    const updateProgressRecord = useCallback(
        async (
            progressId: number,
            data: UpdateClientProgressData
        ): Promise<void> => {
            try {
                // Enviar datos directamente al backend (el backend calcula el IMC automáticamente)
                await updateMutation({
                    progressId,
                    data: {
                        ...data,
                        // No incluir imc - el backend lo calcula automáticamente
                    },
                }).unwrap();

                console.log(
                    `✅ Progress record ${progressId} updated successfully (client: ${clientId})`
                );
            } catch (err) {
                console.error(
                    `❌ Error updating progress record ${progressId}:`,
                    err
                );
                throw err; // Re-throw para que el componente pueda manejarlo
            }
        },
        [updateMutation, clientId]
    );

    return {
        updateProgressRecord,
        isLoading,
        error,
        isSuccess,
    };
};