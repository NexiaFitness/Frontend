/**
 * useExercises.ts — Hook para gestión de ejercicios (catálogo y filtros).
 * 
 * Propósito: Encapsula la lógica de filtros, búsqueda, paginación y estado
 * para el módulo "Exercise Database Browser". Basado en RTK Query y types estrictos.
 *
 * Contexto: Lógica compartida cross-platform (web y mobile).
 * Dependencias: exercisesApi.ts, types/exercise.ts
 * 
 * Notas de mantenimiento:
 * - No usar side-effects fuera del control de React.
 * - Optimizado para re-render mínimo.
 * - Compatible con Session Programming (futuro uso).
 *
 * @author Frontend Team
 * @since v4.8.0
 */

import { useState, useMemo, useCallback } from "react";
import { useGetExercisesQuery } from "../../api/exercisesApi";
import type { Exercise, ExerciseFilters, ExerciseListResponse } from "../../types/exercise";

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
 * setFilters({ muscle_group: MUSCLE_GROUP_ENUM.CHEST });
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
        filters,
    });

    // Memoizar lista de ejercicios
    const exercises = useMemo(() => {
        return data?.items ?? [];
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
        setFiltersState((prev) => {
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

