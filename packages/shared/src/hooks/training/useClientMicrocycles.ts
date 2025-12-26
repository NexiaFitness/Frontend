/**
 * useClientMicrocycles.ts — Hook para obtener microcycles de todos los planes de un cliente
 *
 * Contexto:
 * - Obtiene todos los microcycles disponibles de todos los planes activos de un cliente
 * - Usa endpoint batch optimizado para obtener cycles de múltiples planes en un solo request
 * - Combina resultados en formato útil para selectores
 * - Cross-platform (sin dependencias del DOM)
 * - Limita a primeros N planes (default: 10) para evitar demasiados datos
 *
 * Uso:
 * ```tsx
 * const { microcycles, isLoading, isError } = useClientMicrocycles({ clientId: 1 });
 * ```
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v2.0.0 - Refactorizado para usar endpoint batch
 */

import { useMemo, useRef } from "react";
import { useGetTrainingPlansQuery, useGetBatchCyclesQuery } from "../../api/trainingPlansApi";
import type { TrainingPlan } from "../../types/training";

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
 * Usa endpoint batch para obtener cycles de múltiples planes en un solo request.
 * Limita a los primeros N planes (default: 10) para evitar demasiados datos.
 */
export const useClientMicrocycles = ({
    clientId,
    maxPlans = 10,
}: UseClientMicrocyclesParams): UseClientMicrocyclesResult => {
    // Obtener planes del cliente
    const {
        data: trainingPlansData,
        isLoading: isLoadingPlans,
        isError: isErrorPlans,
        error: errorPlans,
    } = useGetTrainingPlansQuery(
        { client_id: clientId, limit: 100 },
        { skip: !clientId }
    );

    const trainingPlans = trainingPlansData ?? [];

    // Estabilizar limitedPlans usando comparación de IDs para evitar recálculos innecesarios
    const previousPlanIdsRef = useRef<number[]>([]);
    const limitedPlans = useMemo(() => {
        // Filtrar planes activos
        const activePlans = trainingPlans.filter(
            (plan) =>
                plan.is_active !== false &&
                (plan.status === "active" || !plan.status || plan.status === "")
        );

        // Limitar a primeros N planes
        const limited = activePlans.slice(0, maxPlans);

        // Comparar IDs para estabilizar (solo actualizar si los IDs cambian)
        const currentPlanIds = limited.map((p) => p.id).sort();
        const previousPlanIds = previousPlanIdsRef.current.sort();

        if (
            currentPlanIds.length !== previousPlanIds.length ||
            !currentPlanIds.every((id, idx) => id === previousPlanIds[idx])
        ) {
            previousPlanIdsRef.current = currentPlanIds;
        }

        return limited;
    }, [trainingPlans, maxPlans]);

    // Extraer IDs de planes activos (estable)
    const activePlanIds = useMemo(() => {
        return limitedPlans.map((plan) => plan.id);
    }, [limitedPlans]);

    // Crear mapa de planId -> plan para lookup rápido
    const plansMap = useMemo(() => {
        const map = new Map<number, TrainingPlan>();
        limitedPlans.forEach((plan) => {
            map.set(plan.id, plan);
        });
        return map;
    }, [limitedPlans]);

    // Batch query para obtener todos los cycles de una vez
    const {
        data: batchCyclesData,
        isLoading: isLoadingCycles,
        isError: isErrorCycles,
        error: cyclesError,
    } = useGetBatchCyclesQuery(
        { plan_ids: activePlanIds },
        { skip: activePlanIds.length === 0 }
    );

    // Extraer microcycles de todos los planes y mapear a ClientMicrocycleOption
    const microcycles = useMemo(() => {
        if (!batchCyclesData?.cycles) {
            return [];
        }

        const result: ClientMicrocycleOption[] = [];

        // Iterar sobre cada plan en los resultados
        Object.entries(batchCyclesData.cycles).forEach(([planIdStr, cycles]) => {
            const planId = Number(planIdStr);
            const plan = plansMap.get(planId);

            // Si el plan no está en el mapa, saltarlo (no debería pasar)
            if (!plan) {
                return;
            }

            // Extraer microcycles de este plan
            if (cycles.microcycles && Array.isArray(cycles.microcycles)) {
                cycles.microcycles.forEach((microcycle) => {
                    // Solo incluir microcycles activos
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
        });

        // Ordenar por fecha de inicio (más recientes primero)
        return result.sort((a, b) => {
            const dateA = new Date(a.startDate).getTime();
            const dateB = new Date(b.startDate).getTime();
            return dateB - dateA;
        });
    }, [batchCyclesData?.cycles, plansMap]);

    // Log errores del batch (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production' && batchCyclesData?.errors) {
        const errorEntries = Object.entries(batchCyclesData.errors);
        if (errorEntries.length > 0) {
            console.warn(
                '[useClientMicrocycles] Errors from batch query:',
                errorEntries.map(([planId, error]) => ({
                    planId: Number(planId),
                    error,
                }))
            );
        }
    }

    // Calcular estados combinados
    const isLoading = isLoadingPlans || isLoadingCycles;
    const isError = isErrorPlans || isErrorCycles;
    const error = errorPlans || cyclesError;

    return {
        microcycles,
        isLoading,
        isError,
        error,
    };
};

