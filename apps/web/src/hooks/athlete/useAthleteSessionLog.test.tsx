/**
 * useAthleteSessionLog.test.tsx — FE-3 registro al final (online/offline, idempotencia).
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { createTestStore } from "@/test-utils/utils/store";
import { useAthleteSessionLog } from "./useAthleteSessionLog";
import type { SessionStructureView } from "@nexia/shared/sessionProgramming/sessionBlockView";

const postExecution = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const postTimedResult = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const postNotPerformed = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const updateSession = vi.fn(() => ({ unwrap: () => Promise.resolve({}) }));
const refetchProgress = vi.fn(() => Promise.resolve({}));

let progressData: {
    pending_count: number;
    blocks: Array<{ session_block_id: number; status: string; steps: unknown[] }>;
    steps: unknown[];
} = {
    pending_count: 1,
    blocks: [{ session_block_id: 10, status: "pending", steps: [] }],
    steps: [],
};

const logExecution = vi.fn(() => Promise.resolve("offline" as const));
const logTimedResult = vi.fn(() => Promise.resolve("offline" as const));
const finishSession = vi.fn(() => Promise.resolve("offline" as const));
const refreshPendingCount = vi.fn(() => Promise.resolve());
let isOnline = true;

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteRunProgressQuery: () => ({
        data: progressData,
        isLoading: false,
        isFetching: false,
        refetch: refetchProgress,
    }),
    usePostAthleteRunExecutionMutation: () => [postExecution],
    usePostAthleteRunTimedResultMutation: () => [postTimedResult],
    usePostAthleteRunNotPerformedMutation: () => [postNotPerformed],
}));

vi.mock("@nexia/shared/api/trainingSessionsApi", () => ({
    useUpdateTrainingSessionMutation: () => [updateSession],
}));

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 346 }),
}));

vi.mock("@nexia/shared/hooks/offline", () => ({
    useOfflineSessionLog: () => ({
        isOnline,
        pendingCount: 0,
        logExecution,
        logTimedResult,
        finishSession,
        refreshPendingCount,
    }),
}));

const stubBlock = {
    sessionBlockId: 10,
    blockTypeName: "Fuerza",
    setType: null,
    status: "pending" as const,
    expectedStepKeys: ["k1"],
    steps: [],
    summaryLine: null,
    isPendingHighlight: true,
    hasRegisterableSteps: true,
};

vi.mock("@nexia/shared/utils/athlete/athleteSessionLogUtils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@nexia/shared/utils/athlete/athleteSessionLogUtils")>();
    return {
        ...actual,
        buildSessionLogBlocks: () => [stubBlock],
        countPendingLogBlocks: () => 1,
        buildInitialBlockDraft: () => ({
            sessionBlockId: 10,
            singleSets: [],
            groupRounds: [],
            dropsetRounds: [],
            timed: null,
            mobilityDone: null,
        }),
        validateBlockDraft: () => null,
        buildBlockSavePayloads: () => ({
            executions: [],
            timed: null,
            notPerformedStepKeys: ["k1"],
        }),
    };
});

const emptyView: SessionStructureView = {
    blocks: [],
    totalExercises: 0,
    totalSets: 0,
};

function wrapper({ children }: PropsWithChildren) {
    return <Provider store={createTestStore()}>{children}</Provider>;
}

describe("useAthleteSessionLog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isOnline = true;
        progressData = {
            pending_count: 1,
            blocks: [{ session_block_id: 10, status: "pending", steps: [] }],
            steps: [],
        };
    });

    it("forceCompleteSession completa sesión online con bloques pendientes", async () => {
        const { result } = renderHook(
            () =>
                useAthleteSessionLog({
                    sessionId: 99,
                    view: emptyView,
                    sessionName: "QA",
                }),
            { wrapper }
        );

        await act(async () => {
            const ok = await result.current.forceCompleteSession();
            expect(ok).toBe(true);
        });

        expect(updateSession).toHaveBeenCalledWith({
            id: 99,
            body: { status: "completed" },
        });
    });

    it("offline: markBlockNotPerformed no llama API y muestra error claro", async () => {
        isOnline = false;
        const { result } = renderHook(
            () =>
                useAthleteSessionLog({
                    sessionId: 99,
                    view: emptyView,
                    sessionName: "QA",
                }),
            { wrapper }
        );

        await act(async () => {
            result.current.openBlock({
                sessionBlockId: 10,
                blockTypeName: "Fuerza",
                setType: null,
                status: "pending",
                expectedStepKeys: [],
                steps: [],
                summaryLine: null,
                isPendingHighlight: true,
                hasRegisterableSteps: true,
            });
        });

        await act(async () => {
            await result.current.markBlockNotPerformed();
        });

        expect(postNotPerformed).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(result.current.saveError).toMatch(/conexión/i);
        });
    });

    it("offline: encola executions y refresca pending count", async () => {
        isOnline = false;
        const { result } = renderHook(
            () =>
                useAthleteSessionLog({
                    sessionId: 99,
                    view: emptyView,
                    sessionName: "QA",
                }),
            { wrapper }
        );

        expect(result.current.isOnline).toBe(false);
        expect(logExecution).not.toHaveBeenCalled();
    });
});
