/**
 * useAssignTemplate.ts — Hook para asignar plantillas a clientes
 *
 * Contexto:
 * - Encapsula lógica de asignación de plantillas a clientes
 * - Maneja creación de instancias desde plantillas
 * - Cross-platform (sin dependencias del DOM)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import { useCallback } from "react";
import {
    useAssignTemplateToClientMutation,
    useAssignPlanToClientMutation,
} from "../../api/trainingPlansApi";
import type {
    TrainingPlanInstance,
    AssignTemplateToClientParams,
    AssignPlanToClientParams,
} from "../../types/training";

interface UseAssignTemplateReturn {
    // Actions
    assignTemplate: (params: AssignTemplateToClientParams & { trainer_id: number }) => Promise<TrainingPlanInstance>;
    assignPlan: (params: AssignPlanToClientParams) => Promise<TrainingPlanInstance>;

    // State
    isAssigning: boolean;
    isError: boolean;
    error: unknown;
}

/**
 * Hook para asignar plantillas o planes a clientes
 */
export const useAssignTemplate = (): UseAssignTemplateReturn => {
    const [assignTemplateMutation, { isLoading: isAssigningTemplate, isError: isErrorTemplate, error: errorTemplate }] =
        useAssignTemplateToClientMutation();
    const [assignPlanMutation, { isLoading: isAssigningPlan, isError: isErrorPlan, error: errorPlan }] =
        useAssignPlanToClientMutation();

    const assignTemplate = useCallback(
        async (params: AssignTemplateToClientParams & { trainer_id: number }): Promise<TrainingPlanInstance> => {
            return await assignTemplateMutation(params).unwrap();
        },
        [assignTemplateMutation]
    );

    const assignPlan = useCallback(
        async (params: AssignPlanToClientParams): Promise<TrainingPlanInstance> => {
            return await assignPlanMutation(params).unwrap();
        },
        [assignPlanMutation]
    );

    return {
        assignTemplate,
        assignPlan,
        isAssigning: isAssigningTemplate || isAssigningPlan,
        isError: isErrorTemplate || isErrorPlan,
        error: errorTemplate || errorPlan,
    };
};

