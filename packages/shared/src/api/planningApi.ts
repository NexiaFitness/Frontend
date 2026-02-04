/**
 * planningApi.ts — API de planificación period-based (Plan de cargas Fase 1)
 *
 * Endpoints: GET/POST /planning/monthly, GET/PUT/DELETE /planning/monthly/{id}
 * Backend: app/api/planning.py
 *
 * @author Frontend Team
 * @since Plan de cargas Fase 1
 */

import { baseApi } from "./baseApi";
import type {
    MonthlyPlan,
    MonthlyPlanCreate,
    MonthlyPlanUpdate,
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
    }),
});

export const {
    useGetMonthlyPlansQuery,
    useGetMonthlyPlanQuery,
    useCreateMonthlyPlanMutation,
    useUpdateMonthlyPlanMutation,
    useDeleteMonthlyPlanMutation,
} = planningApi;
