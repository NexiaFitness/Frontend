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
 * - Fase 6: macro/meso/micro CRUD and planning/yearly|monthly|weekly removed (legacy)
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
    TrainingPlanUpdate,
    TrainingPlanFilters,
    DeleteTrainingPlanResponse,
    // Templates
    TrainingPlanTemplate,
    TrainingPlanTemplateCreate,
    TrainingPlanTemplateUpdate,
    // Instances
    TrainingPlanInstance,
    TrainingPlanInstanceCreate,
    TrainingPlanInstanceUpdate,
    AssignTemplateToClientParams,
    AssignPlanToClientParams,
    ConvertPlanToTemplateParams,
    DeleteCycleResponse,
    // Milestones
    Milestone,
    MilestoneCreate,
    MilestoneUpdate,
} from "../types/training";
import type { PlanAdherenceResponse } from "../types/dashboard";
import type {
    PlanCoherenceResponse,
    TrainingPlanAlignmentResponse,
} from "../types/trainingAnalytics";

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
                // Validación temprana: al menos uno de los parámetros requeridos
                if (filters.client_id === undefined && filters.trainer_id === undefined) {
                    throw new Error("Either client_id or trainer_id is required for getTrainingPlans");
                }

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
         * Actualizar training plan
         * Endpoint: PUT /api/v1/training-plans/{plan_id}
         */
        updateTrainingPlan: builder.mutation<TrainingPlan, { id: number; data: TrainingPlanUpdate }>({
            query: ({ id, data }) => ({
                url: `/training-plans/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "TrainingPlan", id },
                { type: "TrainingPlan", id: "LIST" },
            ],
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
        // COHERENCE & ALIGNMENT (Fase 5 — period-based)
        // ========================================

        /**
         * Coherencia del plan (MonthlyPlan + WeeklyOverride + DailyOverride).
         * GET /api/v1/training-plans/{plan_id}/coherence
         */
        getTrainingPlanCoherence: builder.query<
            PlanCoherenceResponse,
            { planId: number; deviationThreshold?: number }
        >({
            query: ({ planId, deviationThreshold = 20 }) => {
                const params = new URLSearchParams();
                params.append("deviation_threshold", deviationThreshold.toString());
                return {
                    url: `/training-plans/${planId}/coherence?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `COHERENCE-${planId}` },
            ],
        }),

        /**
         * Alignment del plan (graph + yearly_values/monthly_values).
         * GET /api/v1/training-plans/{plan_id}/alignment
         * Query opcionales: mesocycle_id (= weekly_override_id), microcycle_id (= daily_override_id)
         */
        getTrainingPlanAlignment: builder.query<
            TrainingPlanAlignmentResponse,
            { planId: number; mesocycleId?: number; microcycleId?: number }
        >({
            query: ({ planId, mesocycleId, microcycleId }) => {
                const params = new URLSearchParams();
                if (mesocycleId != null) params.append("mesocycle_id", mesocycleId.toString());
                if (microcycleId != null) params.append("microcycle_id", microcycleId.toString());
                const qs = params.toString();
                return {
                    url: `/training-plans/${planId}/alignment${qs ? `?${qs}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `ALIGNMENT-${planId}` },
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

        // ========================================
        // TRAINING PLAN TEMPLATES
        // ========================================

        /**
         * Obtener lista de plantillas de planes
         * Endpoint: GET /api/v1/training-plans/templates/
         */
        getTrainingPlanTemplates: builder.query<
            TrainingPlanTemplate[],
            { trainerId: number; category?: string; skip?: number; limit?: number }
        >({
            query: ({ trainerId, category, skip = 0, limit = 100 }) => {
                // Validación defensiva: RTK Query puede ejecutar query() incluso con skip: true
                // para construir la cache key. Nunca lanzar errores, retornar query válida pero que fallará controladamente
                if (trainerId === undefined || trainerId === null || trainerId === 0) {
                    // Retornar query que será rechazada por el backend (trainer_id=0 no existe)
                    // Esto permite que RTK Query construya la cache key sin errores
                    const params = new URLSearchParams();
                    params.append("trainer_id", "0");
                    params.append("skip", skip.toString());
                    params.append("limit", limit.toString());
                    return {
                        url: `/training-plans/templates/?${params.toString()}`,
                        method: "GET",
                    };
                }

                const params = new URLSearchParams();
                params.append("trainer_id", trainerId.toString());
                if (category) params.append("category", category);
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());

                return {
                    url: `/training-plans/templates/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "TrainingPlanTemplate" as const, id })),
                        { type: "TrainingPlanTemplate", id: "LIST" },
                    ]
                    : [{ type: "TrainingPlanTemplate", id: "LIST" }],
        }),

        /**
         * Obtener plantilla específica por ID
         * Endpoint: GET /api/v1/training-plans/templates/{template_id}
         */
        getTrainingPlanTemplate: builder.query<TrainingPlanTemplate, number>({
            query: (id) => ({
                url: `/training-plans/templates/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "TrainingPlanTemplate", id }],
        }),

        /**
         * Crear nueva plantilla
         * Endpoint: POST /api/v1/training-plans/templates/
         */
        createTrainingPlanTemplate: builder.mutation<
            TrainingPlanTemplate,
            TrainingPlanTemplateCreate
        >({
            query: (data) => ({
                url: "/training-plans/templates/",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [{ type: "TrainingPlanTemplate", id: "LIST" }],
        }),

        /**
         * Actualizar plantilla
         * Endpoint: PUT /api/v1/training-plans/templates/{template_id}
         */
        updateTrainingPlanTemplate: builder.mutation<
            TrainingPlanTemplate,
            { id: number; data: TrainingPlanTemplateUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/training-plans/templates/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "TrainingPlanTemplate", id },
                { type: "TrainingPlanTemplate", id: "LIST" },
            ],
        }),

        /**
         * Eliminar plantilla
         * Endpoint: DELETE /api/v1/training-plans/templates/{template_id}
         */
        deleteTrainingPlanTemplate: builder.mutation<DeleteTrainingPlanResponse, number>({
            query: (id) => ({
                url: `/training-plans/templates/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "TrainingPlanTemplate", id },
                { type: "TrainingPlanTemplate", id: "LIST" },
            ],
        }),

        /**
         * Duplicar plantilla
         * Endpoint: POST /api/v1/training-plans/templates/{template_id}/duplicate
         */
        duplicateTrainingPlanTemplate: builder.mutation<TrainingPlanTemplate, number>({
            query: (id) => ({
                url: `/training-plans/templates/${id}/duplicate`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "TrainingPlanTemplate", id: "LIST" }],
        }),

        /**
         * Asignar plantilla a cliente (crea instancia)
         * Endpoint: POST /api/v1/training-plans/templates/{template_id}/assign
         */
        assignTemplateToClient: builder.mutation<
            TrainingPlanInstance,
            AssignTemplateToClientParams & { trainer_id: number }
        >({
            query: ({ template_id, client_id, start_date, end_date, name, trainer_id }) => {
                // Validar que client_id y trainer_id existan
                if (!client_id || !trainer_id) {
                    throw new Error("client_id and trainer_id are required");
                }

                const params = new URLSearchParams();
                params.append("client_id", client_id.toString());
                params.append("start_date", start_date);
                params.append("end_date", end_date);
                params.append("trainer_id", trainer_id.toString());
                if (name) params.append("name", name);

                return {
                    url: `/training-plans/templates/${template_id}/assign?${params.toString()}`,
                    method: "POST",
                };
            },
            invalidatesTags: [
                { type: "TrainingPlanTemplate", id: "LIST" },
                { type: "TrainingPlanInstance", id: "LIST" },
                { type: "TrainingPlan", id: "LIST" },
            ],
        }),

        // ========================================
        // TRAINING PLAN INSTANCES
        // ========================================

        /**
         * Obtener lista de instancias de planes
         * Endpoint: GET /api/v1/training-plans/instances/
         */
        getTrainingPlanInstances: builder.query<
            TrainingPlanInstance[],
            { trainerId?: number; clientId?: number; skip?: number; limit?: number }
        >({
            query: ({ trainerId, clientId, skip = 0, limit = 100 }) => {
                // Validación temprana: al menos uno de los parámetros requeridos
                if (trainerId === undefined && clientId === undefined) {
                    throw new Error("Either trainerId or clientId is required for getTrainingPlanInstances");
                }

                const params = new URLSearchParams();
                if (trainerId !== undefined) params.append("trainer_id", trainerId.toString());
                if (clientId !== undefined) params.append("client_id", clientId.toString());
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());

                return {
                    url: `/training-plans/instances/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "TrainingPlanInstance" as const, id })),
                        { type: "TrainingPlanInstance", id: "LIST" },
                    ]
                    : [{ type: "TrainingPlanInstance", id: "LIST" }],
        }),

        /**
         * Obtener instancia específica por ID
         * Endpoint: GET /api/v1/training-plans/instances/{instance_id}
         */
        getTrainingPlanInstance: builder.query<TrainingPlanInstance, number>({
            query: (id) => ({
                url: `/training-plans/instances/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "TrainingPlanInstance", id }],
        }),

        /**
         * Crear nueva instancia
         * Endpoint: POST /api/v1/training-plans/instances/
         */
        createTrainingPlanInstance: builder.mutation<
            TrainingPlanInstance,
            TrainingPlanInstanceCreate
        >({
            query: (data) => ({
                url: "/training-plans/instances/",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [{ type: "TrainingPlanInstance", id: "LIST" }],
        }),

        /**
         * Actualizar instancia
         * Endpoint: PUT /api/v1/training-plans/instances/{instance_id}
         */
        updateTrainingPlanInstance: builder.mutation<
            TrainingPlanInstance,
            { id: number; data: TrainingPlanInstanceUpdate }
        >({
            query: ({ id, data }) => ({
                url: `/training-plans/instances/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "TrainingPlanInstance", id },
                { type: "TrainingPlanInstance", id: "LIST" },
            ],
        }),

        /**
         * Eliminar instancia
         * Endpoint: DELETE /api/v1/training-plans/instances/{instance_id}
         */
        deleteTrainingPlanInstance: builder.mutation<DeleteTrainingPlanResponse, number>({
            query: (id) => ({
                url: `/training-plans/instances/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "TrainingPlanInstance", id },
                { type: "TrainingPlanInstance", id: "LIST" },
            ],
        }),

        // ========================================
        // UTILITY ENDPOINTS
        // ========================================

        /**
         * Asignar plan a otro cliente (crea instancia)
         * Endpoint: POST /api/v1/training-plans/{plan_id}/assign
         */
        assignPlanToClient: builder.mutation<
            TrainingPlanInstance,
            AssignPlanToClientParams
        >({
            query: ({ plan_id, client_id, trainer_id, start_date, end_date, name }) => {
                const params = new URLSearchParams();
                params.append("client_id", client_id.toString());
                params.append("trainer_id", trainer_id.toString());
                params.append("start_date", start_date);
                params.append("end_date", end_date);
                if (name) params.append("name", name);

                return {
                    url: `/training-plans/${plan_id}/assign?${params.toString()}`,
                    method: "POST",
                };
            },
            invalidatesTags: [
                { type: "TrainingPlan", id: "LIST" },
                { type: "TrainingPlanInstance", id: "LIST" },
            ],
        }),

        /**
         * Convertir plan a plantilla
         * Endpoint: POST /api/v1/training-plans/{plan_id}/convert-to-template
         */
        convertPlanToTemplate: builder.mutation<
            TrainingPlanTemplate,
            ConvertPlanToTemplateParams
        >({
            query: ({ plan_id, template_data }) => ({
                url: `/training-plans/${plan_id}/convert-to-template`,
                method: "POST",
                body: template_data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [
                { type: "TrainingPlanTemplate", id: "LIST" },
                { type: "TrainingPlan", id: "LIST" },
            ],
        }),

        // Removed Fase 6 (legacy): getTrainingPlanYearlyPlanning, getTrainingPlanMonthlyPlanning,
        // getTrainingPlanWeeklyPlanning, updatePlanningDistribution, updatePlanningLoad
    }),
    overrideExisting: false,
});

// Hooks auto-generados por RTK Query (Fase 6: removed macro/meso/micro and planning/yearly|monthly|weekly)
export const {
    useGetTrainingPlansQuery,
    useGetTrainingPlanQuery,
    useCreateTrainingPlanMutation,
    useUpdateTrainingPlanMutation,
    useDeleteTrainingPlanMutation,
    useGetTrainingPlanTemplatesQuery,
    useGetTrainingPlanTemplateQuery,
    useCreateTrainingPlanTemplateMutation,
    useUpdateTrainingPlanTemplateMutation,
    useDeleteTrainingPlanTemplateMutation,
    useDuplicateTrainingPlanTemplateMutation,
    useAssignTemplateToClientMutation,
    useGetTrainingPlanInstancesQuery,
    useGetTrainingPlanInstanceQuery,
    useCreateTrainingPlanInstanceMutation,
    useUpdateTrainingPlanInstanceMutation,
    useDeleteTrainingPlanInstanceMutation,
    useAssignPlanToClientMutation,
    useConvertPlanToTemplateMutation,
    useGetMilestonesQuery,
    useGetMilestoneQuery,
    useCreateMilestoneMutation,
    useUpdateMilestoneMutation,
    useDeleteMilestoneMutation,
    useGetTrainingPlanCoherenceQuery,
    useGetTrainingPlanAlignmentQuery,
    useGetPlanAdherenceStatsQuery,
} = trainingPlansApi;