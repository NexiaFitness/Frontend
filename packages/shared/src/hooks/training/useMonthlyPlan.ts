/**
 * useMonthlyPlan.ts — Hook para baseline mensual (Plan de cargas Fase 1)
 *
 * Encapsula get/create/update/delete de monthly plans por training plan.
 * Lógica en shared; UI en web.
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 1
 */

import { useCallback } from "react";
import {
    useGetMonthlyPlansQuery,
    useCreateMonthlyPlanMutation,
    useUpdateMonthlyPlanMutation,
    useDeleteMonthlyPlanMutation,
} from "../../api/planningApi";
import type {
    MonthlyPlan,
    MonthlyPlanCreate,
    MonthlyPlanUpdate,
} from "../../types/planningCargas";

interface UseMonthlyPlanParams {
    planId: number;
    month?: string;
}

interface UseMonthlyPlanReturn {
    monthlyPlans: MonthlyPlan[];
    currentMonthPlan: MonthlyPlan | null;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    createMonthlyPlan: (data: MonthlyPlanCreate) => Promise<MonthlyPlan>;
    updateMonthlyPlan: (id: number, data: MonthlyPlanUpdate) => Promise<MonthlyPlan>;
    deleteMonthlyPlan: (id: number) => Promise<void>;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}

/**
 * Hook para gestionar baseline mensual de un training plan.
 */
export function useMonthlyPlan({
    planId,
    month,
}: UseMonthlyPlanParams): UseMonthlyPlanReturn {
    const { data: monthlyPlans = [], isLoading, isError, error } = useGetMonthlyPlansQuery(
        { training_plan_id: planId, month, skip: 0, limit: 100 },
        { skip: !planId }
    );

    const [createMutation, { isLoading: isCreating }] = useCreateMonthlyPlanMutation();
    const [updateMutation, { isLoading: isUpdating }] = useUpdateMonthlyPlanMutation();
    const [deleteMutation, { isLoading: isDeleting }] = useDeleteMonthlyPlanMutation();

    const currentMonthPlan = month
        ? monthlyPlans.find((m) => m.month === month) ?? null
        : null;

    const createMonthlyPlan = useCallback(
        async (data: MonthlyPlanCreate) => {
            const result = await createMutation(data).unwrap();
            return result;
        },
        [createMutation]
    );

    const updateMonthlyPlan = useCallback(
        async (id: number, data: MonthlyPlanUpdate) => {
            const result = await updateMutation({ id, data }).unwrap();
            return result;
        },
        [updateMutation]
    );

    const deleteMonthlyPlan = useCallback(
        async (id: number) => {
            await deleteMutation(id).unwrap();
        },
        [deleteMutation]
    );

    return {
        monthlyPlans,
        currentMonthPlan,
        isLoading,
        isError,
        error,
        createMonthlyPlan,
        updateMonthlyPlan,
        deleteMonthlyPlan,
        isCreating,
        isUpdating,
        isDeleting,
    };
}
