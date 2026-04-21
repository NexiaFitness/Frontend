/**
 * useClientActiveBlock.ts — Instancia de plan activa + bloque de periodización que contiene hoy.
 *
 * Resuelve: GET instancias por cliente → filtro negocio → GET period-blocks por source_plan_id → findActivePlanPeriodBlock.
 * Sin lógica de presentación; los mensajes de vacío los construye la vista.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useMemo } from "react";
import { useGetPeriodBlocksQuery } from "../../api/periodBlocksApi";
import { useGetTrainingPlanInstancesQuery } from "../../api/trainingPlansApi";
import type { PlanPeriodBlock } from "../../types/planningCargas";
import type { TrainingPlanInstance } from "../../types/training";
import {
    findActivePlanPeriodBlock,
    pickActiveTrainingPlanInstanceForToday,
} from "../../training/activePeriodBlock";

function rtkErrorDetail(err: unknown): string | undefined {
    if (err == null || typeof err !== "object") return undefined;
    if (!("data" in err)) return undefined;
    const data = (err as { data?: unknown }).data;
    if (data == null || typeof data !== "object" || !("detail" in data)) return undefined;
    const d = (data as { detail?: unknown }).detail;
    return typeof d === "string" ? d : undefined;
}

export interface UseClientActiveBlockResult {
    activeBlock: PlanPeriodBlock | undefined;
    activePlanInstance: TrainingPlanInstance | undefined;
    isLoading: boolean;
    errorMessage: string | undefined;
    /** Lista de instancias cargada y ninguna cumple plan activo en la fecha actual. */
    hasNoActivePlan: boolean;
    /** Instancia elegida pero sin source_plan_id válido para /period-blocks. */
    hasNoSourcePlanForBlocks: boolean;
    /** Bloques cargados pero ningún bloque contiene hoy (o lista vacía). */
    hasNoActiveBlock: boolean;
    /** Cantidad de bloques devueltos por el API para el plan fuente (0 si no aplica). */
    periodBlockCount: number;
}

/**
 * @param clientId - Perfil cliente
 * @param enabled - Si false, no dispara peticiones (p. ej. pestaña distinta a training_block)
 */
export function useClientActiveBlock(
    clientId: number,
    enabled: boolean
): UseClientActiveBlockResult {
    const skipInstances = !enabled || clientId <= 0;

    const {
        data: instances = [],
        isLoading: loadingInstances,
        isError: instancesError,
        error: instancesErr,
    } = useGetTrainingPlanInstancesQuery(
        { clientId, skip: 0, limit: 100 },
        { skip: skipInstances }
    );

    const activePlanInstance = useMemo(() => {
        if (skipInstances) return undefined;
        return pickActiveTrainingPlanInstanceForToday(instances, clientId, new Date());
    }, [skipInstances, instances, clientId]);

    const sourcePlanId = activePlanInstance?.source_plan_id;
    const hasValidSourcePlan =
        sourcePlanId != null && typeof sourcePlanId === "number" && sourcePlanId > 0;

    const skipBlocks =
        skipInstances ||
        !activePlanInstance ||
        !hasValidSourcePlan;

    const {
        data: blocks = [],
        isLoading: loadingBlocks,
        isError: blocksError,
        error: blocksErr,
    } = useGetPeriodBlocksQuery(sourcePlanId ?? 0, {
        skip: skipBlocks,
    });

    const activeBlock = useMemo(() => {
        if (skipBlocks || blocks.length === 0) return undefined;
        return findActivePlanPeriodBlock(blocks, new Date());
    }, [skipBlocks, blocks]);

    const instancesSettled = skipInstances ? false : !loadingInstances;
    const blocksSettled = skipBlocks ? true : !loadingBlocks;

    const hasNoActivePlan = instancesSettled && !activePlanInstance;

    const hasNoSourcePlanForBlocks =
        instancesSettled &&
        !!activePlanInstance &&
        !hasValidSourcePlan;

    const hasNoActiveBlock =
        instancesSettled &&
        !hasNoActivePlan &&
        !hasNoSourcePlanForBlocks &&
        !!activePlanInstance &&
        hasValidSourcePlan &&
        blocksSettled &&
        activeBlock === undefined;

    const errorMessage = useMemo(() => {
        if (instancesError) return rtkErrorDetail(instancesErr) ?? "Error al cargar instancias del plan.";
        if (blocksError) return rtkErrorDetail(blocksErr) ?? "Error al cargar bloques de periodización.";
        return undefined;
    }, [instancesError, instancesErr, blocksError, blocksErr]);

    const isLoading =
        (!skipInstances && loadingInstances) || (!skipBlocks && loadingBlocks);

    return {
        activeBlock,
        activePlanInstance,
        isLoading,
        errorMessage,
        hasNoActivePlan,
        hasNoSourcePlanForBlocks,
        hasNoActiveBlock,
        periodBlockCount: skipBlocks ? 0 : blocks.length,
    };
}
