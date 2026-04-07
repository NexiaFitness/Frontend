import { useState, useCallback, useMemo } from "react";
import type { PlanPeriodBlock, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";
import { hasOverlap, isWithinPlanBounds } from "@nexia/shared/utils/periodBlockOverlap";

type SelectionPhase = "idle" | "rangeStart" | "rangeComplete";

export interface PeriodBlockFormState {
  phase: SelectionPhase;
  startDate: string | null;
  endDate: string | null;
  qualities: PeriodBlockQualityInput[];
  volumeLevel: number;
  intensityLevel: number;
}

const INITIAL_STATE: PeriodBlockFormState = {
  phase: "idle",
  startDate: null,
  endDate: null,
  qualities: [],
  volumeLevel: 5,
  intensityLevel: 5,
};

export function usePeriodBlockForm(
  existingBlocks: PlanPeriodBlock[],
  excludeBlockId?: number | null,
  planStartDate?: string | null,
  planEndDate?: string | null,
) {
  const [form, setForm] = useState<PeriodBlockFormState>(INITIAL_STATE);

  const handleDayClick = useCallback((dateStr: string) => {
    setForm((prev) => {
      if (prev.phase === "idle" || prev.phase === "rangeComplete") {
        return { ...INITIAL_STATE, phase: "rangeStart", startDate: dateStr };
      }
      if (prev.phase === "rangeStart" && prev.startDate) {
        const s = new Date(prev.startDate).getTime();
        const e = new Date(dateStr).getTime();
        if (e < s) {
          return { ...prev, phase: "rangeStart", startDate: dateStr };
        }
        return { ...prev, phase: "rangeComplete", endDate: dateStr };
      }
      return prev;
    });
  }, []);

  const addQuality = useCallback(
    (qualityId: number, initialPct = 50) => {
      setForm((prev) => {
        if (prev.qualities.some((q) => q.physical_quality_id === qualityId))
          return prev;
        return {
          ...prev,
          qualities: [
            ...prev.qualities,
            { physical_quality_id: qualityId, percentage: initialPct },
          ],
        };
      });
    },
    []
  );

  const removeQuality = useCallback((qualityId: number) => {
    setForm((prev) => ({
      ...prev,
      qualities: prev.qualities.filter(
        (q) => q.physical_quality_id !== qualityId
      ),
    }));
  }, []);

  const updateQualityPct = useCallback(
    (qualityId: number, percentage: number) => {
      setForm((prev) => ({
        ...prev,
        qualities: prev.qualities.map((q) =>
          q.physical_quality_id === qualityId ? { ...q, percentage } : q
        ),
      }));
    },
    []
  );

  const setVolumeLevel = useCallback((v: number) => {
    setForm((prev) => ({ ...prev, volumeLevel: v }));
  }, []);

  const setIntensityLevel = useCallback((v: number) => {
    setForm((prev) => ({ ...prev, intensityLevel: v }));
  }, []);

  const loadBlock = useCallback((block: PlanPeriodBlock) => {
    setForm({
      phase: "rangeComplete",
      startDate: block.start_date,
      endDate: block.end_date,
      qualities: block.qualities.map((q) => ({
        physical_quality_id: q.physical_quality_id,
        percentage: q.percentage,
      })),
      volumeLevel: block.volume_level,
      intensityLevel: block.intensity_level,
    });
  }, []);

  const reset = useCallback(() => {
    setForm(INITIAL_STATE);
  }, []);

  const qualitiesSum = useMemo(
    () => form.qualities.reduce((acc, q) => acc + q.percentage, 0),
    [form.qualities]
  );

  const overlapDetected = useMemo(() => {
    if (!form.startDate || !form.endDate) return false;
    return hasOverlap(form.startDate, form.endDate, existingBlocks, excludeBlockId ?? undefined);
  }, [form.startDate, form.endDate, existingBlocks, excludeBlockId]);

  const outsidePlanBounds = useMemo(() => {
    if (!form.startDate || !form.endDate) return false;
    return !isWithinPlanBounds(form.startDate, form.endDate, planStartDate, planEndDate);
  }, [form.startDate, form.endDate, planStartDate, planEndDate]);

  const canSubmit =
    form.phase === "rangeComplete" &&
    form.startDate != null &&
    form.endDate != null &&
    form.qualities.length > 0 &&
    qualitiesSum === 100 &&
    !overlapDetected &&
    !outsidePlanBounds;

  return {
    form,
    handleDayClick,
    addQuality,
    removeQuality,
    updateQualityPct,
    setVolumeLevel,
    setIntensityLevel,
    loadBlock,
    reset,
    qualitiesSum,
    overlapDetected,
    outsidePlanBounds,
    canSubmit,
  };
}
