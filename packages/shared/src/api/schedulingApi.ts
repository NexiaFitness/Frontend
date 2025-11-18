/**
 * schedulingApi.ts — API de agendamiento de sesiones usando RTK Query
 * 
 * Endpoints:
 * - POST /api/v1/scheduling/sessions
 * - GET /api/v1/scheduling/sessions
 * - GET /api/v1/scheduling/sessions/{id}
 * - PUT /api/v1/scheduling/sessions/{id}
 * - DELETE /api/v1/scheduling/sessions/{id}
 * - POST /api/v1/scheduling/check-conflict
 * - POST /api/v1/scheduling/available-slots
 * 
 * @author Frontend Team
 * @since v5.1.0
 */

import { baseApi } from "./baseApi";
import type {
    ScheduledSession,
    ScheduledSessionCreate,
    ScheduledSessionUpdate,
    ScheduledSessionsFilters,
    ConflictCheckRequest,
    ConflictCheckResponse,
    AvailableSlotsRequest,
    AvailableSlotsResponse,
} from "../types/scheduling";

export const schedulingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Crear una sesión agendada
         * Backend: POST /api/v1/scheduling/sessions
         */
        createScheduledSession: builder.mutation<ScheduledSession, ScheduledSessionCreate>({
            query: (sessionData) => ({
                url: "/scheduling/sessions",
                method: "POST",
                body: sessionData,
            }),
            invalidatesTags: ["ScheduledSession"],
        }),

        /**
         * Listar sesiones agendadas con filtros
         * Backend: GET /api/v1/scheduling/sessions
         */
        getScheduledSessions: builder.query<ScheduledSession[], ScheduledSessionsFilters>({
            query: (filters = {}) => {
                const params = new URLSearchParams();
                
                if (filters.trainer_id) {
                    params.append("trainer_id", filters.trainer_id.toString());
                }
                if (filters.client_id) {
                    params.append("client_id", filters.client_id.toString());
                }
                if (filters.start_date) {
                    params.append("start_date", filters.start_date);
                }
                if (filters.end_date) {
                    params.append("end_date", filters.end_date);
                }
                if (filters.skip !== undefined) {
                    params.append("skip", filters.skip.toString());
                }
                if (filters.limit !== undefined) {
                    params.append("limit", filters.limit.toString());
                }

                return {
                    url: `/scheduling/sessions?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "ScheduledSession" as const, id })),
                        { type: "ScheduledSession", id: "LIST" },
                    ]
                    : [{ type: "ScheduledSession", id: "LIST" }],
        }),

        /**
         * Obtener una sesión agendada específica
         * Backend: GET /api/v1/scheduling/sessions/{id}
         */
        getScheduledSession: builder.query<ScheduledSession, number>({
            query: (sessionId) => ({
                url: `/scheduling/sessions/${sessionId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, id) => [{ type: "ScheduledSession", id }],
        }),

        /**
         * Actualizar una sesión agendada
         * Backend: PUT /api/v1/scheduling/sessions/{id}
         */
        updateScheduledSession: builder.mutation<ScheduledSession, { sessionId: number; data: ScheduledSessionUpdate }>({
            query: ({ sessionId, data }) => ({
                url: `/scheduling/sessions/${sessionId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (_result, _error, { sessionId }) => [
                { type: "ScheduledSession", id: sessionId },
                { type: "ScheduledSession", id: "LIST" },
            ],
        }),

        /**
         * Eliminar/cancelar una sesión agendada
         * Backend: DELETE /api/v1/scheduling/sessions/{id}
         */
        deleteScheduledSession: builder.mutation<{ message: string }, number>({
            query: (sessionId) => ({
                url: `/scheduling/sessions/${sessionId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: "ScheduledSession", id },
                { type: "ScheduledSession", id: "LIST" },
            ],
        }),

        /**
         * Verificar conflictos de horario
         * Backend: POST /api/v1/scheduling/check-conflict
         */
        checkSchedulingConflict: builder.mutation<ConflictCheckResponse, ConflictCheckRequest>({
            query: (request) => ({
                url: "/scheduling/check-conflict",
                method: "POST",
                body: request,
            }),
        }),

        /**
         * Obtener slots disponibles para un trainer en una fecha
         * Backend: POST /api/v1/scheduling/available-slots
         */
        getAvailableSlots: builder.mutation<AvailableSlotsResponse, AvailableSlotsRequest>({
            query: (request) => ({
                url: "/scheduling/available-slots",
                method: "POST",
                body: request,
            }),
        }),
    }),
});

export const {
    useCreateScheduledSessionMutation,
    useGetScheduledSessionsQuery,
    useGetScheduledSessionQuery,
    useUpdateScheduledSessionMutation,
    useDeleteScheduledSessionMutation,
    useCheckSchedulingConflictMutation,
    useGetAvailableSlotsMutation,
} = schedulingApi;

