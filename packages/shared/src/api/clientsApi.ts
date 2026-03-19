/**
 * API de gestión de clientes usando RTK Query
 * Define endpoints CRUD: getClients, createClient, updateClient, deleteClient
 * Integrado con sistema RBAC (trainers solo sus propios clientes)
 * 
 * @author Frontend Team
 * @since v2.1.0
 * @updated v2.6.0 - Corregido schema de getClientStats según backend real
 */

import { baseApi } from "./baseApi";
import type {
    Client,
    ClientsListResponse,
    CreateClientData,
    UpdateClientData,
    ClientFilters,
    ClientListWithMetricsResponse,
    GetClientsWithMetricsParams,
    RecentActivityResponse,
    ClientPreviewResponse,
    ClientRatingCreate,
    ClientRatingUpdate,
    ClientRatingOut,
} from "../types/client";
import type {
    ClientEquipment,
    ClientEquipmentCreate,
    ClientEquipmentUpdate,
} from "../types/clientEquipment";
import type { ClientStatsResponse } from "../types/clientStats";

import type {
    ClientProgress,
    CreateClientProgressData,
    UpdateClientProgressData,
    ProgressAnalytics,
    ProgressTracking,
} from "../types/progress";

import type {
    TrainingPlan,
    TrainingSession,
    ClientFeedback,
    FatigueAnalysis,
} from "../types/training";
import type {
    ClientTrainingPlanSummary,
    TrainingPlanMonthlySummary,
    TrainingPlanWeeklySummary,
    PlanAdherenceStats,
} from "../types/trainingAnalytics";
import type {
    ClientImprovementResponse,
    ClientSatisfactionResponse,
    ProgressCategoriesResponse,
} from "../types/dashboard";
import type { DailyCoherenceAnalyticsOut } from "../types/coherence";
import type {
    PhysicalTestResultOut,
    PhysicalTestOut,
    ClientTestingSummary,
    CreateTestResultData,
    UpdateTestResultData,
} from "../types/testing";

/** Límite máximo de page_size para GET /trainers/{id}/clients (backend: 1–50) */
const TRAINER_CLIENTS_PAGE_SIZE_MAX = 50;

export const clientsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Obtener clientes de un trainer específico (filtrado por trainer_id).
         * Backend limita page_size a 1–50; valores mayores se ajustan automáticamente.
         */
        getTrainerClients: builder.query<ClientsListResponse, { trainerId: number; filters?: ClientFilters; page?: number; per_page?: number }>({
            query: ({ trainerId, filters = {}, page = 1, per_page = 10 }) => {
                const pageSize = Math.min(Math.max(1, per_page), TRAINER_CLIENTS_PAGE_SIZE_MAX);
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('page_size', pageSize.toString());
                
                if (filters.search) {
                    params.append('search', filters.search);
                }
                if (filters.sort_by) {
                    params.append('sort_by', filters.sort_by);
                }
                if (filters.sort_order) {
                    params.append('sort_order', filters.sort_order);
                }

                return {
                    url: `/trainers/${trainerId}/clients?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: "Client" as const, id })),
                        { type: "Client", id: "LIST" },
                    ]
                    : [{ type: "Client", id: "LIST" }],
        }),

        /**
         * Obtener lista de clientes con filtros y paginación (admin only - todos los clientes)
         */
        getClients: builder.query<ClientsListResponse, { filters?: ClientFilters; page?: number; per_page?: number }>({
            query: ({ filters = {}, page = 1, per_page = 10 }) => {
                const params = new URLSearchParams();
                params.append('page', page.toString());
                params.append('page_size', per_page.toString());
                
                // Agregar filtros existentes - Usar nombres exactos del backend
                if (filters.objetivo_entrenamiento) {
                    params.append('training_goal', filters.objetivo_entrenamiento);
                }
                if (filters.experiencia) {
                    params.append('experience', filters.experiencia);
                }
                if (filters.activo !== undefined) {
                    params.append('activo', filters.activo.toString());
                }
                if (filters.search) {
                    params.append('search', filters.search);
                }

                // Filtros avanzados
                if (filters.age_min !== undefined) {
                    params.append('age_min', filters.age_min.toString());
                }
                if (filters.age_max !== undefined) {
                    params.append('age_max', filters.age_max.toString());
                }
                if (filters.gender) {
                    params.append('gender', filters.gender);
                }
                if (filters.sort_by) {
                    params.append('sort_by', filters.sort_by);
                }
                if (filters.sort_order) {
                    params.append('sort_order', filters.sort_order);
                }

                return {
                    url: `/clients/search?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: "Client" as const, id })),
                        { type: "Client", id: "LIST" },
                    ]
                    : [{ type: "Client", id: "LIST" }],
        }),

        /**
         * Obtener cliente específico por ID
         */
        getClient: builder.query<Client, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Client", id }],
        }),

        /**
         * Crear nuevo cliente
         * Invalida listas de clientes (incl. getTrainerClients) para que modales/desplegables
         * muestren el nuevo cliente sin depender de refetch manual.
         */
        createClient: builder.mutation<Client, CreateClientData>({
            query: (clientData) => ({
                url: "/clients",
                method: "POST",
                body: clientData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: [
                { type: "Client", id: "LIST" },
                { type: "Client", id: "STATS" },
                { type: "Client", id: "LIST_WITH_METRICS" },
                { type: "Client", id: "RECENT_ACTIVITY" },
            ],
        }),

        /**
         * Preview cálculos de cliente (BMI y somatotipo) sin persistir
         * Usado en el paso Review antes de crear el cliente
         */
        previewClientCalculations: builder.mutation<ClientPreviewResponse, CreateClientData>({
            query: (clientData) => ({
                url: "/clients/preview",
                method: "POST",
                body: clientData,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            // No invalida tags porque no persiste nada
        }),

        /**
         * Actualizar cliente existente
         */
        updateClient: builder.mutation<Client, { id: number; data: UpdateClientData }>({
            query: ({ id, data }) => ({
                url: `/clients/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Client", id },
                { type: "Client", id: "LIST" },
                { type: "Client", id: "STATS" },
                // Recomendaciones de plan dependen del perfil del cliente
                { type: "TrainingPlan", id: `RECOMMENDATIONS_${id}` },
            ],
        }),

        /**
         * Eliminar cliente
         */
        deleteClient: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/clients/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Client", id },
                { type: "Client", id: "LIST" },
                { type: "Client", id: "STATS" },
            ],
        }),

        /**
         * Listar equipo del cliente
         * Backend: GET /clients/{client_id}/equipment
         */
        getClientEquipment: builder.query<ClientEquipment[], number>({
            query: (clientId) => ({
                url: `/clients/${clientId}/equipment`,
                method: "GET",
            }),
            providesTags: (result, error, clientId) => [
                { type: "Client", id: `Equipment-${clientId}` },
            ],
        }),

        /**
         * Añadir equipo al cliente
         * Backend: POST /clients/{client_id}/equipment
         */
        createClientEquipment: builder.mutation<
            ClientEquipment,
            { clientId: number; data: ClientEquipmentCreate }
        >({
            query: ({ clientId, data }) => ({
                url: `/clients/${clientId}/equipment`,
                method: "POST",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: "Client", id: `Equipment-${clientId}` },
            ],
        }),

        /**
         * Actualizar equipo del cliente
         * Backend: PUT /clients/{client_id}/equipment/{equipment_id}
         */
        updateClientEquipment: builder.mutation<
            ClientEquipment,
            { clientId: number; equipmentId: number; data: ClientEquipmentUpdate }
        >({
            query: ({ clientId, equipmentId, data }) => ({
                url: `/clients/${clientId}/equipment/${equipmentId}`,
                method: "PUT",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: "Client", id: `Equipment-${clientId}` },
            ],
        }),

        /**
         * Eliminar (soft) equipo del cliente
         * Backend: DELETE /clients/{client_id}/equipment/{equipment_id}
         */
        deleteClientEquipment: builder.mutation<
            { message: string },
            { clientId: number; equipmentId: number }
        >({
            query: ({ clientId, equipmentId }) => ({
                url: `/clients/${clientId}/equipment/${equipmentId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: "Client", id: `Equipment-${clientId}` },
            ],
        }),

        /**
         * Crear valoración de satisfacción de un cliente
         * Backend: POST /clients/{client_id}/ratings
         */
        createClientRating: builder.mutation<ClientRatingOut, { clientId: number; data: ClientRatingCreate }>({
            query: ({ clientId, data }) => ({
                url: `/clients/${clientId}/ratings`,
                method: "POST",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: "Client", id: clientId },
                { type: "Client", id: `Ratings-${clientId}` },
            ],
        }),

        /**
         * Obtener valoraciones de un cliente
         * Backend: GET /clients/{client_id}/ratings?skip=&limit=
         */
        getClientRatings: builder.query<ClientRatingOut[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append("skip", skip.toString());
                params.append("limit", limit.toString());
                return {
                    url: `/clients/${clientId}/ratings?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "Client" as const, id: `Rating-${id}` })),
                        { type: "Client", id: `Ratings-${clientId}` },
                    ]
                    : [{ type: "Client", id: "Ratings" }],
        }),

        /**
         * Obtener una valoración por ID
         * Backend: GET /clients/ratings/{rating_id}
         */
        getClientRating: builder.query<ClientRatingOut, number>({
            query: (ratingId) => ({
                url: `/clients/ratings/${ratingId}`,
                method: "GET",
            }),
            providesTags: (result, error, ratingId) => [{ type: "Client", id: `Rating-${ratingId}` }],
        }),

        /**
         * Actualizar una valoración
         * Backend: PUT /clients/ratings/{rating_id}
         */
        updateClientRating: builder.mutation<ClientRatingOut, { ratingId: number; data: ClientRatingUpdate }>({
            query: ({ ratingId, data }) => ({
                url: `/clients/ratings/${ratingId}`,
                method: "PUT",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (result, error, { ratingId }) => [
                { type: "Client", id: `Rating-${ratingId}` },
                { type: "Client", id: "LIST_WITH_METRICS" },
            ],
        }),

        /**
         * Eliminar (desactivar) una valoración
         * Backend: DELETE /clients/ratings/{rating_id}
         */
        deleteClientRating: builder.mutation<{ message: string }, number>({
            query: (ratingId) => ({
                url: `/clients/ratings/${ratingId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, ratingId) => [
                { type: "Client", id: `Rating-${ratingId}` },
                { type: "Client", id: "LIST_WITH_METRICS" },
            ],
        }),

        /**
         * Obtener estadísticas de clientes
         */
        getClientStats: builder.query<ClientStatsResponse, void>({
            query: () => ({
                url: "/clients/stats",
                method: "GET",
            }),
            providesTags: [{ type: "Client", id: "STATS" }],
        }),

        // ========================================
        // PROGRESS ENDPOINTS (Client Detail)
        // ========================================

        /**
         * Historial de progreso físico del cliente
         */
        getClientProgressHistory: builder.query<ClientProgress[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/progress/?client_id=${clientId}&skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `PROGRESS-${clientId}` },
            ],
        }),

        /**
         * Analytics de progreso (tendencias, cambios)
         */
        getProgressAnalytics: builder.query<ProgressAnalytics, number>({
            query: (clientId) => ({
                url: `/progress/analytics/${clientId}`,
                method: "GET",
            }),
            providesTags: (result, error, clientId) => [
                { type: "Client", id: `ANALYTICS-${clientId}` },
            ],
        }),

        /**
         * Tracking de ejercicios del cliente
         */
        getClientProgressTracking: builder.query<ProgressTracking[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/training-sessions/progress/client/${clientId}?skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `TRACKING-${clientId}` },
            ],
        }),

        /**
         * Crear registro de progreso del cliente
         */
        createProgressRecord: builder.mutation<ClientProgress, CreateClientProgressData>({
            query: (data) => ({
                url: "/progress/",
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, data) => [
                { type: "Client", id: `PROGRESS-${data.client_id}` },
                { type: "Client", id: `ANALYTICS-${data.client_id}` },
            ],
        }),

        /**
         * Actualizar registro de progreso existente
         * 
         * Endpoint: PUT /api/v1/progress/{progress_id}
         * Auth: require_trainer_or_admin
         * 
         * ⚠️ IMPORTANTE: Backend NO calcula IMC automáticamente en Update
         * El frontend DEBE calcularlo antes de enviar si peso y altura cambian
         * 
         * Invalidación:
         * - Invalida PROGRESS-{client_id} para refrescar lista
         * - Invalida ANALYTICS-{client_id} para refrescar gráficos
         * 
         * @param progressId - ID del registro a actualizar
         * @param data - Datos a actualizar (todos opcionales)
         * @returns ClientProgress actualizado
         * @throws HTTPException 404 si registro no existe
         * @since v4.4.0
         */
        updateProgressRecord: builder.mutation<
            ClientProgress,
            { progressId: number; data: UpdateClientProgressData }
        >({
            query: ({ progressId, data }) => ({
                url: `/progress/${progressId}`,
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: (result, error, { progressId, data }) => {
                // Invalidar cache del cliente asociado
                // client_id viene en el resultado del backend
                if (result) {
                    return [
                        { type: "Client", id: `PROGRESS-${result.client_id}` },
                        { type: "Client", id: `ANALYTICS-${result.client_id}` },
                    ];
                }
                return [];
            },
        }),

        // ========================================
        // TRAINING PLAN ENDPOINTS
        // ========================================

        /**
         * Training plans del cliente
         */
        getClientTrainingPlans: builder.query<TrainingPlan[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/training-plans/?client_id=${clientId}&skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `PLANS-${clientId}` },
            ],
        }),

        // ========================================
        // TRAINING SESSION ENDPOINTS
        // ========================================

        /**
         * Sesiones de entrenamiento del cliente
         */
        getClientTrainingSessions: builder.query<TrainingSession[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/training-sessions/?client_id=${clientId}&skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `SESSIONS-${clientId}` },
            ],
        }),

        /**
         * Feedback del cliente
         */
        getClientFeedback: builder.query<ClientFeedback[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/training-sessions/feedback/client/${clientId}?skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `FEEDBACK-${clientId}` },
            ],
        }),

        // ========================================
        // FATIGUE ENDPOINTS
        // ========================================

        /**
         * Análisis de fatiga del cliente
         */
        getClientFatigueAnalysis: builder.query<FatigueAnalysis[], { clientId: number; skip?: number; limit?: number }>({
            query: ({ clientId, skip = 0, limit = 100 }) => ({
                url: `/fatigue/clients/${clientId}/fatigue-analysis/?skip=${skip}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: `FATIGUE-${clientId}` },
            ],
        }),

        // ========================================
        // DASHBOARD KPI ENDPOINTS
        // ========================================

        /**
         * Obtener promedio de mejora de clientes
         * Endpoint: GET /api/v1/clients/improvement-avg
         */
        getClientImprovementAvg: builder.query<ClientImprovementResponse, void>({
            query: () => ({
                url: "/clients/improvement-avg",
                method: "GET",
            }),
            providesTags: [{ type: "Client", id: "DASHBOARD_KPI" }],
        }),

        /**
         * Obtener promedio de satisfacción de clientes
         * Endpoint: GET /api/v1/clients/satisfaction-avg
         */
        getClientSatisfactionAvg: builder.query<ClientSatisfactionResponse, void>({
            query: () => ({
                url: "/clients/satisfaction-avg",
                method: "GET",
            }),
            providesTags: [{ type: "Client", id: "DASHBOARD_KPI" }],
        }),

        /**
         * Obtener categorías de progreso de clientes
         * Endpoint: GET /api/v1/clients/progress-categories
         */
        getClientProgressCategories: builder.query<ProgressCategoriesResponse, void>({
            query: () => ({
                url: "/clients/progress-categories",
                method: "GET",
            }),
            providesTags: [{ type: "Client", id: "DASHBOARD_KPI" }],
        }),

        /**
         * Obtener analytics de coherencia diaria de un cliente
         * Endpoint: GET /api/v1/clients/{client_id}/coherence
         */
        getClientCoherence: builder.query<
            DailyCoherenceAnalyticsOut,
            {
                clientId: number;
                week?: string; // ISO week format (e.g., "2025-W03")
                periodStart?: string; // YYYY-MM-DD
                periodEnd?: string; // YYYY-MM-DD
                periodType?: "week" | "month" | "training_block" | "year";
            }
        >({
            query: ({ clientId, week, periodStart, periodEnd, periodType = "week" }) => {
                const params = new URLSearchParams();
                params.append("period_type", periodType);
                
                if (week) {
                    params.append("week", week);
                } else if (periodStart && periodEnd) {
                    params.append("period_start", periodStart);
                    params.append("period_end", periodEnd);
                }

                return {
                    url: `/clients/${clientId}/coherence?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: clientId },
                { type: "Client", id: "COHERENCE" },
            ],
        }),

        /**
         * Obtener resultados de tests físicos de un cliente
         * Endpoint: GET /api/v1/physical-tests/results?client_id={client_id}&category={category}
         */
        getClientTestResults: builder.query<
            PhysicalTestResultOut[],
            {
                clientId: number;
                category?: string;
                testId?: number;
            }
        >({
            query: ({ clientId, category, testId }) => {
                const params = new URLSearchParams();
                params.append("client_id", clientId.toString());
                if (category) {
                    params.append("category", category);
                }
                if (testId) {
                    params.append("test_id", testId.toString());
                }

                return {
                    url: `/physical-tests/results?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) => [
                { type: "Client", id: clientId },
                { type: "Client", id: "TESTS" },
            ],
        }),

        /**
         * Obtener definiciones de tests físicos
         * Endpoint: GET /api/v1/physical-tests/?category={category}
         */
        getPhysicalTests: builder.query<
            PhysicalTestOut[],
            {
                category?: string;
                isStandard?: boolean;
            }
        >({
            query: ({ category, isStandard }) => {
                const params = new URLSearchParams();
                if (category) {
                    params.append("category", category);
                }
                if (isStandard !== undefined) {
                    params.append("is_standard", isStandard.toString());
                }

                return {
                    url: `/physical-tests/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "PhysicalTest", id: "LIST" }],
        }),

        /**
         * Obtener resumen de tests del cliente
         * Endpoint: GET /api/v1/physical-tests/clients/{client_id}/summary
         */
        getClientTestingSummary: builder.query<ClientTestingSummary, number>({
            query: (clientId) => ({
                url: `/physical-tests/clients/${clientId}/summary`,
                method: "GET",
            }),
            providesTags: (result, error, clientId) => [
                { type: "Client", id: clientId },
                { type: "Client", id: "TESTING_SUMMARY" },
            ],
        }),

        /**
         * Crear resultado de test físico
         * Endpoint: POST /api/v1/physical-tests/results
         */
        createTestResult: builder.mutation<PhysicalTestResultOut, CreateTestResultData>({
            query: (data) => ({
                url: "/physical-tests/results",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { client_id }) => [
                { type: "Client", id: client_id },
                { type: "Client", id: "TESTS" },
                { type: "Client", id: "TESTING_SUMMARY" },
            ],
        }),

        /**
         * Actualizar resultado de test físico
         * Endpoint: PUT /api/v1/physical-tests/results/{result_id}
         */
        updateTestResult: builder.mutation<
            PhysicalTestResultOut,
            { resultId: number; data: UpdateTestResultData }
        >({
            query: ({ resultId, data }) => ({
                url: `/physical-tests/results/${resultId}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { resultId }) => [
                { type: "Client", id: "TESTS" },
                { type: "Client", id: "TESTING_SUMMARY" },
            ],
        }),

        /**
         * Eliminar resultado de test físico
         * Endpoint: DELETE /api/v1/physical-tests/results/{result_id}
         */
        deleteTestResult: builder.mutation<void, number>({
            query: (resultId) => ({
                url: `/physical-tests/results/${resultId}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Client", id: "TESTS" }, { type: "Client", id: "TESTING_SUMMARY" }],
        }),

        // ========================================
        // TRAINING PLAN ANALYTICS ENDPOINTS
        // ========================================

        /**
         * Obtener resumen anual del plan de entrenamiento del cliente
         * Endpoint: GET /api/v1/clients/{client_id}/training-plan/summary?year={year}&trainer_id={trainer_id}
         */
        getClientTrainingPlanSummary: builder.query<
            ClientTrainingPlanSummary,
            { clientId: number; year?: number; trainerId?: number }
        >({
            query: ({ clientId, year, trainerId }) => {
                const params = new URLSearchParams();
                if (year) params.append('year', year.toString());
                if (trainerId) params.append('trainer_id', trainerId.toString());
                const queryString = params.toString();
                return {
                    url: `/clients/${clientId}/training-plan/summary${queryString ? `?${queryString}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) => [
                { type: "Client" as const, id: clientId },
                { type: "TrainingPlanSummary" as const, id: "LIST" },
            ],
        }),

        /**
         * Obtener resumen mensual del plan de entrenamiento del cliente
         * Endpoint: GET /api/v1/clients/{client_id}/training-plan/monthly?year={year}&month={month}&week={week}&trainer_id={trainer_id}
         */
        getClientTrainingPlanMonthlySummary: builder.query<
            TrainingPlanMonthlySummary,
            { clientId: number; year?: number; month?: number; week?: number; trainerId?: number }
        >({
            query: ({ clientId, year, month, week, trainerId }) => {
                const params = new URLSearchParams();
                if (year) params.append('year', year.toString());
                if (month) params.append('month', month.toString());
                if (week) params.append('week', week.toString());
                if (trainerId) params.append('trainer_id', trainerId.toString());
                const queryString = params.toString();
                return {
                    url: `/clients/${clientId}/training-plan/monthly${queryString ? `?${queryString}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) => [
                { type: "Client" as const, id: clientId },
                { type: "TrainingPlanMonthlySummary" as const, id: "LIST" },
            ],
        }),

        /**
         * Obtener resumen semanal del plan de entrenamiento del cliente
         * Endpoint: GET /api/v1/clients/{client_id}/training-plan/weekly?week_start={date}&day={date}&trainer_id={trainer_id}
         */
        getClientTrainingPlanWeeklySummary: builder.query<
            TrainingPlanWeeklySummary,
            { clientId: number; weekStart?: string; day?: string; trainerId?: number }
        >({
            query: ({ clientId, weekStart, day, trainerId }) => {
                const params = new URLSearchParams();
                if (weekStart) params.append('week_start', weekStart);
                if (day) params.append('day', day);
                if (trainerId) params.append('trainer_id', trainerId.toString());
                const queryString = params.toString();
                return {
                    url: `/clients/${clientId}/training-plan/weekly${queryString ? `?${queryString}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { clientId }) => [
                { type: "Client" as const, id: clientId },
                { type: "TrainingPlanWeeklySummary" as const, id: "LIST" },
            ],
        }),

        /**
         * Obtener estadísticas de adherencia del plan de entrenamiento
         * Endpoint: GET /api/v1/training-plans/adherence-stats?trainer_id={trainer_id}
         */
        getTrainingPlanAdherenceStats: builder.query<
            PlanAdherenceStats,
            { trainerId?: number }
        >({
            query: ({ trainerId }) => {
                const params = new URLSearchParams();
                if (trainerId) params.append('trainer_id', trainerId.toString());
                const queryString = params.toString();
                return {
                    url: `/training-plans/adherence-stats${queryString ? `?${queryString}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "TrainingPlanAdherenceStats" as const, id: "LIST" }],
        }),

        /**
         * Obtener lista de clientes con métricas de fatiga, adherencia y satisfacción.
         * Búsqueda y filtrado server-side. status se enviará cuando el backend lo soporte (VISTA_CLIENTES_SPEC).
         * Endpoint: GET /api/v1/clients/with-metrics
         */
        getClientsWithMetrics: builder.query<
            ClientListWithMetricsResponse,
            GetClientsWithMetricsParams
        >({
            query: ({ page = 1, page_size = 15, search, trainer_id, status }) => {
                const params = new URLSearchParams();
                params.append("page", page.toString());
                params.append("page_size", page_size.toString());
                if (search != null && search.trim() !== "") {
                    params.append("search", search.trim());
                }
                if (trainer_id) {
                    params.append("trainer_id", trainer_id.toString());
                }
                if (status != null) {
                    params.append("status", status);
                }
                return {
                    url: `/clients/with-metrics?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Client", id: "LIST_WITH_METRICS" }],
        }),

        /**
         * Obtener actividad reciente del dashboard
         * Endpoint: GET /api/v1/clients/recent-activity
         */
        getRecentActivity: builder.query<
            RecentActivityResponse,
            { limit?: number; trainer_id?: number }
        >({
            query: ({ limit = 10, trainer_id }) => {
                const params = new URLSearchParams();
                params.append('limit', limit.toString());
                if (trainer_id) {
                    params.append('trainer_id', trainer_id.toString());
                }
                return {
                    url: `/clients/recent-activity?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Client", id: "RECENT_ACTIVITY" }],
        }),

    }),
    overrideExisting: false,
});

// ========================================
// Hooks auto-generados por RTK Query
// ========================================
export const {
    useGetTrainerClientsQuery,
    useGetClientsQuery,
    useGetClientQuery,
    useCreateClientMutation,
    usePreviewClientCalculationsMutation,
    useUpdateClientMutation,
    useDeleteClientMutation,
    useGetClientEquipmentQuery,
    useCreateClientEquipmentMutation,
    useUpdateClientEquipmentMutation,
    useDeleteClientEquipmentMutation,
    useCreateClientRatingMutation,
    useGetClientRatingsQuery,
    useGetClientRatingQuery,
    useUpdateClientRatingMutation,
    useDeleteClientRatingMutation,
    useGetClientStatsQuery,
    // Progress hooks
    useGetClientProgressHistoryQuery,
    useGetProgressAnalyticsQuery,
    useGetClientProgressTrackingQuery,
    useCreateProgressRecordMutation,
    useUpdateProgressRecordMutation,
    // Training hooks
    useGetClientTrainingPlansQuery,
    useGetClientTrainingSessionsQuery,
    useGetClientFeedbackQuery,
    // Fatigue hooks
    useGetClientFatigueAnalysisQuery,
    // Dashboard KPI hooks
    useGetClientImprovementAvgQuery,
    useGetClientSatisfactionAvgQuery,
    useGetClientProgressCategoriesQuery,
    // Coherence hooks
    useGetClientCoherenceQuery,
    // Testing hooks
    useGetClientTestResultsQuery,
    useGetPhysicalTestsQuery,
    useGetClientTestingSummaryQuery,
    useCreateTestResultMutation,
    useUpdateTestResultMutation,
    useDeleteTestResultMutation,
    // Training Plan Analytics hooks
    useGetClientTrainingPlanSummaryQuery,
    useGetClientTrainingPlanMonthlySummaryQuery,
    useGetClientTrainingPlanWeeklySummaryQuery,
    useGetTrainingPlanAdherenceStatsQuery,
    // Dashboard hooks
    useGetClientsWithMetricsQuery,
    useGetRecentActivityQuery,
} = clientsApi;