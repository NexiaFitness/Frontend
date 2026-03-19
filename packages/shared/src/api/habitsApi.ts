/**
 * habitsApi.ts — API RTK Query para Habits Tracker
 *
 * Propósito: Endpoints para insights y checklist de hábitos del cliente (MVP Resumen).
 * Contexto: DEC-02 — sección Hábitos en ClientOverviewTab; backend /api/v1/habits/
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import { baseApi } from "./baseApi";
import type { HabitInsightsOut } from "../types/habits";

export interface GetClientHabitInsightsParams {
    clientId: number;
    start_date?: string;
    end_date?: string;
}

export const habitsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * GET /habits/clients/{client_id}/insights
         * Performance insights: average_completion, best_streak, active_habits, etc.
         */
        getClientHabitInsights: builder.query<HabitInsightsOut, GetClientHabitInsightsParams>({
            query: ({ clientId, start_date, end_date }) => {
                const params = new URLSearchParams();
                if (start_date) params.append("start_date", start_date);
                if (end_date) params.append("end_date", end_date);
                const qs = params.toString();
                return {
                    url: `habits/clients/${clientId}/insights${qs ? `?${qs}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) => [{ type: "HabitInsights", id: clientId }],
        }),
    }),
});

export const { useGetClientHabitInsightsQuery } = habitsApi;
