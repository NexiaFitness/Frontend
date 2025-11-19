/**
 * trainingPlansApi.ts — API de gestión de training plans usando RTK Query
 *
 * Contexto:
 * - Define endpoints CRUD para training plans y cycles (macro/meso/micro)
 * - Integrado con sistema RBAC (trainers solo sus propios planes)
 * - Backend devuelve array directo (no wrapper paginado)
 *
 * Endpoints implementados:
 * - FASE 1: Training Plans CRUD
 * - FASE 2: Macrocycles, Mesocycles, Microcycles CRUD
 *
 * @author Frontend Team
 * @since v3.2.0
 * @updated v3.3.0 - Agregados endpoints de Cycles System
 */

import { baseApi } from "./baseApi";
import type {
    TrainingPlan,
    TrainingPlansListResponse,
    TrainingPlanCreate,
    TrainingPlanFilters,
    DeleteTrainingPlanResponse,
    // Macrocycles
    Macrocycle,
    MacrocyclesListResponse,
    MacrocycleCreate,
    MacrocycleUpdate,
    // Mesocycles
    Mesocycle,
    MesocyclesListResponse,
    MesocycleCreate,
    MesocycleUpdate,
    // Microcycles
    Microcycle,
    MicrocyclesListResponse,
    MicrocycleCreate,
    MicrocycleUpdate,
    DeleteCycleResponse,
    AllCyclesResponse,
    // Milestones
    Milestone,
    MilestoneCreate,
    MilestoneUpdate,
} from "../types/training";
import type { PlanAdherenceResponse } from "../types/dashboard";

export const trainingPlansApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========================================
        // TRAINING PLANS
        // ========================================

        /**
         * Obtener lista de training plans con filtros
         * IMPORTANTE: Backend requiere client_id O trainer_id (al menos uno)
         * Response: Array directo (no wrapper con pagination metadata)
         */
        getTrainingPlans: builder.query<TrainingPlansListResponse, TrainingPlanFilters>({
            query: (filters) => {
                const params = new URLSearchParams();

                // Parámetros requeridos (al menos uno)
                if (filters.client_id !== undefined) {
                    params.append('client_id', filters.client_id.toString());
                }
                if (filters.trainer_id !== undefined) {
                    params.append('trainer_id', filters.trainer_id.toString());
                }

                // Paginación
                if (filters.skip !== undefined) {
                    params.append('skip', filters.skip.toString());
                }
                if (filters.limit !== undefined) {
                    params.append('limit', filters.limit.toString());
                }

                return {
                    url: `/training-plans/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "TrainingPlan" as const, id })),
                        { type: "TrainingPlan", id: "LIST" },
                    ]
                    : [{ type: "TrainingPlan", id: "LIST" }],
        }),

        /**
         * Obtener training plan específico por ID
         */
        getTrainingPlan: builder.query<TrainingPlan, number>({
            query: (id) => ({
                url: `/training-plans/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "TrainingPlan", id }],
        }),

        /**
         * Crear nuevo training plan
         */
        createTrainingPlan: builder.mutation<TrainingPlan, TrainingPlanCreate>({
            query: (planData) => ({
                url: "/training-plans/",
                method: "POST",
                body: planData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [{ type: "TrainingPlan", id: "LIST" }],
        }),

        /**
         * Eliminar training plan
         */
        deleteTrainingPlan: builder.mutation<DeleteTrainingPlanResponse, number>({
            query: (id) => ({
                url: `/training-plans/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "TrainingPlan", id },
                { type: "TrainingPlan", id: "LIST" },
            ],
        }),

        /**
         * Obtener todos los cycles (macro, meso, micro) de un training plan
         * Optimizado para vistas de gráficos que necesitan la estructura completa
         */
        getAllCycles: builder.query<AllCyclesResponse, number>({
            query: (planId) => ({
                url: `/training-plans/${planId}/all-cycles`,
                method: "GET",
            }),
            providesTags: (result, error, planId) => [
                { type: "Macrocycle" as const, id: "LIST" },
                { type: "Mesocycle" as const, id: "LIST" },
                { type: "Microcycle" as const, id: "LIST" },
            ],
        }),

        // ========================================
        // MACROCYCLES
        // ========================================

        /**
         * Obtener macrocycles de un training plan
         */
        getMacrocycles: builder.query<MacrocyclesListResponse, { planId: number; skip?: number; limit?: number }>({
            query: ({ planId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/training-plans/${planId}/macrocycles?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { planId }) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Macrocycle" as const, id })),
                        { type: "Macrocycle", id: `PLAN-${planId}` },
                    ]
                    : [{ type: "Macrocycle", id: `PLAN-${planId}` }],
        }),

        /**
         * Obtener macrocycle específico por ID
         */
        getMacrocycle: builder.query<Macrocycle, number>({
            query: (id) => ({
                url: `/training-plans/macrocycles/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Macrocycle", id }],
        }),

        /**
         * Crear nuevo macrocycle
         */
        createMacrocycle: builder.mutation<Macrocycle, { planId: number; data: Omit<MacrocycleCreate, 'training_plan_id'> }>({
            query: ({ planId, data }) => ({
                url: `/training-plans/${planId}/macrocycles`,
                method: "POST",
                body: { ...data, training_plan_id: planId },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { planId }) => [
                { type: "Macrocycle", id: `PLAN-${planId}` },
            ],
        }),

        /**
         * Actualizar macrocycle
         */
        updateMacrocycle: builder.mutation<Macrocycle, { id: number; data: MacrocycleUpdate }>({
            query: ({ id, data }) => ({
                url: `/training-plans/macrocycles/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Macrocycle", id },
            ],
        }),

        /**
         * Eliminar macrocycle
         */
        deleteMacrocycle: builder.mutation<DeleteCycleResponse, number>({
            query: (id) => ({
                url: `/training-plans/macrocycles/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Macrocycle", id },
            ],
        }),

        // ========================================
        // MESOCYCLES
        // ========================================

        /**
         * Obtener mesocycles de un macrocycle
         */
        getMesocycles: builder.query<MesocyclesListResponse, { macrocycleId: number; skip?: number; limit?: number }>({
            query: ({ macrocycleId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/training-plans/macrocycles/${macrocycleId}/mesocycles?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { macrocycleId }) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Mesocycle" as const, id })),
                        { type: "Mesocycle", id: `MACRO-${macrocycleId}` },
                    ]
                    : [{ type: "Mesocycle", id: `MACRO-${macrocycleId}` }],
        }),

        /**
         * Obtener mesocycle específico por ID
         */
        getMesocycle: builder.query<Mesocycle, number>({
            query: (id) => ({
                url: `/training-plans/mesocycles/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Mesocycle", id }],
        }),

        /**
         * Crear nuevo mesocycle
         */
        createMesocycle: builder.mutation<Mesocycle, { macrocycleId: number; data: Omit<MesocycleCreate, 'macrocycle_id'> }>({
            query: ({ macrocycleId, data }) => ({
                url: `/training-plans/macrocycles/${macrocycleId}/mesocycles`,
                method: "POST",
                body: { ...data, macrocycle_id: macrocycleId },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { macrocycleId }) => [
                { type: "Mesocycle", id: `MACRO-${macrocycleId}` },
            ],
        }),

        /**
         * Actualizar mesocycle
         */
        updateMesocycle: builder.mutation<Mesocycle, { id: number; data: MesocycleUpdate }>({
            query: ({ id, data }) => ({
                url: `/training-plans/mesocycles/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Mesocycle", id },
            ],
        }),

        /**
         * Eliminar mesocycle
         */
        deleteMesocycle: builder.mutation<DeleteCycleResponse, number>({
            query: (id) => ({
                url: `/training-plans/mesocycles/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Mesocycle", id },
            ],
        }),

        // ========================================
        // MICROCYCLES
        // ========================================

        /**
         * Obtener microcycles de un mesocycle
         */
        getMicrocycles: builder.query<MicrocyclesListResponse, { mesocycleId: number; skip?: number; limit?: number }>({
            query: ({ mesocycleId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/training-plans/mesocycles/${mesocycleId}/microcycles?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { mesocycleId }) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Microcycle" as const, id })),
                        { type: "Microcycle", id: `MESO-${mesocycleId}` },
                    ]
                    : [{ type: "Microcycle", id: `MESO-${mesocycleId}` }],
        }),

        /**
         * Obtener microcycle específico por ID
         */
        getMicrocycle: builder.query<Microcycle, number>({
            query: (id) => ({
                url: `/training-plans/microcycles/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Microcycle", id }],
        }),

        /**
         * Crear nuevo microcycle
         */
        createMicrocycle: builder.mutation<Microcycle, { mesocycleId: number; data: Omit<MicrocycleCreate, 'mesocycle_id'> }>({
            query: ({ mesocycleId, data }) => ({
                url: `/training-plans/mesocycles/${mesocycleId}/microcycles`,
                method: "POST",
                body: { ...data, mesocycle_id: mesocycleId },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { mesocycleId }) => [
                { type: "Microcycle", id: `MESO-${mesocycleId}` },
            ],
        }),

        /**
         * Actualizar microcycle
         */
        updateMicrocycle: builder.mutation<Microcycle, { id: number; data: MicrocycleUpdate }>({
            query: ({ id, data }) => ({
                url: `/training-plans/microcycles/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Microcycle", id },
            ],
        }),

        /**
         * Eliminar microcycle
         */
        deleteMicrocycle: builder.mutation<DeleteCycleResponse, number>({
            query: (id) => ({
                url: `/training-plans/microcycles/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Microcycle", id },
            ],
        }),

        // ========================================
        // MILESTONES
        // ========================================

        /**
         * Obtener milestones de un training plan
         * Backend: GET /api/v1/training-plans/{plan_id}/milestones
         */
        getMilestones: builder.query<Milestone[], number>({
            query: (planId) => ({
                url: `/training-plans/${planId}/milestones`,
                method: "GET",
            }),
            providesTags: (result, error, planId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Milestone" as const, id })),
                        { type: "Milestone", id: `PLAN-${planId}` },
                    ]
                    : [{ type: "Milestone", id: `PLAN-${planId}` }],
        }),

        /**
         * Obtener milestone específico por ID
         * Backend: GET /api/v1/training-plans/milestones/{milestone_id}
         */
        getMilestone: builder.query<Milestone, number>({
            query: (id) => ({
                url: `/training-plans/milestones/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Milestone", id }],
        }),

        /**
         * Crear nuevo milestone
         * Backend: POST /api/v1/training-plans/{plan_id}/milestones
         */
        createMilestone: builder.mutation<Milestone, { planId: number; data: Omit<MilestoneCreate, 'training_plan_id'> }>({
            query: ({ planId, data }) => ({
                url: `/training-plans/${planId}/milestones`,
                method: "POST",
                body: { ...data, training_plan_id: planId },
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { planId }) => [
                { type: "Milestone", id: `PLAN-${planId}` },
            ],
        }),

        /**
         * Actualizar milestone
         * Backend: PUT /api/v1/training-plans/milestones/{milestone_id}
         */
        updateMilestone: builder.mutation<Milestone, { id: number; data: MilestoneUpdate }>({
            query: ({ id, data }) => ({
                url: `/training-plans/milestones/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Milestone", id },
            ],
        }),

        /**
         * Eliminar milestone
         * Backend: DELETE /api/v1/training-plans/milestones/{milestone_id}
         */
        deleteMilestone: builder.mutation<DeleteCycleResponse, number>({
            query: (id) => ({
                url: `/training-plans/milestones/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Milestone", id },
            ],
        }),

        // ========================================
        // DASHBOARD KPI ENDPOINTS
        // ========================================

        /**
         * Obtener estadísticas de adherencia de planes
         * Endpoint: GET /api/v1/training-plans/adherence-stats
         */
        getPlanAdherenceStats: builder.query<PlanAdherenceResponse, void>({
            query: () => ({
                url: "/training-plans/adherence-stats",
                method: "GET",
            }),
            providesTags: [{ type: "TrainingPlan", id: "DASHBOARD_KPI" }],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query
export const {
    // Training Plans
    useGetTrainingPlansQuery,
    useGetTrainingPlanQuery,
    useCreateTrainingPlanMutation,
    useDeleteTrainingPlanMutation,
    useGetAllCyclesQuery,
    
    // Macrocycles
    useGetMacrocyclesQuery,
    useGetMacrocycleQuery,
    useCreateMacrocycleMutation,
    useUpdateMacrocycleMutation,
    useDeleteMacrocycleMutation,
    
    // Mesocycles
    useGetMesocyclesQuery,
    useGetMesocycleQuery,
    useCreateMesocycleMutation,
    useUpdateMesocycleMutation,
    useDeleteMesocycleMutation,
    
    // Microcycles
    useGetMicrocyclesQuery,
    useGetMicrocycleQuery,
    useCreateMicrocycleMutation,
    useUpdateMicrocycleMutation,
    useDeleteMicrocycleMutation,
    
    // Milestones
    useGetMilestonesQuery,
    useGetMilestoneQuery,
    useCreateMilestoneMutation,
    useUpdateMilestoneMutation,
    useDeleteMilestoneMutation,
    // Dashboard KPI hooks
    useGetPlanAdherenceStatsQuery,
} = trainingPlansApi;