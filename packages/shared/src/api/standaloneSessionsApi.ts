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

import { baseApi } from "./baseApi";
import type {
    StandaloneSessionCreate,
    StandaloneSessionOut,
    StandaloneSessionExerciseCreate,
    StandaloneSessionExerciseOut,
} from "../types/standaloneSessions";

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
                result
                    ? [{ type: "Client", id: `SESSIONS-${body.client_id}` }]
                    : [],
        }),

        /**
         * POST /standalone-sessions/{session_id}/exercises
         * Añadir ejercicio a sesión standalone
         */
        createStandaloneSessionExercise: builder.mutation<
            unknown,
            { sessionId: number; data: Omit<StandaloneSessionExerciseCreate, "standalone_session_id"> }
        >({
            query: ({ sessionId, data }) => ({
                url: `/standalone-sessions/${sessionId}/exercises`,
                method: "POST",
                body: { ...data, standalone_session_id: sessionId },
            }),
            invalidatesTags: (_result, error, { sessionId }) => [
                { type: "StandaloneSession", id: sessionId },
            ],
        }),
    }),
});

export const {
    useGetStandaloneSessionsByClientQuery,
    useGetStandaloneSessionQuery,
    useGetStandaloneSessionExercisesQuery,
    useCreateStandaloneSessionMutation,
    useCreateStandaloneSessionExerciseMutation,
} = standaloneSessionsApi;
