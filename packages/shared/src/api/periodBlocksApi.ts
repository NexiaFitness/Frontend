import { baseApi } from "./baseApi";
import type {
  PlanPeriodBlock,
  PlanPeriodBlockCreate,
  PlanPeriodBlockUpdate,
  PlanPeriodBlockWithStructureCreate,
  PlanPeriodBlockWithStructureOut,
  PhaseEvaluationContextList,
  QuickProgramMaterializeCreate,
  QuickProgramMaterializeOut,
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

    getPeriodBlockEvaluationContext: builder.query<
      PhaseEvaluationContextList,
      { planId: number; blockId: number; clientId?: number }
    >({
      query: ({ planId, blockId, clientId }) => ({
        url: `/training-plans/${planId}/period-blocks/${blockId}/evaluation-context`,
        method: "GET",
        params: clientId != null ? { client_id: clientId } : undefined,
      }),
      providesTags: (_result, _error, { blockId }) => [
        { type: "PlanPeriodBlock", id: `EVAL-CTX-${blockId}` },
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

    createPeriodBlockWithStructure: builder.mutation<
      PlanPeriodBlockWithStructureOut,
      { planId: number; data: PlanPeriodBlockWithStructureCreate }
    >({
      query: ({ planId, data }) => ({
        url: `/training-plans/${planId}/period-blocks/with-recurring-structure`,
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, _error, { planId }) => {
        const tags: Array<
          | { type: "PlanPeriodBlock"; id: number | string }
          | { type: "WeeklyStructure"; id: number | string }
        > = [{ type: "PlanPeriodBlock", id: `LIST-${planId}` }];
        const blockId = result?.block?.id;
        if (blockId != null) {
          tags.push({ type: "PlanPeriodBlock", id: blockId });
          tags.push({ type: "WeeklyStructure", id: blockId });
        }
        return tags;
      },
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

    materializeQuickProgram: builder.mutation<
      QuickProgramMaterializeOut,
      { planId: number; data: QuickProgramMaterializeCreate }
    >({
      query: ({ planId, data }) => ({
        url: `/training-plans/${planId}/quick-program/materialize`,
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (result, _error, { planId }) => {
        const tags: Array<
          | { type: "PlanPeriodBlock"; id: number | string }
          | { type: "WeeklyStructure"; id: number | string }
        > = [{ type: "PlanPeriodBlock", id: `LIST-${planId}` }];
        for (const item of result?.blocks ?? []) {
          const blockId = item.block?.id;
          if (blockId != null) {
            tags.push({ type: "PlanPeriodBlock", id: blockId });
            tags.push({ type: "WeeklyStructure", id: blockId });
          }
        }
        return tags;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPeriodBlocksQuery,
  useGetPeriodBlockQuery,
  useGetPeriodBlockEvaluationContextQuery,
  useCreatePeriodBlockMutation,
  useCreatePeriodBlockWithStructureMutation,
  useUpdatePeriodBlockMutation,
  useDeletePeriodBlockMutation,
  useMaterializeQuickProgramMutation,
} = periodBlocksApi;
