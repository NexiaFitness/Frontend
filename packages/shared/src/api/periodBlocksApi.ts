import { baseApi } from "./baseApi";
import type {
  PlanPeriodBlock,
  PlanPeriodBlockCreate,
  PlanPeriodBlockUpdate,
} from "../types/planningCargas";

export const periodBlocksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPeriodBlocks: builder.query<PlanPeriodBlock[], number>({
      query: (planId) => ({
        url: `/training-plans/${planId}/period-blocks`,
        method: "GET",
      }),
      providesTags: (result, _error, planId) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "PlanPeriodBlock" as const,
                id,
              })),
              { type: "PlanPeriodBlock", id: `LIST-${planId}` },
            ]
          : [{ type: "PlanPeriodBlock", id: `LIST-${planId}` }],
    }),

    getPeriodBlock: builder.query<
      PlanPeriodBlock,
      { planId: number; blockId: number }
    >({
      query: ({ planId, blockId }) => ({
        url: `/training-plans/${planId}/period-blocks/${blockId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { blockId }) => [
        { type: "PlanPeriodBlock", id: blockId },
      ],
    }),

    createPeriodBlock: builder.mutation<
      PlanPeriodBlock,
      { planId: number; data: PlanPeriodBlockCreate }
    >({
      query: ({ planId, data }) => ({
        url: `/training-plans/${planId}/period-blocks`,
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_result, _error, { planId }) => [
        { type: "PlanPeriodBlock", id: `LIST-${planId}` },
      ],
    }),

    updatePeriodBlock: builder.mutation<
      PlanPeriodBlock,
      { planId: number; blockId: number; data: PlanPeriodBlockUpdate }
    >({
      query: ({ planId, blockId, data }) => ({
        url: `/training-plans/${planId}/period-blocks/${blockId}`,
        method: "PUT",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_result, _error, { planId, blockId }) => [
        { type: "PlanPeriodBlock", id: blockId },
        { type: "PlanPeriodBlock", id: `LIST-${planId}` },
      ],
    }),

    deletePeriodBlock: builder.mutation<
      { message: string },
      { planId: number; blockId: number }
    >({
      query: ({ planId, blockId }) => ({
        url: `/training-plans/${planId}/period-blocks/${blockId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { planId, blockId }) => [
        { type: "PlanPeriodBlock", id: blockId },
        { type: "PlanPeriodBlock", id: `LIST-${planId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPeriodBlocksQuery,
  useGetPeriodBlockQuery,
  useCreatePeriodBlockMutation,
  useUpdatePeriodBlockMutation,
  useDeletePeriodBlockMutation,
} = periodBlocksApi;
