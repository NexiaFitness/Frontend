/**
 * useClientPreview.ts — Hook para obtener preview de cálculos de cliente
 *
 * Contexto:
 * - Llama a POST /clients/preview para obtener valores calculados (BMI y somatotipo)
 * - Se usa en el paso Review antes de crear el cliente
 * - Llamada automática cuando cambian los datos relevantes (peso, altura, medidas antropométricas)
 * - No persiste nada, solo calcula y devuelve valores
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import { useEffect, useMemo, useCallback } from "react";
import { usePreviewClientCalculationsMutation } from "../../api/clientsApi";
import type { ClientFormData } from "../../types/client";
import type { ClientPreviewResponse } from "../../types/client";

export interface UseClientPreviewParams {
    formData: ClientFormData;
    /**
     * Si es true, no hace la llamada automáticamente
     * Útil para llamadas manuales con trigger
     */
    enabled?: boolean;
}

export interface UseClientPreviewResult {
    /**
     * Valores calculados del preview (BMI y somatotipo)
     * null si aún no se ha llamado o si hay error
     */
    preview: ClientPreviewResponse | null;
    /**
     * Estado de carga
     */
    isLoading: boolean;
    /**
     * Error si la llamada falló
     */
    error: unknown;
    /**
     * Función para forzar una nueva llamada manualmente
     */
    refetch: () => void;
}

/**
 * Hook para obtener preview de cálculos de cliente
 *
 * @param params - formData y opciones
 * @returns Preview calculado, estado de carga, error y función refetch
 *
 * @example
 * ```typescript
 * const { preview, isLoading } = useClientPreview({
 *   formData,
 *   enabled: true, // Por defecto true
 * });
 *
 * // Usar valores calculados
 * const bmi = preview?.bmi;
 * const somatotype = preview?.somatotype;
 * ```
 */
export function useClientPreview(
    params: UseClientPreviewParams
): UseClientPreviewResult {
    const { formData, enabled = true } = params;

    const [previewClientCalculations, { data, isLoading, error }] =
        usePreviewClientCalculationsMutation();

    /**
     * Determina si hay datos suficientes para hacer el preview
     * Mínimo: peso y altura (para BMI)
     * Ideal: también medidas antropométricas (para somatotipo)
     */
    const hasMinimumData = useMemo(() => {
        return !!(formData.peso && formData.altura);
    }, [formData.peso, formData.altura]);

    /**
     * Dependencias que deben cambiar para re-calcular
     * Incluye todos los campos relevantes para BMI y somatotipo
     */
    const previewDependencies = useMemo(
        () => ({
            peso: formData.peso,
            altura: formData.altura,
            // Medidas antropométricas para somatotipo
            skinfold_triceps: formData.skinfold_triceps,
            skinfold_subscapular: formData.skinfold_subscapular,
            skinfold_supraspinal: formData.skinfold_supraspinal,
            skinfold_calf: formData.skinfold_calf,
            girth_flexed_contracted_arm: formData.girth_flexed_contracted_arm,
            girth_maximum_calf: formData.girth_maximum_calf,
            diameter_humerus_biepicondylar: formData.diameter_humerus_biepicondylar,
            diameter_femur_bicondylar: formData.diameter_femur_bicondylar,
            // Valores manuales de somatotipo (si existen, no se calculan)
            somatotype_endomorph: formData.somatotype_endomorph,
            somatotype_mesomorph: formData.somatotype_mesomorph,
            somatotype_ectomorph: formData.somatotype_ectomorph,
        }),
        [
            formData.peso,
            formData.altura,
            formData.skinfold_triceps,
            formData.skinfold_subscapular,
            formData.skinfold_supraspinal,
            formData.skinfold_calf,
            formData.girth_flexed_contracted_arm,
            formData.girth_maximum_calf,
            formData.diameter_humerus_biepicondylar,
            formData.diameter_femur_bicondylar,
            formData.somatotype_endomorph,
            formData.somatotype_mesomorph,
            formData.somatotype_ectomorph,
        ]
    );

    /**
     * Función para hacer la llamada al preview
     * Usa useCallback para mantener referencia estable
     */
    const fetchPreview = useCallback(() => {
        if (hasMinimumData) {
            // Excluir confirmEmail (solo validación frontend)
            const { confirmEmail, ...previewData } = formData;
            previewClientCalculations(previewData);
        }
    }, [hasMinimumData, formData, previewClientCalculations]);

    /**
     * Efecto para llamar automáticamente cuando cambian los datos relevantes
     */
    useEffect(() => {
        if (enabled && hasMinimumData) {
            fetchPreview();
        }
    }, [
        enabled,
        hasMinimumData,
        fetchPreview,
        // Dependencias específicas para re-calcular cuando cambian
        previewDependencies.peso,
        previewDependencies.altura,
        previewDependencies.skinfold_triceps,
        previewDependencies.skinfold_subscapular,
        previewDependencies.skinfold_supraspinal,
        previewDependencies.skinfold_calf,
        previewDependencies.girth_flexed_contracted_arm,
        previewDependencies.girth_maximum_calf,
        previewDependencies.diameter_humerus_biepicondylar,
        previewDependencies.diameter_femur_bicondylar,
        previewDependencies.somatotype_endomorph,
        previewDependencies.somatotype_mesomorph,
        previewDependencies.somatotype_ectomorph,
    ]);

    /**
     * Función refetch para llamadas manuales
     */
    const refetch = useCallback(() => {
        fetchPreview();
    }, [fetchPreview]);

    return {
        preview: data ?? null,
        isLoading,
        error: error ?? null,
        refetch,
    };
}

