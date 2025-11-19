/**
 * Hook para gestión de estadísticas de clientes
 * Consume endpoint GET /api/v1/clients/stats
 * Proporciona datos agregados para dashboard de trainers
 * Compatible con React Web y React Native
 * 
 * @author Frontend Team
 * @since v2.6.0
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useGetClientStatsQuery } from '../../api/clientsApi';
import type { RootState } from '../../store';
import type { ClientStatsResponse } from '../../types/clientStats';

/**
 * Hook de estadísticas de clientes
 * @returns Objeto con datos de stats, estado de loading/error y funciones
 */
export const useClientStats = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    
    // Query de RTK Query con auto-refetch
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetClientStatsQuery(undefined, {
        skip: !isAuthenticated,
        // Configuración de cache y refetch
        pollingInterval: 0, // Desactivar polling automático
        // ✅ FASE 1.2: Solo refetch si está autenticado
        refetchOnMountOrArgChange: isAuthenticated, // Refetch al montar componente
        refetchOnFocus: false, // No refetch al hacer focus en ventana
        refetchOnReconnect: isAuthenticated, // Refetch al reconectar
    });

    /**
     * Forzar recarga de estadísticas
     * Útil después de crear/actualizar/eliminar clientes
     */
    const refresh = useCallback(() => {
        refetch();
    }, [refetch]);

    /**
     * Verifica si hay datos disponibles
     */
    const hasData = useCallback((): boolean => {
        return data !== undefined && data !== null;
    }, [data]);

    /**
     * Obtiene el porcentaje de clientes activos formateado
     */
    const getActivePercentage = useCallback((): string => {
        if (!data) return '0%';
        return `${data.active_percentage.toFixed(1)}%`;
    }, [data]);

    /**
     * Obtiene el total de clientes
     */
    const getTotalClients = useCallback((): number => {
        return data?.total_clients ?? 0;
    }, [data]);

    /**
     * Obtiene clientes activos
     */
    const getActiveClients = useCallback((): number => {
        return data?.active_clients ?? 0;
    }, [data]);

    /**
     * Obtiene clientes inactivos
     */
    const getInactiveClients = useCallback((): number => {
        return data?.inactive_clients ?? 0;
    }, [data]);

    /**
     * Obtiene promedio de edad formateado
     */
    const getAverageAge = useCallback((): string => {
        if (!data) return '0';
        return data.avg_age.toFixed(1);
    }, [data]);

    /**
     * Obtiene promedio de BMI formateado
     */
    const getAverageBMI = useCallback((): string => {
        if (!data) return '0';
        return data.avg_bmi.toFixed(1);
    }, [data]);

    /**
     * Obtiene distribución por objetivo ordenada por cantidad
     */
    const getGoalDistribution = useCallback((): Array<{ label: string; count: number }> => {
        if (!data?.by_goal) return [];
        
        return Object.entries(data.by_goal)
            .map(([label, count]) => ({ 
                label, 
                count: count as number // ← FIX: Cast explícito
            }))
            .sort((a, b) => b.count - a.count);
    }, [data]);

    /**
     * Obtiene distribución por nivel de experiencia ordenada
     */
    const getExperienceDistribution = useCallback((): Array<{ label: string; count: number }> => {
        if (!data?.by_experience) return [];
        
        return Object.entries(data.by_experience)
            .map(([label, count]) => ({ 
                label, 
                count: count as number // ← FIX: Cast explícito
            }))
            .sort((a, b) => b.count - a.count);
    }, [data]);

    /**
     * Verifica si el usuario es admin (tiene stats adicionales)
     */
    const isAdminView = useCallback((): boolean => {
        return data?.total_trainers !== undefined;
    }, [data]);

    return {
        // Estado
        stats: data,
        isLoading,
        isFetching,
        isError,
        error,
        hasData: hasData(),
        
        // Métodos de recarga
        refresh,
        refetch,
        
        // Getters formateados
        getActivePercentage,
        getTotalClients,
        getActiveClients,
        getInactiveClients,
        getAverageAge,
        getAverageBMI,
        getGoalDistribution,
        getExperienceDistribution,
        
        // Utilidades
        isAdminView,
    };
};