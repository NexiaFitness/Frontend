/**
 * exercisesApi.ts — API RTK Query para Exercise Catalog
 *
 * PROPÓSITO:
 * - Endpoints GET para Reference Tables del Exercise Catalog
 * - Movement Patterns, Muscle Groups, Equipment, Tags, Actions
 * - Integración con backend /api/v1/exercise-catalog/*
 *
 * CONTEXTO:
 * - Backend: ~90 endpoints implementados en /exercise-catalog/*
 * - Fase 1: Solo endpoints GET (10 hooks)
 * - Fase 2: Variants (opcional, skip por ahora)
 * - Fase 3: POST/PUT/DELETE mutations (futuro)
 * - Fase 4: Mappings endpoints (futuro)
 *
 * NOTAS DE MANTENIMIENTO:
 * - Query params default: skip=0, limit=100
 * - is_active es opcional (boolean | undefined)
 * - URLs exactas del backend: /exercise-catalog/movement-patterns/, etc.
 * - providesTags para cache invalidation correcto
 * - Sin usar `any`, strict TypeScript
 *
 * @author Nelson / NEXIA Team
 * @since v5.0.0 (Exercise Catalog - Phase 1: GET Endpoints)
 */

import { baseApi } from "./baseApi";
import type {
    MovementPattern,
    MuscleGroup,
    Equipment,
    Tag,
    Action,
    CatalogQueryParams,
} from "../types/exercise";

export const exercisesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========================================
        // MOVEMENT PATTERNS
        // ========================================

        /**
         * Obtener lista de patrones de movimiento
         * Backend: GET /exercise-catalog/movement-patterns/
         * Query params: skip, limit, is_active?
         */
        getMovementPatterns: builder.query<MovementPattern[], CatalogQueryParams>({
            query: ({ skip = 0, limit = 100, is_active } = {}) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                if (is_active !== undefined) {
                    params.append('is_active', is_active.toString());
                }
                return {
                    url: `/exercise-catalog/movement-patterns/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "MovementPattern", id: "LIST" }],
        }),

        /**
         * Obtener patrón de movimiento específico por ID
         * Backend: GET /exercise-catalog/movement-patterns/{id}
         */
        getMovementPattern: builder.query<MovementPattern, number>({
            query: (id) => ({
                url: `/exercise-catalog/movement-patterns/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "MovementPattern", id }],
        }),

        // ========================================
        // MUSCLE GROUPS
        // ========================================

        /**
         * Obtener lista de grupos musculares
         * Backend: GET /exercise-catalog/muscle-groups/
         * Query params: skip, limit, is_active?
         */
        getMuscleGroups: builder.query<MuscleGroup[], CatalogQueryParams>({
            query: ({ skip = 0, limit = 100, is_active } = {}) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                if (is_active !== undefined) {
                    params.append('is_active', is_active.toString());
                }
                return {
                    url: `/exercise-catalog/muscle-groups/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "MuscleGroup", id: "LIST" }],
        }),

        /**
         * Obtener grupo muscular específico por ID
         * Backend: GET /exercise-catalog/muscle-groups/{id}
         */
        getMuscleGroup: builder.query<MuscleGroup, number>({
            query: (id) => ({
                url: `/exercise-catalog/muscle-groups/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "MuscleGroup", id }],
        }),

        // ========================================
        // EQUIPMENT
        // ========================================

        /**
         * Obtener lista de equipamiento
         * Backend: GET /exercise-catalog/equipment/
         * Query params: skip, limit, is_active?
         */
        getEquipment: builder.query<Equipment[], CatalogQueryParams>({
            query: ({ skip = 0, limit = 100, is_active } = {}) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                if (is_active !== undefined) {
                    params.append('is_active', is_active.toString());
                }
                return {
                    url: `/exercise-catalog/equipment/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Equipment", id: "LIST" }],
        }),

        /**
         * Obtener equipamiento específico por ID
         * Backend: GET /exercise-catalog/equipment/{id}
         */
        getEquipmentById: builder.query<Equipment, number>({
            query: (id) => ({
                url: `/exercise-catalog/equipment/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Equipment", id }],
        }),

        // ========================================
        // TAGS
        // ========================================

        /**
         * Obtener lista de etiquetas
         * Backend: GET /exercise-catalog/tags/
         * Query params: skip, limit, is_active?
         */
        getTags: builder.query<Tag[], CatalogQueryParams>({
            query: ({ skip = 0, limit = 100, is_active } = {}) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                if (is_active !== undefined) {
                    params.append('is_active', is_active.toString());
                }
                return {
                    url: `/exercise-catalog/tags/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Tag", id: "LIST" }],
        }),

        /**
         * Obtener etiqueta específica por ID
         * Backend: GET /exercise-catalog/tags/{id}
         */
        getTag: builder.query<Tag, number>({
            query: (id) => ({
                url: `/exercise-catalog/tags/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Tag", id }],
        }),

        // ========================================
        // ACTIONS (Joint Movements)
        // ========================================

        /**
         * Obtener lista de acciones articulares (Joint Movements)
         * Backend: GET /exercise-catalog/actions/
         * Query params: skip, limit, is_active?
         */
        getActions: builder.query<Action[], CatalogQueryParams>({
            query: ({ skip = 0, limit = 100, is_active } = {}) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                if (is_active !== undefined) {
                    params.append('is_active', is_active.toString());
                }
                return {
                    url: `/exercise-catalog/actions/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: [{ type: "Action", id: "LIST" }],
        }),

        /**
         * Obtener acción articular específica por ID
         * Backend: GET /exercise-catalog/actions/{id}
         */
        getAction: builder.query<Action, number>({
            query: (id) => ({
                url: `/exercise-catalog/actions/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Action", id }],
        }),
    }),
    overrideExisting: false,
});

// ========================================
// Hooks auto-generados por RTK Query
// ========================================
export const {
    useGetMovementPatternsQuery,
    useGetMovementPatternQuery,
    useGetMuscleGroupsQuery,
    useGetMuscleGroupQuery,
    useGetEquipmentQuery,
    useGetEquipmentByIdQuery,
    useGetTagsQuery,
    useGetTagQuery,
    useGetActionsQuery,
    useGetActionQuery,
} = exercisesApi;
