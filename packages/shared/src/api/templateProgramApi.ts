/**
 * templateProgramApi.ts — RTK Query for template program (C PR3–PR4).
 *
 * Mirrors periodBlocksApi + weeklyStructureApi URL shape under
 * `/training-plans/templates/{template_id}/program/`.
 */

import { baseApi } from "./baseApi";
import type {
    TemplateAssignPreviewIn,
    TemplateAssignPreviewOut,
    TemplateProgramArchiveResult,
    TemplateProgramBlock,
    TemplateProgramBlockCreate,
    TemplateProgramBlockUpdate,
    TemplateProgramPublishResult,
    TemplateProgramSession,
    TemplateProgramSessionBlocksUpdate,
    TemplateProgramSessionCreate,
    TemplateProgramSessionListItem,
    TemplateProgramSessionUpdate,
    TemplateProgramSummary,
    TemplateProgramValidateResult,
    TemplateProgramWeeklyStructureOut,
    TemplateProgramWeeklyStructureWeekCreate,
} from "../types/templateProgram";
import type { WeeklyStructureWeek } from "../types/weeklyStructure";

const summaryTag = (templateId: number) => ({
    type: "TemplateProgram" as const,
    id: `SUMMARY-${templateId}`,
});

const blocksListTag = (templateId: number) => ({
    type: "TemplateProgramBlock" as const,
    id: `LIST-${templateId}`,
});

const sessionsListTag = (templateId: number) => ({
    type: "TemplateProgramSession" as const,
    id: `LIST-${templateId}`,
});

const wsTag = (templateId: number, blockId: number) => ({
    type: "TemplateProgramWeeklyStructure" as const,
    id: `${templateId}-${blockId}`,
});

export const templateProgramApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTemplateProgramSummary: builder.query<
            TemplateProgramSummary,
            number
        >({
            query: (templateId) => ({
                url: `/training-plans/templates/${templateId}/program/summary`,
                method: "GET",
            }),
            providesTags: (_r, _e, templateId) => [summaryTag(templateId)],
        }),

        getTemplateProgramBlocks: builder.query<TemplateProgramBlock[], number>({
            query: (templateId) => ({
                url: `/training-plans/templates/${templateId}/program/blocks`,
                method: "GET",
            }),
            providesTags: (result, _e, templateId) =>
                result
                    ? [
                          ...result.map(({ id }) => ({
                              type: "TemplateProgramBlock" as const,
                              id,
                          })),
                          blocksListTag(templateId),
                      ]
                    : [blocksListTag(templateId)],
        }),

        createTemplateProgramBlock: builder.mutation<
            TemplateProgramBlock,
            { templateId: number; data: TemplateProgramBlockCreate }
        >({
            query: ({ templateId, data }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_r, _e, { templateId }) => [
                blocksListTag(templateId),
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        updateTemplateProgramBlock: builder.mutation<
            TemplateProgramBlock,
            { templateId: number; blockId: number; data: TemplateProgramBlockUpdate }
        >({
            query: ({ templateId, blockId, data }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks/${blockId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_r, _e, { templateId, blockId }) => [
                { type: "TemplateProgramBlock", id: blockId },
                blocksListTag(templateId),
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        deleteTemplateProgramBlock: builder.mutation<
            void,
            { templateId: number; blockId: number }
        >({
            query: ({ templateId, blockId }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks/${blockId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, { templateId, blockId }) => [
                { type: "TemplateProgramBlock", id: blockId },
                blocksListTag(templateId),
                summaryTag(templateId),
                sessionsListTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        getTemplateProgramWeeklyStructure: builder.query<
            TemplateProgramWeeklyStructureOut,
            { templateId: number; blockId: number }
        >({
            query: ({ templateId, blockId }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks/${blockId}/weekly-structure`,
                method: "GET",
            }),
            providesTags: (_r, _e, arg) => [wsTag(arg.templateId, arg.blockId)],
        }),

        createTemplateProgramWeeklyStructureWeek: builder.mutation<
            WeeklyStructureWeek,
            {
                templateId: number;
                blockId: number;
                body: TemplateProgramWeeklyStructureWeekCreate;
            }
        >({
            query: ({ templateId, blockId, body }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks/${blockId}/weekly-structure/weeks`,
                method: "POST",
                body,
            }),
            invalidatesTags: (_r, _e, arg) => [
                wsTag(arg.templateId, arg.blockId),
                summaryTag(arg.templateId),
            ],
        }),

        updateTemplateProgramWeeklyStructureWeek: builder.mutation<
            WeeklyStructureWeek,
            {
                templateId: number;
                blockId: number;
                weekId: number;
                body: TemplateProgramWeeklyStructureWeekCreate;
            }
        >({
            query: ({ templateId, blockId, weekId, body }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks/${blockId}/weekly-structure/weeks/${weekId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_r, _e, arg) => [
                wsTag(arg.templateId, arg.blockId),
                summaryTag(arg.templateId),
            ],
        }),

        deleteTemplateProgramWeeklyStructureWeek: builder.mutation<
            void,
            { templateId: number; blockId: number; weekId: number }
        >({
            query: ({ templateId, blockId, weekId }) => ({
                url: `/training-plans/templates/${templateId}/program/blocks/${blockId}/weekly-structure/weeks/${weekId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, arg) => [
                wsTag(arg.templateId, arg.blockId),
                summaryTag(arg.templateId),
            ],
        }),

        getTemplateProgramSessions: builder.query<
            TemplateProgramSessionListItem[],
            { templateId: number; blockId?: number }
        >({
            query: ({ templateId, blockId }) => ({
                url: `/training-plans/templates/${templateId}/program/sessions`,
                method: "GET",
                params: blockId != null ? { block_id: blockId } : undefined,
            }),
            providesTags: (_r, _e, { templateId }) => [sessionsListTag(templateId)],
        }),

        getTemplateProgramSession: builder.query<
            TemplateProgramSession,
            { templateId: number; sessionId: number }
        >({
            query: ({ templateId, sessionId }) => ({
                url: `/training-plans/templates/${templateId}/program/sessions/${sessionId}`,
                method: "GET",
            }),
            providesTags: (_r, _e, { sessionId }) => [
                { type: "TemplateProgramSession", id: sessionId },
            ],
        }),

        createTemplateProgramSession: builder.mutation<
            TemplateProgramSession,
            { templateId: number; data: TemplateProgramSessionCreate }
        >({
            query: ({ templateId, data }) => ({
                url: `/training-plans/templates/${templateId}/program/sessions`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_r, _e, { templateId }) => [
                sessionsListTag(templateId),
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        updateTemplateProgramSession: builder.mutation<
            TemplateProgramSession,
            {
                templateId: number;
                sessionId: number;
                data: TemplateProgramSessionUpdate;
            }
        >({
            query: ({ templateId, sessionId, data }) => ({
                url: `/training-plans/templates/${templateId}/program/sessions/${sessionId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_r, _e, { templateId, sessionId }) => [
                { type: "TemplateProgramSession", id: sessionId },
                sessionsListTag(templateId),
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        deleteTemplateProgramSession: builder.mutation<
            void,
            { templateId: number; sessionId: number }
        >({
            query: ({ templateId, sessionId }) => ({
                url: `/training-plans/templates/${templateId}/program/sessions/${sessionId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_r, _e, { templateId, sessionId }) => [
                { type: "TemplateProgramSession", id: sessionId },
                sessionsListTag(templateId),
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        replaceTemplateProgramSessionBlocks: builder.mutation<
            TemplateProgramSession,
            {
                templateId: number;
                sessionId: number;
                data: TemplateProgramSessionBlocksUpdate;
            }
        >({
            query: ({ templateId, sessionId, data }) => ({
                url: `/training-plans/templates/${templateId}/program/sessions/${sessionId}/blocks`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_r, _e, { templateId, sessionId }) => [
                { type: "TemplateProgramSession", id: sessionId },
                sessionsListTag(templateId),
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        validateTemplateProgram: builder.mutation<
            TemplateProgramValidateResult,
            number
        >({
            query: (templateId) => ({
                url: `/training-plans/templates/${templateId}/program/validate`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, templateId) => [
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        publishTemplateProgram: builder.mutation<
            TemplateProgramPublishResult,
            number
        >({
            query: (templateId) => ({
                url: `/training-plans/templates/${templateId}/program/publish`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, templateId) => [
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        archiveTemplateProgram: builder.mutation<
            TemplateProgramArchiveResult,
            number
        >({
            query: (templateId) => ({
                url: `/training-plans/templates/${templateId}/program/archive`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, templateId) => [
                summaryTag(templateId),
                { type: "TrainingPlanTemplate", id: templateId },
            ],
        }),

        previewTemplateProgramAssign: builder.mutation<
            TemplateAssignPreviewOut,
            { templateId: number; data: TemplateAssignPreviewIn }
        >({
            query: ({ templateId, data }) => ({
                url: `/training-plans/templates/${templateId}/program/assign-preview`,
                method: "POST",
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetTemplateProgramSummaryQuery,
    useGetTemplateProgramBlocksQuery,
    useCreateTemplateProgramBlockMutation,
    useUpdateTemplateProgramBlockMutation,
    useDeleteTemplateProgramBlockMutation,
    useGetTemplateProgramWeeklyStructureQuery,
    useCreateTemplateProgramWeeklyStructureWeekMutation,
    useUpdateTemplateProgramWeeklyStructureWeekMutation,
    useDeleteTemplateProgramWeeklyStructureWeekMutation,
    useGetTemplateProgramSessionsQuery,
    useGetTemplateProgramSessionQuery,
    useCreateTemplateProgramSessionMutation,
    useUpdateTemplateProgramSessionMutation,
    useDeleteTemplateProgramSessionMutation,
    useReplaceTemplateProgramSessionBlocksMutation,
    useValidateTemplateProgramMutation,
    usePublishTemplateProgramMutation,
    useArchiveTemplateProgramMutation,
    usePreviewTemplateProgramAssignMutation,
} = templateProgramApi;
