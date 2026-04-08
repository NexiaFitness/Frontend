/**
 * Datos RTK para calendario de periodización del plan activo del cliente.
 * Comparte caché entre tab Sesiones, paso "elegir día" y validación de rutas constructor.
 */

import { useMemo, useCallback } from "react";
import { useGetActivePlanByClientQuery } from "@nexia/shared/api/trainingPlansApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetTrainingSessionsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetDayExceptionsQuery } from "@nexia/shared/api/dayExceptionsApi";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";

export interface UseClientActivePlanSessionScheduleResult {
  activePlanForClient: ActivePlanByClientOut | null | undefined;
  isLoadingActivePlan: boolean;
  periodBlocks: PlanPeriodBlock[];
  /** Sesiones del plan activo (para contadores, detalle, etc.) */
  planSessions: TrainingSession[];
  sessionDatesInPlan: Set<string>;
  exceptionDates: Set<string>;
  getPeriodBlockIdForDate: (isoDate: string | null | undefined) => number | null;
}

export function useClientActivePlanSessionSchedule(
  clientId: number,
  options?: { skip?: boolean }
): UseClientActivePlanSessionScheduleResult {
  const skipRoot = options?.skip ?? false;
  const skip = skipRoot || !clientId || clientId <= 0;

  const { data: activePlanForClient, isLoading: isLoadingActivePlan } = useGetActivePlanByClientQuery(
    clientId,
    { skip }
  );

  const planId = activePlanForClient?.id;
  const { data: periodBlocks = [] } = useGetPeriodBlocksQuery(planId!, {
    skip: skip || !planId,
  });
  const { data: planTrainingSessions = [] } = useGetTrainingSessionsQuery(planId!, {
    skip: skip || !planId,
  });
  const { data: dayExceptions = [] } = useGetDayExceptionsQuery(
    { clientId },
    { skip: skip || !activePlanForClient }
  );

  const sessionDatesInPlan = useMemo(() => {
    const s = new Set<string>();
    for (const row of planTrainingSessions) {
      if (row.session_date) s.add(row.session_date);
    }
    return s;
  }, [planTrainingSessions]);

  const exceptionDates = useMemo(() => {
    const s = new Set<string>();
    for (const ex of dayExceptions) {
      if (!ex.is_trainable) s.add(ex.date);
    }
    return s;
  }, [dayExceptions]);

  const getPeriodBlockIdForDate = useCallback(
    (isoDate: string | null | undefined) => {
      if (!isoDate) return null;
      const b = periodBlocks.find((blk) => blk.start_date <= isoDate && blk.end_date >= isoDate);
      return b?.id ?? null;
    },
    [periodBlocks]
  );

  return {
    activePlanForClient,
    isLoadingActivePlan,
    periodBlocks,
    planSessions: planTrainingSessions,
    sessionDatesInPlan,
    exceptionDates,
    getPeriodBlockIdForDate,
  };
}
