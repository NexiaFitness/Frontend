/**
 * useUpdateClientProgress.ts — Hook para actualizar registros de progreso
 * 
 * Responsabilidades:
 * - Calcular IMC automáticamente si peso y altura están presentes
 * - Validar datos antes de enviar
 * - Manejar estados de loading/error/success
 * - Wrapper sobre useUpdateProgressRecordMutation
 * 
 * Contexto:
 * - Backend NO calcula IMC en Update (solo en Create)
 * - Frontend DEBE calcularlo explícitamente
 * - Altura ya debe venir en metros desde el componente
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
 *     altura: 1.75, // metros
 *     notas: "Actualización"
 * });
 * ```
 * 
 * @author Frontend Team
 * @since v4.4.0
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
 * Calcular IMC (Índice de Masa Corporal)
 * 
 * Fórmula: IMC = peso (kg) / altura² (m²)
 * 
 * Validación:
 * - Peso y altura deben ser positivos
 * - Altura no puede ser 0 (división por cero)
 * 
 * @param peso - Peso en kilogramos
 * @param altura - Altura en metros (no centímetros)
 * @returns IMC calculado, redondeado a 1 decimal
 * 
 * @example
 * calculateBMI(75, 1.75) // 24.5
 * calculateBMI(80, 1.80) // 24.7
 * calculateBMI(0, 1.75)  // 0 (peso inválido)
 * calculateBMI(75, 0)    // 0 (altura inválida - evita división por cero)
 */
const calculateBMI = (peso: number, altura: number): number => {
    if (!peso || !altura || altura === 0) return 0;
    const bmi = peso / (altura * altura);
    return Math.round(bmi * 10) / 10; // Redondear a 1 decimal
};

/**
 * Hook para actualizar registros de progreso existentes
 * 
 * Features:
 * - Cálculo automático de IMC cuando peso y altura presentes
 * - Wrapper sobre RTK Query mutation
 * - Estados de loading/error/success
 * - Invalidación automática de cache (PROGRESS + ANALYTICS)
 * - Re-throw de errores para manejo en componente
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
                // Preparar datos para enviar
                const updateData: UpdateClientProgressData = { ...data };

                // Calcular IMC si peso y altura están presentes
                if (data.peso && data.altura) {
                    updateData.imc = calculateBMI(data.peso, data.altura);
                    console.log(
                        `📊 IMC calculado: ${updateData.imc} (peso: ${data.peso}kg, altura: ${data.altura}m)`
                    );
                }

                // Enviar mutación
                await updateMutation({
                    progressId,
                    data: updateData,
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