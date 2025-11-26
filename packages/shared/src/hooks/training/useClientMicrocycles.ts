/**
 * useClientMicrocycles.ts — Hook para obtener microcycles de todos los planes de un cliente
 *
 * Contexto:
 * - Obtiene todos los microcycles disponibles de todos los planes activos de un cliente
 * - Usa endpoint optimizado getAllCycles para cada plan
 * - Combina resultados en formato útil para selectores
 * - Cross-platform (sin dependencias del DOM)
 * - Limita a primeros 10 planes para evitar demasiadas queries simultáneas
 *
 * Uso:
 * ```tsx
 * const { microcycles, isLoading, isError } = useClientMicrocycles({ clientId: 1 });
 * ```
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import { useMemo } from "react";
import { useGetTrainingPlansQuery, useGetAllCyclesQuery } from "../../api/trainingPlansApi";

export interface ClientMicrocycleOption {
    id: number;
    name: string;
    planId: number;
    planName: string;
    mesocycleId: number;
    startDate: string;
    endDate: string;
}

interface UseClientMicrocyclesParams {
    clientId: number;
    maxPlans?: number; // Límite de planes a procesar (default: 10)
}

interface UseClientMicrocyclesResult {
    microcycles: ClientMicrocycleOption[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}

/**
 * Hook para obtener todos los microcycles de los planes de un cliente
 * 
 * Nota: Limita a los primeros N planes (default: 10) para evitar demasiadas
 * queries simultáneas. Si un cliente tiene más planes, solo se procesarán los primeros.
 */
export const useClientMicrocycles = ({
    clientId,
    maxPlans = 10,
}: UseClientMicrocyclesParams): UseClientMicrocyclesResult => {
    // Obtener planes del cliente
    const {
        data: trainingPlans = [],
        isLoading: isLoadingPlans,
        isError: isErrorPlans,
        error: errorPlans,
    } = useGetTrainingPlansQuery(
        { client_id: clientId, limit: 100 },
        { skip: !clientId }
    );

    // Filtrar solo planes activos y limitar a primeros N planes
    const limitedPlans = useMemo(() => {
        // Incluir planes que estén activos (is_active !== false) y tengan status "active" o sin status
        const activePlans = trainingPlans.filter(
            (plan) => plan.is_active !== false && (plan.status === "active" || !plan.status || plan.status === "")
        );
        return activePlans.slice(0, maxPlans);
    }, [trainingPlans, maxPlans]);

    // Obtener cycles de cada plan usando queries condicionales
    // Nota: React no permite hooks en loops, por lo que creamos queries estáticas
    // hasta el límite máximo. Esto es aceptable porque la mayoría de clientes
    // tienen menos de 10 planes activos simultáneamente.
    const plan1Query = useGetAllCyclesQuery(limitedPlans[0]?.id ?? 0, {
        skip: !limitedPlans[0]?.id,
    });
    const plan2Query = useGetAllCyclesQuery(limitedPlans[1]?.id ?? 0, {
        skip: !limitedPlans[1]?.id,
    });
    const plan3Query = useGetAllCyclesQuery(limitedPlans[2]?.id ?? 0, {
        skip: !limitedPlans[2]?.id,
    });
    const plan4Query = useGetAllCyclesQuery(limitedPlans[3]?.id ?? 0, {
        skip: !limitedPlans[3]?.id,
    });
    const plan5Query = useGetAllCyclesQuery(limitedPlans[4]?.id ?? 0, {
        skip: !limitedPlans[4]?.id,
    });
    const plan6Query = useGetAllCyclesQuery(limitedPlans[5]?.id ?? 0, {
        skip: !limitedPlans[5]?.id,
    });
    const plan7Query = useGetAllCyclesQuery(limitedPlans[6]?.id ?? 0, {
        skip: !limitedPlans[6]?.id,
    });
    const plan8Query = useGetAllCyclesQuery(limitedPlans[7]?.id ?? 0, {
        skip: !limitedPlans[7]?.id,
    });
    const plan9Query = useGetAllCyclesQuery(limitedPlans[8]?.id ?? 0, {
        skip: !limitedPlans[8]?.id,
    });
    const plan10Query = useGetAllCyclesQuery(limitedPlans[9]?.id ?? 0, {
        skip: !limitedPlans[9]?.id,
    });

    // Combinar todas las queries en un array
    const planQueries = useMemo(
        () => [
            plan1Query,
            plan2Query,
            plan3Query,
            plan4Query,
            plan5Query,
            plan6Query,
            plan7Query,
            plan8Query,
            plan9Query,
            plan10Query,
        ],
        [
            plan1Query,
            plan2Query,
            plan3Query,
            plan4Query,
            plan5Query,
            plan6Query,
            plan7Query,
            plan8Query,
            plan9Query,
            plan10Query,
        ]
    );

    // Extraer microcycles de todos los planes
    const microcycles = useMemo(() => {
        const result: ClientMicrocycleOption[] = [];

        if (limitedPlans.length === 0) {
            return result;
        }

        limitedPlans.forEach((plan, index) => {
            const query = planQueries[index];
            
            // Verificar que la query tiene datos y no está en error
            if (query?.data && !query.isError) {
                const cyclesData = query.data;
                
                // Verificar que microcycles existe y es un array
                if (cyclesData.microcycles && Array.isArray(cyclesData.microcycles) && cyclesData.microcycles.length > 0) {
                    cyclesData.microcycles.forEach((microcycle) => {
                        // Solo incluir microcycles activos (is_active puede ser true o undefined/null)
                        if (microcycle.is_active !== false) {
                            result.push({
                                id: microcycle.id,
                                name: microcycle.name,
                                planId: plan.id,
                                planName: plan.name,
                                mesocycleId: microcycle.mesocycle_id,
                                startDate: microcycle.start_date,
                                endDate: microcycle.end_date,
                            });
                        }
                    });
                }
            } else if (query?.isError) {
                // Log error para debugging (solo en desarrollo)
                if (process.env.NODE_ENV !== 'production') {
                    console.warn(`[useClientMicrocycles] Error loading cycles for plan ${plan.id}:`, query.error);
                }
            }
        });

        // Ordenar por fecha de inicio (más recientes primero)
        return result.sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateB - dateA;
        });
    }, [limitedPlans, planQueries]);

    // Calcular estados combinados
    const isLoading = isLoadingPlans || planQueries.some((q) => q.isLoading);
    const isError = isErrorPlans || planQueries.some((q) => q.isError);
    const error = errorPlans || planQueries.find((q) => q.error)?.error;

    // Debug logging (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production' && clientId) {
        if (!isLoading && !isLoadingPlans) {
            const hasData = planQueries.some((q) => q.data);
            const hasErrors = planQueries.some((q) => q.isError);
            const queriesLoading = planQueries.filter((q) => q.isLoading).length;
            
            // Log siempre para debugging
            console.log('[useClientMicrocycles] Debug info:', {
                clientId,
                plansCount: trainingPlans.length,
                activePlansCount: limitedPlans.length,
                planIds: limitedPlans.map((p) => p.id),
                queriesWithData: planQueries.filter((q) => q.data).length,
                queriesWithErrors: planQueries.filter((q) => q.isError).length,
                queriesLoading,
                microcyclesFound: microcycles.length,
                planQueriesDetails: limitedPlans.map((plan, idx) => ({
                    planId: plan.id,
                    planName: plan.name,
                    hasData: !!planQueries[idx]?.data,
                    isLoading: planQueries[idx]?.isLoading,
                    isError: planQueries[idx]?.isError,
                    microcyclesCount: planQueries[idx]?.data?.microcycles?.length || 0,
                })),
            });
        }
    }

    return {
        microcycles,
        isLoading,
        isError,
        error,
    };
};

