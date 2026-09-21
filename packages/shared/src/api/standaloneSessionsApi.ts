/**
 * standaloneSessionsApi.ts — API para sesiones sin plan (StandaloneSession)
 *
 * Contexto:
 * - Usado cuando el cliente no tiene plan activo en la fecha (P2)
 * - Endpoints: POST/GET /standalone-sessions, POST /standalone-sessions/{id}/exercises
 * - Tags compartidos con Client SESSIONS para invalidación unificada del listado
 *
 * @author Frontend Team
 * @since P2 — Plan integración flujo planificación UX
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { baseApi } from "./baseApi";
import type {
    StandaloneSessionCreate,
    StandaloneSessionOut,
    StandaloneSessionUpdate,
    StandaloneSessionExerciseCreate,
    StandaloneSessionExerciseOut,
    StandaloneSessionExerciseUpdate,
    StandaloneSessionFeedbackOut,
} from "../types/standaloneSessions";

function standaloneListInvalidationTags(body: {
    client_id: number;
    trainer_id: number;
}) {
    return [
        { type: "Client" as const, id: `SESSIONS-${body.client_id}` },
        { type: "TrainingSession" as const, id: `LIST_${body.trainer_id}` },
    ];
}

function standaloneMutationInvalidationTags(session: StandaloneSessionOut) {
    return [
        { type: "StandaloneSession" as const, id: session.id },
        { type: "Client" as const, id: `SESSIONS-${session.client_id}` },
        { type: "TrainingSession" as const, id: `LIST_${session.trainer_id}` },
    ];
}

export const standaloneSessionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * GET /standalone-sessions/?client_id={id}
         * Listar sesiones standalone del cliente
         */
        getStandaloneSessionsByClient: builder.query<
            StandaloneSessionOut[],
            { clientId: number; skip?: number; limit?: number }
        >({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: "/standalone-sessions/",
                params: { client_id: clientId, skip, limit },
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `SESSIONS-${clientId}` },
            ],
        }),

        getStandaloneSession: builder.query<StandaloneSessionOut, number>({
            query: (sessionId) => ({
                url: `/standalone-sessions/${sessionId}`,
            }),
            providesTags: (result, error, sessionId) => [
                { type: "StandaloneSession", id: sessionId },
            ],
        }),

        getStandaloneSessionExercises: builder.query<
            StandaloneSessionExerciseOut[],
            number
        >({
            query: (sessionId) => ({
                url: `/standalone-sessions/${sessionId}/exercises`,
            }),
            providesTags: (result, error, sessionId) => [
                { type: "StandaloneSession", id: sessionId },
            ],
        }),

        /**
         * GET /standalone-sessions/{session_id}/feedback
         * 404 cuando el cliente aún no ha enviado feedback → data null (D-H2).
         */
        getStandaloneSessionFeedback: builder.query<
            StandaloneSessionFeedbackOut | null,
            number
        >({
            queryFn: async (sessionId, _api, _extra, baseQuery) => {
                const result = await baseQuery({
                    url: `/standalone-sessions/${sessionId}/feedback`,
                    method: "GET",
                });
                if (
                    result.error &&
                    "status" in result.error &&
                    result.error.status === 404
                ) {
                    return { data: null };
                }
                if (result.error) {
                    return { error: result.error as FetchBaseQueryError };
                }
                return { data: result.data as StandaloneSessionFeedbackOut };
            },
            providesTags: (result, error, sessionId) => [
                { type: "StandaloneSession", id: sessionId },
                { type: "StandaloneSession", id: `FEEDBACK-${sessionId}` },
            ],
        }),

        /**
         * POST /standalone-sessions/
         * Crear sesión standalone
         */
        createStandaloneSession: builder.mutation<
            StandaloneSessionOut,
            StandaloneSessionCreate
        >({
            query: (body) => ({
                url: "/standalone-sessions/",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, body) =>
                result ? standaloneListInvalidationTags(body) : [],
        }),

        updateStandaloneSession: builder.mutation<
            StandaloneSessionOut,
            { sessionId: number; body: StandaloneSessionUpdate }
        >({
            query: ({ sessionId, body }) => ({
                url: `/standalone-sessions/${sessionId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result) => (result ? standaloneMutationInvalidationTags(result) : []),
        }),

        deleteStandaloneSession: builder.mutation<
            { message: string },
            { sessionId: number; clientId: number; trainerId: number }
        >({
            query: ({ sessionId }) => ({
                url: `/standalone-sessions/${sessionId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { sessionId, clientId, trainerId }) => [
                { type: "StandaloneSession", id: sessionId },
                { type: "Client", id: `SESSIONS-${clientId}` },
                { type: "TrainingSession", id: `LIST_${trainerId}` },
            ],
        }),

        /**
         * POST /standalone-sessions/{session_id}/exercises
         * Añadir ejercicio a sesión standalone
         */
        createStandaloneSessionExercise: builder.mutation<
            StandaloneSessionExerciseOut,
            {
                sessionId: number;
                clientId: number;
                data: Omit<StandaloneSessionExerciseCreate, "standalone_session_id">;
            }
        >({
            query: ({ sessionId, data }) => ({
                url: `/standalone-sessions/${sessionId}/exercises`,
                method: "POST",
                body: { ...data, standalone_session_id: sessionId },
            }),
            invalidatesTags: (_result, _error, { sessionId, clientId }) => [
                { type: "StandaloneSession", id: sessionId },
                { type: "Client", id: `SESSIONS-${clientId}` },
            ],
        }),

        updateStandaloneSessionExercise: builder.mutation<
            StandaloneSessionExerciseOut,
            {
                exerciseId: number;
                sessionId: number;
                clientId: number;
                body: StandaloneSessionExerciseUpdate;
            }
        >({
            query: ({ exerciseId, body }) => ({
                url: `/standalone-sessions/exercises/${exerciseId}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { sessionId, clientId }) => [
                { type: "StandaloneSession", id: sessionId },
                { type: "Client", id: `SESSIONS-${clientId}` },
            ],
        }),

        deleteStandaloneSessionExercise: builder.mutation<
            { message: string },
            { exerciseId: number; sessionId: number; clientId: number }
        >({
            query: ({ exerciseId }) => ({
                url: `/standalone-sessions/exercises/${exerciseId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { sessionId, clientId }) => [
                { type: "StandaloneSession", id: sessionId },
                { type: "Client", id: `SESSIONS-${clientId}` },
            ],
        }),
    }),
});

export const {
    useGetStandaloneSessionsByClientQuery,
    useGetStandaloneSessionQuery,
    useGetStandaloneSessionExercisesQuery,
    useGetStandaloneSessionFeedbackQuery,
    useCreateStandaloneSessionMutation,
    useCreateStandaloneSessionExerciseMutation,
    useUpdateStandaloneSessionExerciseMutation,
    useDeleteStandaloneSessionExerciseMutation,
    useUpdateStandaloneSessionMutation,
    useDeleteStandaloneSessionMutation,
} = standaloneSessionsApi;
