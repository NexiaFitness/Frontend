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
                
                // Agregar filtros si están presentes
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
    }),
    overrideExisting: false,
});

// Export hook
export const { useGetExercisesQuery } = exercisesListApi;

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

    // Query RTK Query con filtros y paginación
    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetExercisesQuery({
        skip: pagination.skip,
        limit: pagination.limit,
        ...filters,
    });

    // Memoizar lista de ejercicios
    const exercises = useMemo(() => {
        return data?.exercises ?? [];
    }, [data]);

    // Memoizar total
    const total = useMemo(() => {
        return data?.total ?? 0;
    }, [data]);

    /**
     * Actualizar filtros (merge parcial)
     * Resetea paginación a la primera página cuando cambian los filtros
     */
    const updateFilters = useCallback((newFilters: Partial<ExerciseFilters>) => {
        setFiltersState((prev: ExerciseFilters) => {
            const updated = { ...prev, ...newFilters };
            // Resetear paginación cuando cambian los filtros
            setPaginationState({ skip: 0, limit: pagination.limit });
            return updated;
        });
    }, [pagination.limit]);

    /**
     * Actualizar paginación
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
