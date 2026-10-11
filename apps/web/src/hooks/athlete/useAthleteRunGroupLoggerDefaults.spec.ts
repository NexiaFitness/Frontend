/**
 * useAthleteRunGroupLoggerDefaults.spec.ts — R2 desde R1 (D-LOG-TOUCH-01 L.20).
 */

import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { LocalSetExecution } from "@nexia/shared/offline/athleteSessionTypes";
import { buildRunLoggerFieldTouchKey } from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import type { SlotLogValues } from "@/components/athlete/logging/AthleteMultiSlotLogger";
import { useAthleteRunGroupLoggerDefaults } from "./useAthleteRunGroupLoggerDefaults";

function round2Step(): AthleteRunStep {
  return {
    stepKey: "block-7-superset-1-round-2",
    kind: "group_round",
    groupKind: "superset",
    blockId: 1,
    blockName: "Fuerza",
    groupId: "block-7-superset-1",
    badgeLabel: "SUPERSET A",
    roundIndex: 2,
    roundTotal: 2,
    slotLabel: "A1",
    exerciseId: 101,
    exerciseName: "A",
    setLabel: "R2",
    setIndex: 2,
    instruction: "",
    plannedLabel: "10 reps",
    restAfterSeconds: 90,
    inputMode: "weight_reps",
    blockExerciseId: 1,
    plannedWeight: null,
    defaultWeight: 0,
    defaultReps: 10,
    defaultRpe: null,
    loggedSets: 0,
    totalSetsInSlot: 2,
    timeCapMinutes: null,
    intervalSeconds: null,
    plannedDurationSeconds: null,
    slots: [
      {
        stepKey: "block-7-superset-1-r2-A1-R2-1",
        slotLabel: "A1",
        exerciseId: 101,
        exerciseName: "A",
        setLabel: "R2",
        plannedLabel: "10 reps",
        blockExerciseId: 1,
        inputMode: "weight_reps",
        defaultWeight: 0,
        defaultReps: 10,
        defaultRpe: null,
        loggedSets: 0,
      },
      {
        stepKey: "block-7-superset-1-r2-A2-R2-1",
        slotLabel: "A2",
        exerciseId: 102,
        exerciseName: "B",
        setLabel: "R2",
        plannedLabel: "10 reps",
        blockExerciseId: 2,
        inputMode: "weight_reps",
        defaultWeight: 0,
        defaultReps: 10,
        defaultRpe: null,
        loggedSets: 0,
      },
    ],
  };
}

const r1Executions: LocalSetExecution[] = [
  {
    step_key: "block-7-superset-1-r1-A1-R1-1",
    exercise_id: 101,
    slot_label: "A1",
    round_index: 1,
    group_kind: "superset",
    weight_kg: 33,
    reps: 10,
    rpe: null,
    performed_at: Date.now(),
  },
  {
    step_key: "block-7-superset-1-r1-A2-R1-1",
    exercise_id: 102,
    slot_label: "A2",
    round_index: 1,
    group_kind: "superset",
    weight_kg: 44,
    reps: 7,
    rpe: null,
    performed_at: Date.now(),
  },
];

describe("useAthleteRunGroupLoggerDefaults", () => {
  it("R2: local R1 hydrates untouched slots only (02_DECISIONES L.20)", async () => {
    let slotLogs: Record<string, SlotLogValues> = {
      "block-7-superset-1-r2-A1-R2-1": { weight: null, reps: 10 },
      "block-7-superset-1-r2-A2-R2-1": { weight: 52, reps: 10 },
    };
    const touched = new Set([
      buildRunLoggerFieldTouchKey("slot", "block-7-superset-1-r2-A2-R2-1", "weight"),
    ]);
    const setSlotLogs = vi.fn((updater: typeof slotLogs | ((p: typeof slotLogs) => typeof slotLogs)) => {
      slotLogs = typeof updater === "function" ? updater(slotLogs) : updater;
    });

    renderHook(() =>
      useAthleteRunGroupLoggerDefaults({
        restShowLogger: true,
        isGroupRound: true,
        currentRunStep: round2Step(),
        slotReferences: {},
        localExecutions: r1Executions,
        getTouchedSnapshot: () => touched,
        setSlotLogs,
        roundRpe: null,
        setRoundRpeState: vi.fn(),
      })
    );

    await waitFor(() => {
      expect(setSlotLogs).toHaveBeenCalled();
    });
    expect(slotLogs["block-7-superset-1-r2-A1-R2-1"]?.weight).toBe(33);
    expect(slotLogs["block-7-superset-1-r2-A2-R2-1"]?.weight).toBe(52);
  });

  it("R2: no invented weight when R1 had no execution for slot", async () => {
    let slotLogs: Record<string, SlotLogValues> = {
      "block-7-superset-1-r2-A1-R2-1": { weight: null, reps: 10 },
      "block-7-superset-1-r2-A2-R2-1": { weight: null, reps: 10 },
    };
    const setSlotLogs = vi.fn((updater: typeof slotLogs | ((p: typeof slotLogs) => typeof slotLogs)) => {
      slotLogs = typeof updater === "function" ? updater(slotLogs) : updater;
    });

    renderHook(() =>
      useAthleteRunGroupLoggerDefaults({
        restShowLogger: true,
        isGroupRound: true,
        currentRunStep: round2Step(),
        slotReferences: {},
        localExecutions: [],
        getTouchedSnapshot: () => new Set(),
        setSlotLogs,
        roundRpe: null,
        setRoundRpeState: vi.fn(),
      })
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(slotLogs["block-7-superset-1-r2-A1-R2-1"]?.weight).toBeNull();
    expect(slotLogs["block-7-superset-1-r2-A2-R2-1"]?.weight).toBeNull();
  });

  it("touched weight never overwritten when API reference arrives", async () => {
    let slotLogs: Record<string, SlotLogValues> = {
      "block-7-superset-1-r2-A1-R2-1": { weight: 33, reps: 10 },
      "block-7-superset-1-r2-A2-R2-1": { weight: null, reps: 10 },
    };
    const touched = new Set([
      buildRunLoggerFieldTouchKey("slot", "block-7-superset-1-r2-A1-R2-1", "weight"),
    ]);
    const setSlotLogs = vi.fn((updater: typeof slotLogs | ((p: typeof slotLogs) => typeof slotLogs)) => {
      slotLogs = typeof updater === "function" ? updater(slotLogs) : updater;
    });

    const lateRef: AthleteRunReference = {
      exercise_id: 101,
      step_key: "block-7-superset-1-r2-A1-R2-1",
      reference: {
        weight_kg: 99,
        reps: 10,
        rpe: null,
        source: "history",
        rounds_completed: null,
        total_seconds: null,
        performed_at: null,
        session_date_label: null,
      },
      personal_best: null,
      suggestion: null,
    };

    const { rerender } = renderHook(
      ({ refs }: { refs: Record<string, Pick<AthleteRunReference, "reference">> }) =>
        useAthleteRunGroupLoggerDefaults({
          restShowLogger: true,
          isGroupRound: true,
          currentRunStep: round2Step(),
          slotReferences: refs,
          localExecutions: r1Executions,
          getTouchedSnapshot: () => touched,
          setSlotLogs,
          roundRpe: null,
          setRoundRpeState: vi.fn(),
        }),
      {
        initialProps: {
          refs: {} as Record<string, Pick<AthleteRunReference, "reference">>,
        },
      }
    );

    await waitFor(() => expect(setSlotLogs).toHaveBeenCalled());
    const weightAfterFirst = slotLogs["block-7-superset-1-r2-A1-R2-1"]?.weight;

    await act(async () => {
      rerender({
        refs: {
          "block-7-superset-1-r2-A1-R2-1": { reference: lateRef.reference },
          "block-7-superset-1-r2-A2-R2-1": { reference: lateRef.reference },
        },
      });
    });

    expect(slotLogs["block-7-superset-1-r2-A1-R2-1"]?.weight).toBe(weightAfterFirst);
    expect(slotLogs["block-7-superset-1-r2-A1-R2-1"]?.weight).toBe(33);
  });

  it("R2: round RPE from offline R1 without slot weight reference (R-LOG-05)", async () => {
    const r1WithRpe: LocalSetExecution[] = [
      {
        ...r1Executions[0],
        rpe: 8,
      },
      r1Executions[1],
    ];
    const setRoundRpeState = vi.fn();

    renderHook(() =>
      useAthleteRunGroupLoggerDefaults({
        restShowLogger: true,
        isGroupRound: true,
        currentRunStep: round2Step(),
        slotReferences: {},
        localExecutions: r1WithRpe,
        getTouchedSnapshot: () => new Set(),
        setSlotLogs: vi.fn(),
        roundRpe: null,
        setRoundRpeState,
      })
    );

    await waitFor(() => {
      expect(setRoundRpeState).toHaveBeenCalledWith(8);
    });
  });
});
