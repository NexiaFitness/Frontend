/**
 * Training Sessions API
 * Endpoints para gestión de sesiones de entrenamiento vinculadas a Training Plans
 * 
 * Base URL: /api/v1/training-sessions
 * 
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

import { baseApi } from './baseApi';
import type {
    TrainingSession,
    TrainingSessionCreate,
    TrainingSessionUpdate,
    SessionExercise,
    SessionExerciseCreate,
    SessionCoherence,
} from '../types/trainingSessions';
import type {
    SessionRecommendationsResponse,
    SessionRecommendationsParams,
} from '../types/sessionRecommendations';

export const trainingSessionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * GET /training-sessions/recommendations
         * Obtener recomendaciones ("Hoy toca") para una fecha y cliente
         * Query params: client_id, session_date (YYYY-MM-DD), trainer_id
         */
        getSessionRecommendations: builder.query<
            SessionRecommendationsResponse,
            SessionRecommendationsParams
        >({
            query: ({ client_id, session_date, trainer_id }) => ({
                url: '/training-sessions/recommendations',
                params: { client_id, session_date, trainer_id },
            }),
            providesTags: (_result, _error, { client_id, session_date }) => [
                { type: 'TrainingSession', id: `REC_${client_id}_${session_date}` },
            ],
        }),

        /**
         * GET /training-sessions/?training_plan_id={id}
         * Obtener todas las sesiones de un Training Plan
         */
        getTrainingSessions: builder.query<TrainingSession[], number>({
            query: (trainingPlanId) => ({
                url: '/training-sessions/',
                params: { training_plan_id: trainingPlanId },
            }),
            providesTags: (result, _error, trainingPlanId) => {
                const tags: Array<{ type: 'TrainingSession' | 'TrainingPlan'; id: string | number }> = [];
                if (result) {
                    tags.push(
                        ...result.map(({ id }) => ({ type: 'TrainingSession' as const, id })),
                        { type: 'TrainingSession', id: `PLAN_${trainingPlanId}` as const },
                        { type: 'TrainingPlan', id: trainingPlanId }
                    );
                } else {
                    tags.push(
                        { type: 'TrainingSession', id: `PLAN_${trainingPlanId}` as const },
                        { type: 'TrainingPlan', id: trainingPlanId }
                    );
                }
                return tags;
            },
        }),

        /**
         * GET /training-sessions/?client_id={id}
         * Obtener todas las sesiones de un cliente (filtro client-side por plan y fechas).
         * Usado por Vista semana L-D.
         */
        getTrainingSessionsByClient: builder.query<TrainingSession[], number>({
            query: (clientId) => ({
                url: '/training-sessions/',
                params: { client_id: clientId },
            }),
            providesTags: (result, _error, clientId) => {
                const tags: Array<{ type: 'TrainingSession' | 'TrainingPlan'; id: string | number }> = [];
                if (result) {
                    tags.push(
                        ...result.map(({ id }) => ({ type: 'TrainingSession' as const, id })),
                        { type: 'TrainingSession', id: `CLIENT_${clientId}` as const }
                    );
                } else {
                    tags.push({ type: 'TrainingSession', id: `CLIENT_${clientId}` as const });
                }
                return tags;
            },
        }),

        /**
         * GET /training-sessions/{id}
         * Obtener una sesión específica
         */
        getTrainingSession: builder.query<TrainingSession, number>({
            query: (id) => `/training-sessions/${id}`,
            providesTags: (result, _error, id) => {
                const tags: Array<{ type: 'TrainingSession'; id: string | number }> = [
                    { type: 'TrainingSession', id },
                ];
                if (result?.training_plan_id) {
                    tags.push({ type: 'TrainingSession', id: `PLAN_${result.training_plan_id}` as const });
                }
                return tags;
            },
        }),

        /**
         * GET /training-sessions/{session_id}/coherence
         * Validación de coherencia con el día planificado (fallback si POST no incluye coherence).
         */
        getSessionCoherence: builder.query<SessionCoherence, number>({
            query: (sessionId) => `/training-sessions/${sessionId}/coherence`,
            providesTags: (_result, _error, sessionId) => [
                { type: 'TrainingSession', id: sessionId },
            ],
        }),

        /**
         * GET /training-sessions/{session_id}/exercises
         * Obtener ejercicios asociados a una sesión
         */
        getSessionExercises: builder.query<SessionExercise[], number>({
            query: (sessionId) => `/training-sessions/${sessionId}/exercises`,
            providesTags: (result, _error, sessionId) => {
                const tags: Array<{ type: 'SessionExercise' | 'TrainingSession'; id: string | number }> = [
                    { type: 'TrainingSession', id: sessionId },
                    { type: 'SessionExercise', id: 'LIST' },
                ];
                if (result) {
                    tags.push(...result.map(({ id }) => ({ type: 'SessionExercise' as const, id })));
                }
                return tags;
            },
        }),

        /**
         * POST /training-sessions/
         * Crear nueva sesión de entrenamiento
         */
        createTrainingSession: builder.mutation<TrainingSession, TrainingSessionCreate>({
            query: (body) => ({
                url: '/training-sessions/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, _error, { training_plan_id }) => {
                const tags: Array<{ type: 'TrainingSession' | 'TrainingPlan'; id: string | number }> = [];
                if (training_plan_id) {
                    tags.push(
                        { type: 'TrainingSession', id: `PLAN_${training_plan_id}` },
                        { type: 'TrainingPlan', id: training_plan_id }
                    );
                } else {
                    tags.push({ type: 'TrainingSession', id: 'LIST' });
                }
                return tags;
            },
        }),

        /**
         * PUT /training-sessions/{id}
         * Actualizar sesión existente
         */
        updateTrainingSession: builder.mutation<
            TrainingSession,
            { id: number; body: TrainingSessionUpdate }
        >({
            query: ({ id, body }) => ({
                url: `/training-sessions/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, _error, { id }) => {
                const tags: Array<{ type: 'TrainingSession' | 'TrainingPlan'; id: string | number }> = [
                    { type: 'TrainingSession', id },
                ];
                if (result?.training_plan_id) {
                    tags.push(
                        { type: 'TrainingSession', id: `PLAN_${result.training_plan_id}` },
                        { type: 'TrainingPlan', id: result.training_plan_id }
                    );
                }
                return tags;
            },
        }),

        /**
         * DELETE /training-sessions/{id}
         * Eliminar sesión
         */
        deleteTrainingSession: builder.mutation<
            { message: string },
            { id: number; trainingPlanId: number | null }
        >({
            query: ({ id }) => ({
                url: `/training-sessions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { id, trainingPlanId }) => {
                const tags: Array<{ type: 'TrainingSession' | 'TrainingPlan'; id: string | number }> = [
                    { type: 'TrainingSession', id },
                ];
                if (trainingPlanId) {
                    tags.push(
                        { type: 'TrainingSession', id: `PLAN_${trainingPlanId}` },
                        { type: 'TrainingPlan', id: trainingPlanId }
                    );
                } else {
                    tags.push({ type: 'TrainingSession', id: 'LIST' });
                }
                return tags;
            },
        }),

        /**
         * POST /training-sessions/{session_id}/exercises
         * Agregar ejercicio a una sesión de entrenamiento
         * 
         * @author Frontend Team - NEXIA
         * @since v6.1.0
         */
        createSessionExercise: builder.mutation<
            SessionExercise,
            { sessionId: number; data: SessionExerciseCreate }
        >({
            query: ({ sessionId, data }) => ({
                url: `/training-sessions/${sessionId}/exercises`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, _error, { sessionId }) => {
                const tags: Array<{ type: 'TrainingSession' | 'SessionExercise'; id: string | number }> = [
                    { type: 'TrainingSession', id: sessionId },
                    { type: 'SessionExercise', id: 'LIST' },
                ];
                if (result?.id) {
                    tags.push({ type: 'SessionExercise', id: result.id });
                }
                return tags;
            },
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetSessionRecommendationsQuery,
    useGetTrainingSessionsQuery,
    useGetTrainingSessionsByClientQuery,
    useGetTrainingSessionQuery,
    useGetSessionCoherenceQuery,
    useGetSessionExercisesQuery,
    useCreateTrainingSessionMutation,
    useUpdateTrainingSessionMutation,
    useDeleteTrainingSessionMutation,
    useCreateSessionExerciseMutation,
} = trainingSessionsApi;

