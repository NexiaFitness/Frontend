import { useState, useCallback, useMemo } from "react";
import type { PlanPeriodBlock, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import { hasOverlap, isWithinPlanBounds } from "@nexia/shared/utils/periodBlockOverlap";
import type { PeriodBlockConstructorStep } from "./periodBlockConstructor";
import { nextConstructorStep } from "./periodBlockConstructor";

type SelectionPhase = "idle" | "rangeStart" | "rangeComplete";

export interface PeriodBlockFormState {
  phase: SelectionPhase;
  startDate: string | null;
  endDate: string | null;
  qualities: PeriodBlockQualityInput[];
  volumeLevel: number;
  intensityLevel: number;
  weeklyStructure: WeeklyStructureWeekCreate[];
  /** Paso activo del constructor (columna derecha). */
  constructorStep: PeriodBlockConstructorStep;
  /** Pasos ya confirmados con «Continuar» (alimentan la card bajo el calendario). */
  completedSteps: PeriodBlockConstructorStep[];
}

/** Estado inicial exportable (p. ej. calendario de periodización en solo lectura / selector de fecha). */
export const IDLE_PERIOD_BLOCK_FORM_STATE: PeriodBlockFormState = {
  phase: "idle",
  startDate: null,
  endDate: null,
  qualities: [],
  volumeLevel: 5,
  intensityLevel: 5,
  weeklyStructure: [],
  constructorStep: "range",
  completedSteps: [],
};

const INITIAL_STATE = IDLE_PERIOD_BLOCK_FORM_STATE;

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
        return {
          ...IDLE_PERIOD_BLOCK_FORM_STATE,
          phase: "rangeStart",
          startDate: dateStr,
          constructorStep: "range",
        };
      }
      if (prev.phase === "rangeStart" && prev.startDate) {
        const s = new Date(prev.startDate).getTime();
        const e = new Date(dateStr).getTime();
        if (e < s) {
          return { ...prev, phase: "rangeStart", startDate: dateStr, constructorStep: "range" };
        }
        return {
          ...prev,
          phase: "rangeComplete",
          endDate: dateStr,
          constructorStep: "qualities",
          completedSteps: ["range"],
        };
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
      weeklyStructure: [],
      constructorStep: "qualities",
      completedSteps: ["range"],
    });
  }, []);

  const advanceConstructorStep = useCallback(() => {
    setForm((prev) => {
      const next = nextConstructorStep(prev.constructorStep);
      if (!next) return prev;
      const completed = prev.completedSteps.includes(prev.constructorStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.constructorStep];
      return { ...prev, constructorStep: next, completedSteps: completed };
    });
  }, []);

  const setConstructorStep = useCallback((step: PeriodBlockConstructorStep) => {
    setForm((prev) => ({ ...prev, constructorStep: step }));
  }, []);

  const setWeeklyStructure = useCallback((draft: WeeklyStructureWeekCreate[]) => {
    setForm((prev) => ({ ...prev, weeklyStructure: draft }));
  }, []);

  const reset = useCallback(() => {
    setForm(IDLE_PERIOD_BLOCK_FORM_STATE);
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

  const qualitiesComplete =
    form.qualities.length > 0 && qualitiesSum === 100;

  return {
    form,
    handleDayClick,
    addQuality,
    removeQuality,
    updateQualityPct,
    setVolumeLevel,
    setIntensityLevel,
    setWeeklyStructure,
    loadBlock,
    reset,
    advanceConstructorStep,
    setConstructorStep,
    qualitiesSum,
    overlapDetected,
    outsidePlanBounds,
    canSubmit,
    qualitiesComplete,
  };
}
