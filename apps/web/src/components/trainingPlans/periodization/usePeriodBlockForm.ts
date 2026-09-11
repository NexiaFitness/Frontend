import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { PlanPeriodBlock, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import { weeksStructureEqual } from "@nexia/shared";
import { hasOverlap, isWithinPlanBounds } from "@nexia/shared/utils/periodBlockOverlap";
import {
  canPersistBlock,
  canActivatePhase,
  derivePhaseUxLabel,
  buildPhaseReadinessChecklist,
  type PhaseReadinessInput,
  type PhaseUxLabel,
} from "@nexia/shared";
import type { PeriodBlockConstructorStep } from "./periodBlockConstructor";
import { nextConstructorStep } from "./periodBlockConstructor";
import { blockFieldsChanged, toBlockPersistPayload } from "./periodBlockPersistence";

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
  const loadedBlockRef = useRef<PlanPeriodBlock | null>(null);
  const structureBaselineRef = useRef<WeeklyStructureWeekCreate[]>([]);

    const [structureBaseline, setStructureBaselineState] = useState<
        WeeklyStructureWeekCreate[]
    >([]);

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
    loadedBlockRef.current = block;
    structureBaselineRef.current = [];
    setStructureBaselineState([]);
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

  const markPersisted = useCallback(
    (block: PlanPeriodBlock, structure: WeeklyStructureWeekCreate[]) => {
      loadedBlockRef.current = block;
      const snapshot = structure.map((w) => ({
        week_ordinal: w.week_ordinal,
        label: w.label ?? null,
        days: w.days.map((d) => ({
          day_of_week: d.day_of_week,
          patterns: d.patterns.map((p) => ({
            movement_pattern_id: p.movement_pattern_id,
            sub_pattern: p.sub_pattern ?? null,
          })),
        })),
      }));
      structureBaselineRef.current = snapshot;
      setStructureBaselineState(snapshot);
      setForm((prev) => ({ ...prev, weeklyStructure: snapshot }));
    },
    [],
  );

  /** Solo baseline persistido; no toca el draft editable (D-PRES). */
  const setStructureBaseline = useCallback((draft: WeeklyStructureWeekCreate[]) => {
    const snapshot = draft.map((w) => ({
      week_ordinal: w.week_ordinal,
      label: w.label ?? null,
      days: w.days.map((d) => ({
        day_of_week: d.day_of_week,
        patterns: d.patterns.map((p) => ({
          movement_pattern_id: p.movement_pattern_id,
          sub_pattern: p.sub_pattern ?? null,
        })),
      })),
    }));
    structureBaselineRef.current = snapshot;
    setStructureBaselineState(snapshot);
  }, []);

  /** Hidratación inicial: siembra draft + baseline desde servidor (una sola vez por carga). */
  const hydrateWeeklyStructure = useCallback(
    (draft: WeeklyStructureWeekCreate[]) => {
      const snapshot = draft.map((w) => ({
        week_ordinal: w.week_ordinal,
        label: w.label ?? null,
        days: w.days.map((d) => ({
          day_of_week: d.day_of_week,
          patterns: d.patterns.map((p) => ({
            movement_pattern_id: p.movement_pattern_id,
            sub_pattern: p.sub_pattern ?? null,
          })),
        })),
      }));
      structureBaselineRef.current = snapshot;
      setStructureBaselineState(snapshot);
      setForm((prev) => ({ ...prev, weeklyStructure: snapshot }));
    },
    [],
  );

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

  const setWeeklyStructure = useCallback(
    (
      draft:
        | WeeklyStructureWeekCreate[]
        | ((
            prev: WeeklyStructureWeekCreate[],
          ) => WeeklyStructureWeekCreate[]),
    ) => {
      setForm((prev) => ({
        ...prev,
        weeklyStructure:
          typeof draft === "function"
            ? draft(prev.weeklyStructure)
            : draft,
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    loadedBlockRef.current = null;
    structureBaselineRef.current = [];
    setStructureBaselineState([]);
    setForm(IDLE_PERIOD_BLOCK_FORM_STATE);
  }, []);

  /** Inicializa draft create tras confirmar rango en calendario (D-PAP). */
  const initCreateRange = useCallback((startDate: string, endDate: string) => {
    loadedBlockRef.current = null;
    structureBaselineRef.current = [];
    setStructureBaselineState([]);
    setForm({
      phase: "rangeComplete",
      startDate,
      endDate,
      qualities: [],
      volumeLevel: 5,
      intensityLevel: 5,
      weeklyStructure: [],
      constructorStep: "qualities",
      completedSteps: ["range"],
    });
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

  const isStructureDirty = useMemo(() => {
    if (structureBaseline.length === 0 && form.weeklyStructure.length === 0) {
      return false;
    }
    if (structureBaseline.length !== form.weeklyStructure.length) {
      return true;
    }
    const baselineByOrdinal = new Map(
      structureBaseline.map((w) => [w.week_ordinal, w]),
    );
    return form.weeklyStructure.some((w) => {
      const base = baselineByOrdinal.get(w.week_ordinal);
      if (!base) return true;
      return !weeksStructureEqual(w, base);
    });
  }, [form.weeklyStructure, structureBaseline]);

  const isBlockFieldsDirty = useMemo(() => {
    const loaded = loadedBlockRef.current;
    if (!loaded || !form.startDate || !form.endDate) return false;
    return blockFieldsChanged(
      toBlockPersistPayload({
        startDate: form.startDate,
        endDate: form.endDate,
        volumeLevel: form.volumeLevel,
        intensityLevel: form.intensityLevel,
        qualities: form.qualities,
      }),
      loaded,
    );
  }, [form]);

  const isDirty = isBlockFieldsDirty || isStructureDirty;

  useEffect(() => {
    if (excludeBlockId == null) return;
    const fresh = existingBlocks.find((b) => b.id === excludeBlockId);
    if (fresh != null) {
      loadedBlockRef.current = fresh;
    }
  }, [existingBlocks, excludeBlockId]);

  const readinessInput: PhaseReadinessInput = useMemo(
    () => ({
      blockId: loadedBlockRef.current?.id ?? null,
      startDate: form.startDate,
      endDate: form.endDate,
      qualities: form.qualities,
      volumeLevel: form.volumeLevel,
      intensityLevel: form.intensityLevel,
      weeklyStructure: form.weeklyStructure,
      isDirty,
      overlapDetected,
      outsidePlanBounds,
    }),
    [form, isDirty, overlapDetected, outsidePlanBounds],
  );

  const canPersistBlockGate = canPersistBlock(readinessInput);
  const canActivatePhaseGate = canActivatePhase(readinessInput);
  const phaseUxLabel: PhaseUxLabel = derivePhaseUxLabel(readinessInput);

  const canAdvanceStep = useMemo(() => {
    switch (form.constructorStep) {
      case "range":
        return form.phase === "rangeComplete";
      case "qualities":
        return qualitiesComplete;
      case "volumeIntensity":
        return form.volumeLevel >= 1 && form.intensityLevel >= 1;
      case "weeklyStructure": {
        if (!form.startDate || !form.endDate) return false;
        return buildPhaseReadinessChecklist({
          blockId: loadedBlockRef.current?.id ?? null,
          startDate: form.startDate,
          endDate: form.endDate,
          qualities: form.qualities,
          volumeLevel: form.volumeLevel,
          intensityLevel: form.intensityLevel,
          weeklyStructure: form.weeklyStructure,
          overlapDetected,
          outsidePlanBounds,
        }).structureComplete;
      }
      case "summary":
        return true;
      default:
        return false;
    }
  }, [
    form.constructorStep,
    form.phase,
    form.startDate,
    form.endDate,
    form.qualities,
    form.volumeLevel,
    form.intensityLevel,
    form.weeklyStructure,
    qualitiesComplete,
    overlapDetected,
    outsidePlanBounds,
  ]);

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
    setStructureBaseline,
    hydrateWeeklyStructure,
    markPersisted,
    reset,
    initCreateRange,
    structureBaseline,
    isStructureDirty,
    advanceConstructorStep,
    setConstructorStep,
    qualitiesSum,
    overlapDetected,
    outsidePlanBounds,
    canSubmit,
    canPersistBlock: canPersistBlockGate,
    canActivatePhase: canActivatePhaseGate,
    canAdvanceStep,
    phaseUxLabel,
    isDirty,
    readinessInput,
    qualitiesComplete,
    loadedBlock: loadedBlockRef.current,
  };
}
