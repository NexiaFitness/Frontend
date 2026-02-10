/**
 * useExercises.ts — Hook para gestión de ejercicios con filtros y paginación
 *
 * PROPÓSITO:
 * - Encapsula la lógica de filtros, búsqueda y paginación para el módulo Exercises
 * - Integración con backend /api/v1/exercises/ (módulo legacy que todavía existe)
 * - Preparado para migración futura al Exercise Catalog
 *
 * CONTEXTO:
 * - Backend: Módulo /exercises/ todavía existe y funciona
 * - Endpoint: GET /exercises/ con filtros (tipo, categoria, nivel, equipo, patron_movimiento, tipo_carga, search)
 * - Response: ExerciseListResponse con exercises[], total, skip, limit, has_more
 * - Este hook mantiene compatibilidad mientras se migra al Exercise Catalog
 *
 * NOTAS DE MANTENIMIENTO:
 * - No usar side-effects fuera del control de React
 * - Optimizado para re-render mínimo
 * - Compatible con Session Programming
 * - Los tipos Exercise, ExerciseFilters, ExerciseListResponse son temporales para el módulo legacy
 *
 * @author Nelson / NEXIA Team
 * @since v5.0.0 (Exercise Catalog Migration - Phase 1)
 */

import { useState, useMemo, useCallback } from "react";
import { baseApi } from "../../api/baseApi";

// ========================================
// TIPOS TEMPORALES PARA MÓDULO EXERCISES LEGACY
// ========================================
// NOTA: Estos tipos representan el schema del módulo /exercises/ que todavía existe
// Se mantendrán hasta que se complete la migración al Exercise Catalog

/**
 * Exercise - Ejercicio del módulo legacy /exercises/
 * Backend schema: ExerciseOut (backend/app/schemas.py)
 */
export interface Exercise {
    id: number;
    exercise_id: string; // String único del ejercicio
    nombre: string;
    nombre_ingles: string | null;
    tipo: string;
    categoria: string;
    nivel: string;
    equipo: string;
    patron_movimiento: string;
    tipo_carga: string;
    musculatura_principal: string; // Comma-separated string
    musculatura_secundaria: string | null; // Comma-separated string
    descripcion: string | null;
    instrucciones: string | null;
    notas: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}

/**
 * ExerciseFilters - Filtros para búsqueda de ejercicios
 * Backend query params: skip, limit, tipo?, categoria?, nivel?, equipo?, patron_movimiento?, tipo_carga?, search?
 */
export interface ExerciseFilters {
    tipo?: string;
    categoria?: string;
    nivel?: string;
    equipo?: string;
    patron_movimiento?: string;
    tipo_carga?: string;
    search?: string;
    /** Filtro por IDs de grupo muscular (usa mapping tables, mas preciso que search) */
    muscle_group_ids?: number[];
    /** Filtro por IDs de equipamiento (usa mapping tables) */
    equipment_ids?: number[];
}

/**
 * ExerciseListResponse - Respuesta de GET /exercises/
 * Backend schema: ExerciseListResponse
 */
export interface ExerciseListResponse {
    exercises: Exercise[];
    total: number;
    skip: number;
    limit: number;
    has_more: boolean;
}

/**
 * ExerciseCreate - POST /exercises/
 * Backend schema: ExerciseCreate (ExerciseBase)
 */
export interface ExerciseCreate {
    exercise_id: string;
    nombre: string;
    nombre_ingles?: string | null;
    tipo: string;
    categoria: string;
    nivel: string;
    equipo: string;
    patron_movimiento: string;
    tipo_carga: string;
    musculatura_principal: string;
    musculatura_secundaria?: string | null;
    laterality?: string | null;
    training_intent?: string | null;
    cardio_type?: string | null;
    descripcion?: string | null;
    instrucciones?: string | null;
    notas?: string | null;
}

/**
 * ExerciseUpdate - PUT /exercises/{id}
 * Backend schema: ExerciseUpdate (all optional)
 */
export interface ExerciseUpdate {
    exercise_id?: string;
    nombre?: string;
    nombre_ingles?: string | null;
    tipo?: string;
    categoria?: string;
    nivel?: string;
    equipo?: string;
    patron_movimiento?: string;
    tipo_carga?: string;
    musculatura_principal?: string;
    musculatura_secundaria?: string | null;
    laterality?: string | null;
    training_intent?: string | null;
    cardio_type?: string | null;
    descripcion?: string | null;
    instrucciones?: string | null;
    notas?: string | null;
}

/**
 * Estado de paginación
 */
interface PaginationState {
    skip: number;
    limit: number;
}

/**
 * Resultado del hook useExercises
 */
export interface UseExercisesResult {
    /** Lista de ejercicios actual */
    exercises: Exercise[];
    /** Número total de ejercicios (según filtros) */
    total: number;
    /** Filtros actuales aplicados */
    filters: ExerciseFilters;
    /** Función para actualizar filtros (merge parcial) */
    setFilters: (newFilters: Partial<ExerciseFilters>) => void;
    /** Estado de paginación actual */
    pagination: PaginationState;
    /** Función para actualizar paginación */
    setPagination: (skip: number, limit: number) => void;
    /** Estado de carga inicial */
    isLoading: boolean;
    /** Estado de error */
    isError: boolean;
    /** Función para refetch manual */
    refetch: () => void;
}

/**
 * Query params para GET /exercises/
 */
interface GetExercisesParams {
    skip?: number;
    limit?: number;
    tipo?: string;
    categoria?: string;
    nivel?: string;
    equipo?: string;
    patron_movimiento?: string;
    tipo_carga?: string;
    search?: string;
    muscle_group_ids?: number[];
    equipment_ids?: number[];
}

// ========================================
// RTK QUERY ENDPOINT
// ========================================

/**
 * Endpoint RTK Query para obtener ejercicios
 * Backend: GET /exercises/
 */
const exercisesListApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getExercises: builder.query<ExerciseListResponse, GetExercisesParams>({
            query: ({ skip = 0, limit = 100, ...filters }) => {
                const params = new URLSearchParams();
                params.append('skip', skip.toString());
                params.append('limit', limit.toString());
                
                if (filters.tipo) {
                    params.append('tipo', filters.tipo);
                }
                if (filters.categoria) {
                    params.append('categoria', filters.categoria);
                }
                if (filters.nivel) {
                    params.append('nivel', filters.nivel);
                }
                if (filters.equipo) {
                    params.append('equipo', filters.equipo);
                }
                if (filters.patron_movimiento) {
                    params.append('patron_movimiento', filters.patron_movimiento);
                }
                if (filters.tipo_carga) {
                    params.append('tipo_carga', filters.tipo_carga);
                }
                if (filters.search) {
                    params.append('search', filters.search);
                }
                // Filtros por mapping tables (IDs)
                if (filters.muscle_group_ids?.length) {
                    for (const id of filters.muscle_group_ids) {
                        params.append('muscle_group_ids', id.toString());
                    }
                }
                if (filters.equipment_ids?.length) {
                    for (const id of filters.equipment_ids) {
                        params.append('equipment_ids', id.toString());
                    }
                }

                return {
                    url: `/exercises/?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: (result) =>
                result?.exercises
                    ? [
                        ...result.exercises.map(({ id }) => ({ type: "Exercise" as const, id })),
                        { type: "Exercise", id: "LIST" },
                    ]
                    : [{ type: "Exercise", id: "LIST" }],
        }),
        getExerciseById: builder.query<Exercise, number>({
            query: (id) => ({
                url: `/exercises/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Exercise" as const, id }],
        }),
        createExercise: builder.mutation<Exercise, ExerciseCreate>({
            query: (body) => ({
                url: "/exercises/",
                method: "POST",
                body,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: [{ type: "Exercise", id: "LIST" }],
        }),
        updateExercise: builder.mutation<Exercise, { exerciseId: number; data: ExerciseUpdate }>({
            query: ({ exerciseId, data }) => ({
                url: `/exercises/${exerciseId}`,
                method: "PUT",
                body: data,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: (result, error, { exerciseId }) => [
                { type: "Exercise", id: exerciseId },
                { type: "Exercise", id: "LIST" },
            ],
        }),
        deleteExercise: builder.mutation<void, number>({
            query: (exerciseId) => ({
                url: `/exercises/${exerciseId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, exerciseId) => [
                { type: "Exercise", id: exerciseId },
                { type: "Exercise", id: "LIST" },
            ],
        }),
    }),
    overrideExisting: false,
});

// Export hooks
export const {
    useGetExercisesQuery,
    useGetExerciseByIdQuery,
    useCreateExerciseMutation,
    useUpdateExerciseMutation,
    useDeleteExerciseMutation,
} = exercisesListApi;

// ========================================
// HOOK PRINCIPAL
// ========================================

/**
 * Hook para gestión de ejercicios con filtros y paginación
 *
 * @returns Estado y funciones para gestionar ejercicios
 *
 * @example
 * ```tsx
 * const {
 *   exercises,
 *   total,
 *   filters,
 *   setFilters,
 *   pagination,
 *   setPagination,
 *   isLoading,
 *   refetch
 * } = useExercises();
 *
 * // Aplicar filtro
 * setFilters({ nivel: "intermediate" });
 *
 * // Cambiar página
 * setPagination(20, 20);
 * ```
 */
export function useExercises(): UseExercisesResult {
    // Estado local de filtros
    const [filters, setFiltersState] = useState<ExerciseFilters>({});
    
    // Estado local de paginación
    const [pagination, setPaginationState] = useState<PaginationState>({
        skip: 0,
        limit: 20,
    });

    // Argumentos estables: evita bucle de re-renders (RTK Query recibe nueva referencia cada vez si no)
    const queryArgs = useMemo(
        () => ({
            skip: pagination.skip,
            limit: pagination.limit,
            ...filters,
        }),
        [pagination.skip, pagination.limit, filters]
    );

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetExercisesQuery(queryArgs);

    // Memoizar lista de ejercicios
    const exercises = useMemo(() => {
        return data?.exercises ?? [];
    }, [data]);

    // Memoizar total
    const total = useMemo(() => {
        return data?.total ?? 0;
    }, [data]);

    /**
     * Actualizar filtros (merge parcial).
     * Resetea paginación a la primera página cuando cambian los filtros.
     * Sin side-effects dentro del updater de setState.
     */
    const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
        setPaginationState((prev) => ({ ...prev, skip: 0 }));
    }, []);

    /**
     * Actualizar paginación (skip y limit).
     */
    const updatePagination = useCallback((skip: number, limit: number) => {
        setPaginationState({ skip, limit });
    }, []);

    return {
        exercises,
        total,
        filters,
        setFilters: updateFilters,
        pagination,
        setPagination: updatePagination,
        isLoading,
        isError,
        refetch,
    };
}
