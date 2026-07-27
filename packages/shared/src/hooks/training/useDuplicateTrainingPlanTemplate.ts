/**
 * useDuplicateTrainingPlanTemplate.ts — Duplicar plantilla (metadata + programa completo).
 *
 * Encapsula POST /training-plans/templates/{id}/duplicate (PR8).
 * Cross-platform: sin dependencias del DOM.
 */

import { useCallback } from "react";
import { useDuplicateTrainingPlanTemplateMutation } from "../../api/trainingPlansApi";
import type { TrainingPlanTemplate } from "../../types/training";

interface UseDuplicateTrainingPlanTemplateReturn {
    duplicateTemplate: (templateId: number) => Promise<TrainingPlanTemplate>;
    isDuplicating: boolean;
    isError: boolean;
    error: unknown;
}

export const useDuplicateTrainingPlanTemplate =
    (): UseDuplicateTrainingPlanTemplateReturn => {
        const [duplicateMutation, { isLoading: isDuplicating, isError, error }] =
            useDuplicateTrainingPlanTemplateMutation();

        const duplicateTemplate = useCallback(
            async (templateId: number): Promise<TrainingPlanTemplate> => {
                return await duplicateMutation(templateId).unwrap();
            },
            [duplicateMutation],
        );

        return {
            duplicateTemplate,
            isDuplicating,
            isError,
            error,
        };
    };
