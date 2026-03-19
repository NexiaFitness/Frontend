/**
 * useTrainingPlans.ts — Hook para gestión de training plans
 *
 * Contexto:
 * - Encapsula lógica de negocio para training plans
 * - Maneja queries y mutations de planes
 * - Cross-platform (sin dependencias del DOM)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import { useCallback } from "react";
import {
    useGetTrainingPlansQuery,
    useCreateTrainingPlanMutation,
    useUpdateTrainingPlanMutation,
    useDeleteTrainingPlanMutation,
    useGetTrainingPlanQuery,
} from "../../api/trainingPlansApi";
import type {
    TrainingPlan,
    TrainingPlanCreate,
    TrainingPlanUpdate,
    TrainingPlanFilters,
} from "../../types/training";

interface UseTrainingPlansParams {
    filters?: TrainingPlanFilters;
    planId?: number;
}

interface UseTrainingPlansReturn {
    // Data
    plans: TrainingPlan[];
    plan: TrainingPlan | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;

    // Actions
    createPlan: (data: TrainingPlanCreate) => Promise<TrainingPlan>;
    updatePlan: (id: number, data: TrainingPlanUpdate) => Promise<TrainingPlan>;
    deletePlan: (id: number) => Promise<void>;
    refetch: () => void;

    // State
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

/**
 * Hook principal para gestión de training plans
 */
export const useTrainingPlans = ({
    filters,
    planId,
}: UseTrainingPlansParams = {}): UseTrainingPlansReturn => {
    // Query para lista de planes
    const {
        data: plansData,
        isLoading: isLoadingPlans,
        isError: isErrorPlans,
        error: errorPlans,
        refetch: refetchPlans,
    } = useGetTrainingPlansQuery(filters || {}, {
        skip: !filters,
    });

    // Query para plan específico
    const {
        data: planData,
        isLoading: isLoadingPlan,
        isError: isErrorPlan,
        error: errorPlan,
        refetch: refetchPlan,
    } = useGetTrainingPlanQuery(planId!, {
        skip: !planId,
    });

    // Mutations
    const [createMutation, { isLoading: isCreating }] = useCreateTrainingPlanMutation();
    const [updateMutation, { isLoading: isUpdating }] = useUpdateTrainingPlanMutation();
    const [deleteMutation, { isLoading: isDeleting }] = useDeleteTrainingPlanMutation();

    // Actions
    const createPlan = useCallback(
        async (data: TrainingPlanCreate): Promise<TrainingPlan> => {
            return await createMutation(data).unwrap();
        },
        [createMutation]
    );

    const updatePlan = useCallback(
        async (id: number, data: TrainingPlanUpdate): Promise<TrainingPlan> => {
            return await updateMutation({ id, data }).unwrap();
        },
        [updateMutation]
    );

    const deletePlan = useCallback(
        async (id: number): Promise<void> => {
            await deleteMutation(id).unwrap();
        },
        [deleteMutation]
    );

    const refetch = useCallback(() => {
        if (filters) {
            refetchPlans();
        }
        if (planId) {
            refetchPlan();
        }
    }, [filters, planId, refetchPlans, refetchPlan]);

    return {
        plans: plansData || [],
        plan: planData,
        isLoading: isLoadingPlans || isLoadingPlan,
        isError: isErrorPlans || isErrorPlan,
        error: errorPlans || errorPlan,
        createPlan,
        updatePlan,
        deletePlan,
        refetch,
        isCreating,
        isUpdating,
        isDeleting,
    };
};

