/**
 * usePlanningOverrides.ts — Hooks para overrides semanales y diarios (Fase 2)
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 2
 */

import { useCallback } from "react";
import {
    useGetWeeklyOverridesQuery,
    useCreateWeeklyOverrideMutation,
    useDeleteWeeklyOverrideMutation,
    useGetDailyOverridesQuery,
    useCreateDailyOverrideMutation,
    useDeleteDailyOverrideMutation,
} from "../../api/planningApi";
import type {
    WeeklyOverrideCreate,
    DailyOverrideCreate,
} from "../../types/planningCargas";

// ----- Weekly -----
export function useWeeklyOverrides(monthlyPlanId: number | null | undefined) {
    const { data: list = [], isLoading } = useGetWeeklyOverridesQuery(
        { monthly_plan_id: monthlyPlanId!, skip: 0, limit: 100 },
        { skip: !monthlyPlanId }
    );
    const [createMutation, { isLoading: isCreating }] =
        useCreateWeeklyOverrideMutation();
    const [deleteMutation, { isLoading: isDeleting }] =
        useDeleteWeeklyOverrideMutation();

    const create = useCallback(
        async (body: WeeklyOverrideCreate) => {
            return createMutation(body).unwrap();
        },
        [createMutation]
    );
    const remove = useCallback(
        async (id: number) => {
            await deleteMutation(id).unwrap();
        },
        [deleteMutation]
    );

    return {
        weeklyOverrides: list,
        isLoading,
        createWeeklyOverride: create,
        deleteWeeklyOverride: remove,
        isCreating,
        isDeleting,
    };
}

// ----- Daily -----
export function useDailyOverrides(
    clientId: number | null | undefined,
    startDate?: string | null,
    endDate?: string | null
) {
    const { data: list = [], isLoading } = useGetDailyOverridesQuery(
        {
            client_id: clientId!,
            start_date: startDate ?? undefined,
            end_date: endDate ?? undefined,
            skip: 0,
            limit: 100,
        },
        { skip: !clientId }
    );
    const [createMutation, { isLoading: isCreating }] =
        useCreateDailyOverrideMutation();
    const [deleteMutation, { isLoading: isDeleting }] =
        useDeleteDailyOverrideMutation();

    const create = useCallback(
        async (body: DailyOverrideCreate) => {
            return createMutation(body).unwrap();
        },
        [createMutation]
    );
    const remove = useCallback(
        async (id: number) => {
            await deleteMutation(id).unwrap();
        },
        [deleteMutation]
    );

    return {
        dailyOverrides: list,
        isLoading,
        createDailyOverride: create,
        deleteDailyOverride: remove,
        isCreating,
        isDeleting,
    };
}
