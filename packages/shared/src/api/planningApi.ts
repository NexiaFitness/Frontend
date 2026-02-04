/**
 * planningApi.ts — API de planificación period-based (Plan de cargas Fase 1+2)
 *
 * Endpoints: monthly, weekly, daily overrides, resolve-day
 * Backend: app/api/planning.py
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 1
 * @updated Fase 2 - overrides y resolve_day_plan
 */

import { baseApi } from "./baseApi";
import type {
    MonthlyPlan,
    MonthlyPlanCreate,
    MonthlyPlanUpdate,
    WeeklyOverride,
    WeeklyOverrideCreate,
    DailyOverride,
    DailyOverrideCreate,
    ResolvedDayPlan,
} from "../types/planningCargas";

export interface GetMonthlyPlansParams {
    training_plan_id: number;
    month?: string;
    skip?: number;
    limit?: number;
}

export const planningApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * List monthly plans for a training plan. If month is provided, returns at most one.
         * Backend: GET /api/v1/planning/monthly?training_plan_id=&month=
         */
        getMonthlyPlans: builder.query<MonthlyPlan[], GetMonthlyPlansParams>({
            query: ({ training_plan_id, month, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append("training_plan_id", training_plan_id.toString());
                if (month) params.append("month", month);
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());
                return {
                    url: `/planning/monthly?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, _error, { training_plan_id }) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "MonthlyPlan" as const, id })),
                        { type: "MonthlyPlan", id: `PLAN-${training_plan_id}` },
                    ]
                    : [{ type: "MonthlyPlan", id: `PLAN-${training_plan_id}` }],
        }),

        /**
         * Get a single monthly plan by id.
         * Backend: GET /api/v1/planning/monthly/{id}
         */
        getMonthlyPlan: builder.query<MonthlyPlan, number>({
            query: (id) => ({
                url: `/planning/monthly/${id}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "MonthlyPlan", id }],
        }),

        /**
         * Create a monthly plan baseline.
         * Backend: POST /api/v1/planning/monthly
         */
        createMonthlyPlan: builder.mutation<MonthlyPlan, MonthlyPlanCreate>({
            query: (body) => ({
                url: "/planning/monthly",
                method: "POST",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (_result, _error, body) => [
                { type: "MonthlyPlan", id: `PLAN-${body.training_plan_id}` },
            ],
        }),

        /**
         * Update a monthly plan.
         * Backend: PUT /api/v1/planning/monthly/{id}
         */
        updateMonthlyPlan: builder.mutation<
            MonthlyPlan,
            { id: number; data: MonthlyPlanUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/planning/monthly/${id}`,
                method: "PUT",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: () => [{ type: "MonthlyPlan" }],
        }),

        /**
         * Soft-delete a monthly plan.
         * Backend: DELETE /api/v1/planning/monthly/{id}
         */
        deleteMonthlyPlan: builder.mutation<void, number>({
            query: (id) => ({
                url: `/planning/monthly/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: () => [{ type: "MonthlyPlan" }],
        }),

        // ----- Fase 2: resolve-day -----
        getResolvedDay: builder.query<
            ResolvedDayPlan,
            { client_id: number; date: string }
        >({
            query: ({ client_id, date }) => ({
                url: `/planning/resolve-day/${client_id}/${date}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { client_id, date }) => [
                { type: "MonthlyPlan", id: `RESOLVED-${client_id}-${date}` },
            ],
        }),

        // ----- Fase 2: weekly overrides -----
        getWeeklyOverrides: builder.query<
            WeeklyOverride[],
            { monthly_plan_id: number; skip?: number; limit?: number }
        >({
            query: ({ monthly_plan_id, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append("monthly_plan_id", monthly_plan_id.toString());
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());
                return {
                    url: `/planning/weekly?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (_result, _error, { monthly_plan_id }) => [
                { type: "MonthlyPlan", id: `WEEKLY-${monthly_plan_id}` },
            ],
        }),
        createWeeklyOverride: builder.mutation<WeeklyOverride, WeeklyOverrideCreate>({
            query: (body) => ({
                url: "/planning/weekly",
                method: "POST",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: () => [{ type: "MonthlyPlan" }],
        }),
        deleteWeeklyOverride: builder.mutation<void, number>({
            query: (id) => ({
                url: `/planning/weekly/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: () => [{ type: "MonthlyPlan" }],
        }),

        // ----- Fase 2: daily overrides -----
        getDailyOverrides: builder.query<
            DailyOverride[],
            {
                client_id: number;
                start_date?: string;
                end_date?: string;
                skip?: number;
                limit?: number;
            }
        >({
            query: ({
                client_id,
                start_date,
                end_date,
                skip = 0,
                limit = 100,
            }) => {
                const params = new URLSearchParams();
                params.append("client_id", client_id.toString());
                if (start_date) params.append("start_date", start_date);
                if (end_date) params.append("end_date", end_date);
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());
                return {
                    url: `/planning/daily?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (_result, _error, { client_id }) => [
                { type: "MonthlyPlan", id: `DAILY-${client_id}` },
            ],
        }),
        createDailyOverride: builder.mutation<DailyOverride, DailyOverrideCreate>({
            query: (body) => ({
                url: "/planning/daily",
                method: "POST",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: () => [{ type: "MonthlyPlan" }],
        }),
        deleteDailyOverride: builder.mutation<void, number>({
            query: (id) => ({
                url: `/planning/daily/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: () => [{ type: "MonthlyPlan" }],
        }),
    }),
});

export const {
    useGetMonthlyPlansQuery,
    useGetMonthlyPlanQuery,
    useCreateMonthlyPlanMutation,
    useUpdateMonthlyPlanMutation,
    useDeleteMonthlyPlanMutation,
    useGetResolvedDayQuery,
    useGetWeeklyOverridesQuery,
    useCreateWeeklyOverrideMutation,
    useDeleteWeeklyOverrideMutation,
    useGetDailyOverridesQuery,
    useCreateDailyOverrideMutation,
    useDeleteDailyOverrideMutation,
} = planningApi;
