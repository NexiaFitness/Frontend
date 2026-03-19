/**
 * useTrainingPlanTemplates.ts — Hook para gestión de plantillas de training plans
 *
 * Contexto:
 * - Encapsula lógica de negocio para plantillas
 * - Maneja queries y mutations de plantillas
 * - Cross-platform (sin dependencias del DOM)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import { useCallback } from "react";
import {
    useGetTrainingPlanTemplatesQuery,
    useGetTrainingPlanTemplateQuery,
    useCreateTrainingPlanTemplateMutation,
    useUpdateTrainingPlanTemplateMutation,
    useDeleteTrainingPlanTemplateMutation,
    useDuplicateTrainingPlanTemplateMutation,
} from "../../api/trainingPlansApi";
import type {
    TrainingPlanTemplate,
    TrainingPlanTemplateCreate,
    TrainingPlanTemplateUpdate,
} from "../../types/training";

interface UseTrainingPlanTemplatesParams {
    trainerId: number;
    category?: string;
    templateId?: number;
}

interface UseTrainingPlanTemplatesReturn {
    // Data
    templates: TrainingPlanTemplate[];
    template: TrainingPlanTemplate | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;

    // Actions
    createTemplate: (data: TrainingPlanTemplateCreate) => Promise<TrainingPlanTemplate>;
    updateTemplate: (id: number, data: TrainingPlanTemplateUpdate) => Promise<TrainingPlanTemplate>;
    deleteTemplate: (id: number) => Promise<void>;
    duplicateTemplate: (id: number) => Promise<TrainingPlanTemplate>;
    refetch: () => void;

    // State
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    isDuplicating: boolean;
}

/**
 * Hook principal para gestión de plantillas de training plans
 */
export const useTrainingPlanTemplates = ({
    trainerId,
    category,
    templateId,
}: UseTrainingPlanTemplatesParams): UseTrainingPlanTemplatesReturn => {
    // Query para lista de plantillas
    const {
        data: templatesData,
        isLoading: isLoadingTemplates,
        isError: isErrorTemplates,
        error: errorTemplates,
        refetch: refetchTemplates,
    } = useGetTrainingPlanTemplatesQuery(
        { trainerId, category },
        { skip: trainerId == null || trainerId <= 0 }
    );

    // Query para plantilla específica
    const {
        data: templateData,
        isLoading: isLoadingTemplate,
        isError: isErrorTemplate,
        error: errorTemplate,
        refetch: refetchTemplate,
    } = useGetTrainingPlanTemplateQuery(templateId!, {
        skip: !templateId,
    });

    // Mutations
    const [createMutation, { isLoading: isCreating }] = useCreateTrainingPlanTemplateMutation();
    const [updateMutation, { isLoading: isUpdating }] = useUpdateTrainingPlanTemplateMutation();
    const [deleteMutation, { isLoading: isDeleting }] = useDeleteTrainingPlanTemplateMutation();
    const [duplicateMutation, { isLoading: isDuplicating }] = useDuplicateTrainingPlanTemplateMutation();

    // Actions
    const createTemplate = useCallback(
        async (data: TrainingPlanTemplateCreate): Promise<TrainingPlanTemplate> => {
            return await createMutation(data).unwrap();
        },
        [createMutation]
    );

    const updateTemplate = useCallback(
        async (id: number, data: TrainingPlanTemplateUpdate): Promise<TrainingPlanTemplate> => {
            return await updateMutation({ id, data }).unwrap();
        },
        [updateMutation]
    );

    const deleteTemplate = useCallback(
        async (id: number): Promise<void> => {
            await deleteMutation(id).unwrap();
        },
        [deleteMutation]
    );

    const duplicateTemplate = useCallback(
        async (id: number): Promise<TrainingPlanTemplate> => {
            return await duplicateMutation(id).unwrap();
        },
        [duplicateMutation]
    );

    const refetch = useCallback(() => {
        refetchTemplates();
        if (templateId) {
            refetchTemplate();
        }
    }, [templateId, refetchTemplates, refetchTemplate]);

    return {
        templates: templatesData || [],
        template: templateData,
        isLoading: isLoadingTemplates || isLoadingTemplate,
        isError: isErrorTemplates || isErrorTemplate,
        error: errorTemplates || errorTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        refetch,
        isCreating,
        isUpdating,
        isDeleting,
        isDuplicating,
    };
};

