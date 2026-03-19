/**
 * usePlanningCalendar.ts — Hook para calendario del mes (Fase 3)
 *
 * Devuelve lista de ResolvedDayPlan (un elemento por día del mes).
 * No implementa grid ni navegación; eso vive en web (SessionCalendar).
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 3
 */

import { useGetPlanningCalendarQuery } from "../../api/planningApi";
import type { ResolvedDayPlan } from "../../types/planningCargas";

interface UsePlanningCalendarParams {
    clientId: number | null | undefined;
    month: string | null | undefined; // YYYY-MM
}

interface UsePlanningCalendarReturn {
    data: ResolvedDayPlan[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
}

/**
 * Obtiene el calendario de planificación para un cliente y mes.
 */
export function usePlanningCalendar({
    clientId,
    month,
}: UsePlanningCalendarParams): UsePlanningCalendarReturn {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetPlanningCalendarQuery(
        { client_id: clientId!, month: month! },
        { skip: !clientId || !month }
    );

    return {
        data: data ?? undefined,
        isLoading,
        isError,
        error,
        refetch,
    };
}
