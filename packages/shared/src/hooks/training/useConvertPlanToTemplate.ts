/**
 * useConvertPlanToTemplate.ts — Hook para convertir planes a plantillas
 *
 * Contexto:
 * - Encapsula lógica de conversión de planes a plantillas reutilizables
 * - Cross-platform (sin dependencias del DOM)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import { useCallback } from "react";
import { useConvertPlanToTemplateMutation } from "../../api/trainingPlansApi";
import type {
    TrainingPlanTemplate,
    ConvertPlanToTemplateParams,
} from "../../types/training";

interface UseConvertPlanToTemplateReturn {
    // Actions
    convertPlan: (params: ConvertPlanToTemplateParams) => Promise<TrainingPlanTemplate>;

    // State
    isConverting: boolean;
    isError: boolean;
    error: unknown;
}

/**
 * Hook para convertir un plan específico a plantilla reutilizable
 */
export const useConvertPlanToTemplate = (): UseConvertPlanToTemplateReturn => {
    const [convertMutation, { isLoading: isConverting, isError, error }] =
        useConvertPlanToTemplateMutation();

    const convertPlan = useCallback(
        async (params: ConvertPlanToTemplateParams): Promise<TrainingPlanTemplate> => {
            return await convertMutation(params).unwrap();
        },
        [convertMutation]
    );

    return {
        convertPlan,
        isConverting,
        isError,
        error,
    };
};

