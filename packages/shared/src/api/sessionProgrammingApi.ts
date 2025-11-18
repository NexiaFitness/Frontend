/**
 * sessionProgrammingApi.ts — API de Session Programming usando RTK Query
 *
 * Contexto:
 * - Endpoints para Session Templates, Training Block Types, Sessions, Blocks
 * - Integrado con sistema RBAC (trainers solo sus propios recursos)
 * - Backend devuelve arrays directos (no wrapper paginado)
 *
 * Endpoints implementados:
 * - Session Templates CRUD
 * - Training Block Types CRUD
 * - Session Blocks CRUD
 * - Session Block Exercises CRUD
 * - Session Summary
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import { baseApi } from "./baseApi";
import type {
    // Training Block Types
    TrainingBlockType,
    TrainingBlockTypeCreate,
    TrainingBlockTypeUpdate,
    // Session Templates
    SessionTemplate,
    SessionTemplateCreate,
    SessionTemplateUpdate,
    // Session Blocks
    SessionBlock,
    SessionBlockCreate,
    SessionBlockUpdate,
    // Session Block Exercises
    SessionBlockExercise,
    SessionBlockExerciseCreate,
    SessionBlockExerciseUpdate,
    // Session Summary
    SessionSummary,
} from "../types/sessionProgramming";

export const sessionProgrammingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========================================
        // TRAINING BLOCK TYPES
        // ========================================

        /**
         * Obtener lista de training block types
         * Backend: GET /api/v1/session-programming/training-block-types
         */
        getTrainingBlockTypes: builder.query<
            TrainingBlockType[],
            { skip?: number; limit?: number }
        >({
            query: ({ skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());

                return {
                    url: `/session-programming/training-block-types?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "TrainingBlockType" as const, id })),
                        { type: "TrainingBlockType", id: "LIST" },
                    ]
                    : [{ type: "TrainingBlockType", id: "LIST" }],
        }),

        /**
         * Obtener training block type específico por ID
         * Backend: GET /api/v1/session-programming/block-types/{block_type_id}
         */
        getTrainingBlockType: builder.query<TrainingBlockType, number>({
            query: (id) => ({
                url: `/session-programming/block-types/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "TrainingBlockType", id }],
        }),

        /**
         * Crear nuevo training block type
         * Backend: POST /api/v1/session-programming/training-block-types
         */
        createTrainingBlockType: builder.mutation<
            TrainingBlockType,
            TrainingBlockTypeCreate
        >({
            query: (blockTypeData) => ({
                url: "/session-programming/training-block-types",
                method: "POST",
                body: blockTypeData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [{ type: "TrainingBlockType", id: "LIST" }],
        }),

        /**
         * Actualizar training block type
         * Backend: PUT /api/v1/session-programming/block-types/{block_type_id}
         */
        updateTrainingBlockType: builder.mutation<
            TrainingBlockType,
            { id: number; data: TrainingBlockTypeUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/session-programming/block-types/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "TrainingBlockType", id },
            ],
        }),

        /**
         * Eliminar training block type
         * Backend: DELETE /api/v1/session-programming/block-types/{block_type_id}
         */
        deleteTrainingBlockType: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/session-programming/block-types/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "TrainingBlockType", id },
                { type: "TrainingBlockType", id: "LIST" },
            ],
        }),

        // ========================================
        // SESSION TEMPLATES
        // ========================================

        /**
         * Obtener lista de session templates
         * Backend: GET /api/v1/session-programming/session-templates
         */
        getSessionTemplates: builder.query<
            SessionTemplate[],
            { skip?: number; limit?: number }
        >({
            query: ({ skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());

                return {
                    url: `/session-programming/session-templates?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "SessionTemplate" as const, id })),
                        { type: "SessionTemplate", id: "LIST" },
                    ]
                    : [{ type: "SessionTemplate", id: "LIST" }],
        }),

        /**
         * Obtener session template específico por ID
         * Backend: GET /api/v1/session-programming/session-templates/{template_id}
         */
        getSessionTemplate: builder.query<SessionTemplate, number>({
            query: (id) => ({
                url: `/session-programming/session-templates/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "SessionTemplate", id }],
        }),

        /**
         * Crear nuevo session template
         * Backend: POST /api/v1/session-programming/session-templates
         */
        createSessionTemplate: builder.mutation<
            SessionTemplate,
            SessionTemplateCreate
        >({
            query: (templateData) => ({
                url: "/session-programming/session-templates",
                method: "POST",
                body: templateData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [{ type: "SessionTemplate", id: "LIST" }],
        }),

        /**
         * Actualizar session template
         * Backend: PUT /api/v1/session-programming/session-templates/{template_id}
         */
        updateSessionTemplate: builder.mutation<
            SessionTemplate,
            { id: number; data: SessionTemplateUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/session-programming/session-templates/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "SessionTemplate", id },
            ],
        }),

        /**
         * Eliminar session template
         * Backend: DELETE /api/v1/session-programming/session-templates/{template_id}
         */
        deleteSessionTemplate: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/session-programming/session-templates/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "SessionTemplate", id },
                { type: "SessionTemplate", id: "LIST" },
            ],
        }),

        /**
         * Incrementar contador de uso de template
         * Backend: POST /api/v1/session-programming/session-templates/{template_id}/use
         */
        useSessionTemplate: builder.mutation<
            { message: string; usage_count: number },
            number
        >({
            query: (id) => ({
                url: `/session-programming/session-templates/${id}/use`,
                method: "POST",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "SessionTemplate", id },
            ],
        }),

        // ========================================
        // SESSION BLOCKS
        // ========================================

        /**
         * Obtener bloques de una sesión
         * Backend: GET /api/v1/session-programming/sessions/{session_id}/blocks
         */
        getSessionBlocks: builder.query<SessionBlock[], number>({
            query: (sessionId) => ({
                url: `/session-programming/sessions/${sessionId}/blocks`,
                method: "GET",
            }),
            providesTags: (result, error, sessionId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "SessionBlock" as const, id })),
                        { type: "SessionBlock", id: `SESSION-${sessionId}` },
                    ]
                    : [{ type: "SessionBlock", id: `SESSION-${sessionId}` }],
        }),

        /**
         * Obtener session block específico por ID
         * Backend: GET /api/v1/session-programming/blocks/{block_id}
         */
        getSessionBlock: builder.query<SessionBlock, number>({
            query: (id) => ({
                url: `/session-programming/blocks/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "SessionBlock", id }],
        }),

        /**
         * Crear nuevo session block
         * Backend: POST /api/v1/session-programming/sessions/{session_id}/blocks
         */
        createSessionBlock: builder.mutation<
            SessionBlock,
            { sessionId: number; data: SessionBlockCreate }
        >({
            query: ({ sessionId, data }) => ({
                url: `/session-programming/sessions/${sessionId}/blocks`,
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { sessionId }) => [
                { type: "SessionBlock", id: `SESSION-${sessionId}` },
            ],
        }),

        /**
         * Actualizar session block
         * Backend: PUT /api/v1/session-programming/blocks/{block_id}
         */
        updateSessionBlock: builder.mutation<
            SessionBlock,
            { id: number; data: SessionBlockUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/session-programming/blocks/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "SessionBlock", id },
            ],
        }),

        /**
         * Eliminar session block
         * Backend: DELETE /api/v1/session-programming/blocks/{block_id}
         */
        deleteSessionBlock: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/session-programming/blocks/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "SessionBlock", id },
            ],
        }),

        // ========================================
        // SESSION BLOCK EXERCISES
        // ========================================

        /**
         * Obtener ejercicios de un bloque
         * Backend: GET /api/v1/session-programming/blocks/{block_id}/exercises
         */
        getSessionBlockExercises: builder.query<SessionBlockExercise[], number>({
            query: (blockId) => ({
                url: `/session-programming/blocks/${blockId}/exercises`,
                method: "GET",
            }),
            providesTags: (result, error, blockId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "SessionBlockExercise" as const, id })),
                        { type: "SessionBlockExercise", id: `BLOCK-${blockId}` },
                    ]
                    : [{ type: "SessionBlockExercise", id: `BLOCK-${blockId}` }],
        }),

        /**
         * Obtener session block exercise específico por ID
         * Backend: GET /api/v1/session-programming/block-exercises/{exercise_id}
         */
        getSessionBlockExercise: builder.query<SessionBlockExercise, number>({
            query: (id) => ({
                url: `/session-programming/block-exercises/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "SessionBlockExercise", id }],
        }),

        /**
         * Crear nuevo session block exercise
         * Backend: POST /api/v1/session-programming/blocks/{block_id}/exercises
         */
        createSessionBlockExercise: builder.mutation<
            SessionBlockExercise,
            { blockId: number; data: SessionBlockExerciseCreate }
        >({
            query: ({ blockId, data }) => ({
                url: `/session-programming/blocks/${blockId}/exercises`,
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { blockId }) => [
                { type: "SessionBlockExercise", id: `BLOCK-${blockId}` },
            ],
        }),

        /**
         * Actualizar session block exercise
         * Backend: PUT /api/v1/session-programming/block-exercises/{exercise_id}
         */
        updateSessionBlockExercise: builder.mutation<
            SessionBlockExercise,
            { id: number; data: SessionBlockExerciseUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/session-programming/block-exercises/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "SessionBlockExercise", id },
            ],
        }),

        /**
         * Eliminar session block exercise
         * Backend: DELETE /api/v1/session-programming/block-exercises/{exercise_id}
         */
        deleteSessionBlockExercise: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/session-programming/block-exercises/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "SessionBlockExercise", id },
            ],
        }),

        // ========================================
        // SESSION SUMMARY
        // ========================================

        /**
         * Obtener resumen de sesión con totales
         * Backend: GET /api/v1/session-programming/sessions/{session_id}/summary
         */
        getSessionSummary: builder.query<SessionSummary, number>({
            query: (sessionId) => ({
                url: `/session-programming/sessions/${sessionId}/summary`,
                method: "GET",
            }),
            providesTags: (result, error, sessionId) => [
                { type: "SessionBlock", id: `SESSION-${sessionId}` },
            ],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    // Training Block Types
    useGetTrainingBlockTypesQuery,
    useGetTrainingBlockTypeQuery,
    useCreateTrainingBlockTypeMutation,
    useUpdateTrainingBlockTypeMutation,
    useDeleteTrainingBlockTypeMutation,

    // Session Templates
    useGetSessionTemplatesQuery,
    useGetSessionTemplateQuery,
    useCreateSessionTemplateMutation,
    useUpdateSessionTemplateMutation,
    useDeleteSessionTemplateMutation,
    useUseSessionTemplateMutation,

    // Session Blocks
    useGetSessionBlocksQuery,
    useGetSessionBlockQuery,
    useCreateSessionBlockMutation,
    useUpdateSessionBlockMutation,
    useDeleteSessionBlockMutation,

    // Session Block Exercises
    useGetSessionBlockExercisesQuery,
    useGetSessionBlockExerciseQuery,
    useCreateSessionBlockExerciseMutation,
    useUpdateSessionBlockExerciseMutation,
    useDeleteSessionBlockExerciseMutation,

    // Session Summary
    useGetSessionSummaryQuery,
} = sessionProgrammingApi;

