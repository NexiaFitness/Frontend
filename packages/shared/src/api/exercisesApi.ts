/**
 * API de gestión de ejercicios usando RTK Query
 * Define endpoints para obtener ejercicios: getExercises, getExerciseById, filtros por músculo/equipamiento/nivel
 * 
 * @author Frontend Team
 * @since v4.8.0
 */

import { baseApi } from "./baseApi";
import type {
    Exercise,
    ExerciseListResponse,
    ExerciseFilters,
    ExerciseStats,
} from "../types/exercise";

export const exercisesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Obtener lista de ejercicios con filtros y paginación
         * Backend: GET /exercises/
         * Query params: skip, limit, muscle_group?, equipment?, level?
         */
        getExercises: builder.query<ExerciseListResponse, { skip?: number; limit?: number; filters?: ExerciseFilters }>({
            query: ({ skip = 0, limit = 100, filters = {} }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                
                // Agregar filtros si están presentes
                if (filters.muscle_group) {
                    params.append('muscle_group', filters.muscle_group);
                }
                if (filters.equipment) {
                    params.append('equipment', filters.equipment);
                }
                if (filters.level) {
                    params.append('level', filters.level);
                }
                if (filters.search) {
                    params.append('search', filters.search);
                }

                return {
                    url: `/exercises/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: "Exercise" as const, id })),
                        { type: "Exercise", id: "LIST" },
                    ]
                    : [{ type: "Exercise", id: "LIST" }],
        }),

        /**
         * Obtener ejercicio específico por ID
         * Backend: GET /exercises/{id}
         */
        getExerciseById: builder.query<Exercise, number>({
            query: (id) => ({
                url: `/exercises/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Exercise", id }],
        }),

        /**
         * Obtener ejercicios por grupo muscular
         * Backend: GET /exercises/by-muscle-group/{id}
         */
        getExercisesByMuscle: builder.query<ExerciseListResponse, { muscleGroupId: string; skip?: number; limit?: number }>({
            query: ({ muscleGroupId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/exercises/by-muscle-group/${muscleGroupId}?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { muscleGroupId }) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: "Exercise" as const, id })),
                        { type: "Exercise", id: `MUSCLE-${muscleGroupId}` },
                    ]
                    : [{ type: "Exercise", id: `MUSCLE-${muscleGroupId}` }],
        }),

        /**
         * Obtener ejercicios por equipamiento
         * Backend: GET /exercises/by-equipment/{id}
         */
        getExercisesByEquipment: builder.query<ExerciseListResponse, { equipmentId: string; skip?: number; limit?: number }>({
            query: ({ equipmentId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/exercises/by-equipment/${equipmentId}?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { equipmentId }) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: "Exercise" as const, id })),
                        { type: "Exercise", id: `EQUIPMENT-${equipmentId}` },
                    ]
                    : [{ type: "Exercise", id: `EQUIPMENT-${equipmentId}` }],
        }),

        /**
         * Obtener ejercicios por nivel
         * Backend: GET /exercises/by-level/{id}
         */
        getExercisesByLevel: builder.query<ExerciseListResponse, { levelId: string; skip?: number; limit?: number }>({
            query: ({ levelId, skip = 0, limit = 100 }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());

                return {
                    url: `/exercises/by-level/${levelId}?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result, error, { levelId }) =>
                result?.items
                    ? [
                        ...result.items.map(({ id }) => ({ type: "Exercise" as const, id })),
                        { type: "Exercise", id: `LEVEL-${levelId}` },
                    ]
                    : [{ type: "Exercise", id: `LEVEL-${levelId}` }],
        }),

        /**
         * Obtener estadísticas de ejercicios
         * Backend: GET /exercises/stats/summary
         */
        getExerciseStats: builder.query<ExerciseStats, void>({
            query: () => ({
                url: "/exercises/stats/summary",
                method: "GET",
            }),
            providesTags: [{ type: "Exercise", id: "STATS" }],
        }),

    }),
    overrideExisting: false,
});

// ========================================
// Hooks auto-generados por RTK Query
// ========================================
export const {
    useGetExercisesQuery,
    useGetExerciseByIdQuery,
    useGetExercisesByMuscleQuery,
    useGetExercisesByEquipmentQuery,
    useGetExercisesByLevelQuery,
    useGetExerciseStatsQuery,
} = exercisesApi;

