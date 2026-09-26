/**
 * Fechas «previstas» del calendario: días con patrón en la estructura semanal
 * de cada bloque. No materializa TrainingSession (O2-A prohibido).
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@nexia/shared/store";
import { weeklyStructureApi } from "@nexia/shared/api/weeklyStructureApi";
import { collectStructureTrainingDates } from "@nexia/shared";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

const EMPTY_SET = new Set<string>();

export function usePeriodBlocksStructurePendingDates(input: {
  planId: number | null | undefined;
  blocks: PlanPeriodBlock[];
  enabled?: boolean;
}): Set<string> {
  const { planId, blocks, enabled = true } = input;
  const dispatch = useDispatch<AppDispatch>();
  const [dates, setDates] = useState<string[]>([]);

  const blockKey = useMemo(
    () =>
      blocks
        .map((b) => `${b.id}:${b.start_date}:${b.end_date}`)
        .sort()
        .join("|"),
    [blocks],
  );

  useEffect(() => {
    if (!enabled || !planId || planId <= 0 || blocks.length === 0) {
      setDates([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      const next: string[] = [];
      for (const block of blocks) {
        try {
          const structure = await dispatch(
            weeklyStructureApi.endpoints.getWeeklyStructure.initiate(
              { planId, blockId: block.id },
              { subscribe: false },
            ),
          ).unwrap();
          next.push(
            ...collectStructureTrainingDates(
              block.start_date,
              block.end_date,
              structure.weeks ?? [],
            ),
          );
        } catch {
          // Sin estructura aún — sin días previstos
        }
      }
      if (!cancelled) {
        setDates(next);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, planId, blockKey, blocks, dispatch]);

  return useMemo(() => {
    if (dates.length === 0) return EMPTY_SET;
    return new Set(dates);
  }, [dates]);
}
