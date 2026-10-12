/**
 * useAthleteSessionRun.audit.spec.tsx — Auditoria dirigida del guiado (debug/claude-code-2026-10-13).
 *
 * Proposito: cuantificar las peticiones que salen del hook real en escenarios concretos de la auditoria
 * (guardado de grupo, re-confirmacion, offline, sesion cerrada).
 * Contexto: useAthleteSessionRun no tenia test directo (AthleteSessionRunPage.test.tsx lo mockea).
 * Notas: se mockean solo las fronteras de red (RTK hooks, cola offline) y efectos de dispositivo;
 * la estructura se construye con el mapper real (mapBlocksToSessionStructureView) para obtener step_keys reales.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AthleteRunExecutionCreate } from "@nexia/shared/types/athleteRunReference";
import type { AthleteRunProgress } from "@nexia/shared/types/athleteRunProgress";
import {
    mapBlocksToSessionStructureView,
    type SessionStructureView,
} from "@nexia/shared/sessionProgramming/sessionBlockView";
import type {
    SessionBlock,
    SessionBlockExercise,
    SetType,
} from "@nexia/shared/types/sessionProgramming";
import { useAthleteSessionRun } from "./useAthleteSessionRun";

type SaveResult = "synced" | "queued" | "offline";

const postExecution = vi.fn((payload: AthleteRunExecutionCreate) => ({
    unwrap: () => Promise.resolve(payload),
}));
const postTimedResult = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const logExecution = vi.fn((_payload: AthleteRunExecutionCreate) => Promise.resolve<SaveResult>("offline"));
const logTimedResult = vi.fn(() => Promise.resolve<SaveResult>("offline"));
const logSet = vi.fn(() => Promise.resolve<SaveResult>("offline"));
const finishSession = vi.fn(() => Promise.resolve<SaveResult>("synced"));

let isOnline = true;
let progress: AthleteRunProgress | undefined;
let view: SessionStructureView;

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock("@nexia/shared/api/trainingSessionsApi", () => ({
    useGetTrainingSessionQuery: () => ({ data: { id: 7, session_name: "Audit" }, isLoading: false }),
    useUpdateTrainingSessionMutation: () => [vi.fn()],
    useUpdateSessionExerciseMutation: () => [vi.fn()],
}));

vi.mock("@nexia/shared/api/sessionProgrammingApi", () => ({
    useUpdateSessionBlockExerciseMutation: () => [vi.fn()],
}));

vi.mock("@nexia/shared/hooks/sessionProgramming", () => ({
    useSessionStructureView: () => ({ view, source: "blocks", isLoading: false, isError: false }),
}));

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteRunReferenceQuery: () => ({ data: undefined, isLoading: false }),
    useGetAthleteRunProgressQuery: () => ({ data: progress, currentData: progress }),
    usePostAthleteRunExecutionMutation: () => [postExecution],
    usePostAthleteRunTimedResultMutation: () => [postTimedResult],
    usePutAthleteExerciseNoteMutation: () => [vi.fn()],
}));

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 3 }),
}));

vi.mock("@nexia/shared/hooks/offline", () => ({
    useOfflineSessionLog: () => ({
        isOnline,
        pendingCount: 0,
        cachedSnapshot: null,
        localExecutions: [],
        isUsingCache: false,
        logSet,
        logExecution,
        logTimedResult,
        finishSession,
    }),
}));

vi.mock("@/hooks/athlete/useAthleteRunSlotReferences", () => ({
    useAthleteRunSlotReferences: () => ({ slotReferences: {}, isLoading: false }),
}));

vi.mock("@/hooks/athlete/useAthleteExercisePr", () => ({
    useAthleteExercisePr: () => ({ evaluatePr: () => ({ isPr: false, previousMaxWeight: null }) }),
}));

vi.mock("@/hooks/athlete/useAthleteRunWakeLock", () => ({
    useAthleteRunWakeLock: () => undefined,
}));

const block = (id: number, setType: SetType, rounds: number | null): SessionBlock =>
    ({
        id,
        training_session_id: 7,
        block_type_id: 1,
        order_in_session: id,
        set_type: setType,
        rounds,
        time_cap: null,
        interval_seconds: null,
    }) as SessionBlock;

const line = (
    id: number,
    blockId: number,
    exerciseId: number,
    order: number,
    extra: Partial<SessionBlockExercise> = {}
): SessionBlockExercise =>
    ({
        id,
        session_block_id: blockId,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: "giant_set",
        superset_group_id: 1,
        dropset_sequence: null,
        planned_sets: 2,
        planned_reps: "10",
        planned_weight: null,
        planned_duration: null,
        planned_rest: 90,
        effort_character: null,
        effort_value: null,
        actual_sets: null,
        actual_reps: null,
        actual_weight: 20,
        actual_effort_value: null,
        is_active: true,
        ...extra,
    }) as SessionBlockExercise;

function giantSetView(): SessionStructureView {
    return mapBlocksToSessionStructureView({
        blocks: [block(10, "giant_set", 2)],
        blockExercisesByBlock: {
            10: [line(101, 10, 1, 1), line(102, 10, 2, 2), line(103, 10, 3, 3)],
        },
        blockTypes: [],
        exerciseNamesById: { 1: "Sentadilla", 2: "Remo", 3: "Press" },
    });
}

function renderRun() {
    return renderHook(() => useAthleteSessionRun({ sessionId: 7 }));
}

type RunResult = ReturnType<typeof renderRun>["result"];

async function enterLogger(result: RunResult) {
    await waitFor(() => expect(result.current.currentRunStep).toBeDefined());
    act(() => {
        result.current.restFlow.startRest();
    });
    await waitFor(() => expect(result.current.restFlow.showLogger).toBe(true));
}

async function confirm(result: RunResult) {
    await waitFor(() => expect(result.current.restFlow.stickyPrimaryDisabled).toBe(false));
    await act(async () => {
        result.current.restFlow.stickyPrimaryAction?.();
    });
    await waitFor(() => expect(result.current.restFlow.stickyPrimaryLoading).toBe(false));
}

beforeEach(() => {
    vi.clearAllMocks();
    isOnline = true;
    progress = undefined;
    view = giantSetView();
});

describe("useAthleteSessionRun — giant set (auditoria punto d)", () => {
    it("confirmar la ronda 1 envia exactamente un POST por slot", async () => {
        const { result } = renderRun();
        await enterLogger(result);
        expect(result.current.currentRunStep?.kind).toBe("group_round");
        expect(result.current.currentRunStep?.slots).toHaveLength(3);

        await confirm(result);

        expect(postExecution).toHaveBeenCalledTimes(3);
        const keys = postExecution.mock.calls.map(([payload]) => payload.step_key);
        expect(new Set(keys).size).toBe(3);
    });

    it("re-confirmar tras editar un slot reenvia solo ese slot (S5)", async () => {
        const { result } = renderRun();
        await enterLogger(result);
        await confirm(result);
        expect(postExecution).toHaveBeenCalledTimes(3);
        expect(result.current.restFlow.phase).toBe("rest_overlay");

        act(() => {
            result.current.restFlow.editRestFromOverlay();
        });
        await waitFor(() => expect(result.current.restFlow.showLogger).toBe(true));

        const editedSlot = result.current.currentRunStep!.slots![1];
        act(() => {
            result.current.updateSlotLog(editedSlot.stepKey, { weight: 42.5 });
        });
        postExecution.mockClear();

        await confirm(result);

        expect(postExecution.mock.calls.map(([payload]) => payload.step_key)).toEqual([editedSlot.stepKey]);
        expect(postExecution.mock.calls[0][0].weight_kg).toBe(42.5);
    });
});
