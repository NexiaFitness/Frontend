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
import type {
    TrainingPlanYearlyPlanning,
    TrainingPlanMonthlyPlanning,
    TrainingPlanWeeklyPlanning,
    UpdatePlanningDistributionRequest,
    UpdatePlanningLoadRequest,
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
            query: ({ plan_id, client_id, start_date, end_date, name }) => {
                const params = new URLSearchParams();
                params.append("client_id", client_id.toString());
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

        // ========================================
        // PLANNING ENDPOINTS (Training Plan-based, Editable)
        // ========================================

        /**
         * Get yearly planning view for a training plan
         * Endpoint: GET /training-plans/{plan_id}/planning/yearly?year={year}
         */
        getTrainingPlanYearlyPlanning: builder.query<
            TrainingPlanYearlyPlanning,
            { planId: number; year?: number }
        >({
            query: ({ planId, year }) => {
                const params = new URLSearchParams();
                if (year !== undefined) {
                    params.append("year", year.toString());
                }
                const queryString = params.toString();
                return {
                    url: `/training-plans/${planId}/planning/yearly${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `${planId}-PLANNING-YEARLY` },
            ],
        }),

        /**
         * Get monthly planning view for a training plan
         * Endpoint: GET /training-plans/{plan_id}/planning/monthly?year={year}&month={month}
         */
        getTrainingPlanMonthlyPlanning: builder.query<
            TrainingPlanMonthlyPlanning,
            { planId: number; year?: number; month?: number }
        >({
            query: ({ planId, year, month }) => {
                const params = new URLSearchParams();
                if (year !== undefined) {
                    params.append("year", year.toString());
                }
                if (month !== undefined) {
                    params.append("month", month.toString());
                }
                const queryString = params.toString();
                return {
                    url: `/training-plans/${planId}/planning/monthly${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `${planId}-PLANNING-MONTHLY` },
            ],
        }),

        /**
         * Get weekly planning view for a training plan
         * Endpoint: GET /training-plans/{plan_id}/planning/weekly?week_start={date}
         */
        getTrainingPlanWeeklyPlanning: builder.query<
            TrainingPlanWeeklyPlanning,
            { planId: number; weekStart?: string }
        >({
            query: ({ planId, weekStart }) => {
                const params = new URLSearchParams();
                if (weekStart) {
                    params.append("week_start", weekStart);
                }
                const queryString = params.toString();
                return {
                    url: `/training-plans/${planId}/planning/weekly${queryString ? `?${queryString}` : ""}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `${planId}-PLANNING-WEEKLY` },
            ],
        }),

        /**
         * Update physical qualities distribution for multiple cycles
         * Endpoint: PUT /training-plans/{plan_id}/planning/distribution
         */
        updatePlanningDistribution: builder.mutation<
            { message: string; updated_cycles: number },
            { planId: number; data: UpdatePlanningDistributionRequest }
        >({
            query: ({ planId, data }) => ({
                url: `/training-plans/${planId}/planning/distribution`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `${planId}-PLANNING-YEARLY` },
                { type: "TrainingPlan", id: `${planId}-PLANNING-MONTHLY` },
                { type: "TrainingPlan", id: `${planId}-PLANNING-WEEKLY` },
                { type: "Macrocycle", id: "LIST" },
                { type: "Mesocycle", id: "LIST" },
                { type: "Microcycle", id: "LIST" },
            ],
        }),

        /**
         * Update volume/intensity for multiple cycles
         * Endpoint: PUT /training-plans/{plan_id}/planning/load
         */
        updatePlanningLoad: builder.mutation<
            { message: string; updated_cycles: number },
            { planId: number; data: UpdatePlanningLoadRequest }
        >({
            query: ({ planId, data }) => ({
                url: `/training-plans/${planId}/planning/load`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { planId }) => [
                { type: "TrainingPlan", id: planId },
                { type: "TrainingPlan", id: `${planId}-PLANNING-YEARLY` },
                { type: "TrainingPlan", id: `${planId}-PLANNING-MONTHLY` },
                { type: "TrainingPlan", id: `${planId}-PLANNING-WEEKLY` },
                { type: "Macrocycle", id: "LIST" },
                { type: "Mesocycle", id: "LIST" },
                { type: "Microcycle", id: "LIST" },
            ],
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
    useUpdateTrainingPlanMutation,
    useDeleteTrainingPlanMutation,
    useGetAllCyclesQuery,
    
    // Templates
    useGetTrainingPlanTemplatesQuery,
    useGetTrainingPlanTemplateQuery,
    useCreateTrainingPlanTemplateMutation,
    useUpdateTrainingPlanTemplateMutation,
    useDeleteTrainingPlanTemplateMutation,
    useDuplicateTrainingPlanTemplateMutation,
    useAssignTemplateToClientMutation,
    
    // Instances
    useGetTrainingPlanInstancesQuery,
    useGetTrainingPlanInstanceQuery,
    useCreateTrainingPlanInstanceMutation,
    useUpdateTrainingPlanInstanceMutation,
    useDeleteTrainingPlanInstanceMutation,
    
    // Utility
    useAssignPlanToClientMutation,
    useConvertPlanToTemplateMutation,
    
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
    
    // Planning hooks (Training Plan-based, Editable)
    useGetTrainingPlanYearlyPlanningQuery,
    useGetTrainingPlanMonthlyPlanningQuery,
    useGetTrainingPlanWeeklyPlanningQuery,
    useUpdatePlanningDistributionMutation,
    useUpdatePlanningLoadMutation,
} = trainingPlansApi;