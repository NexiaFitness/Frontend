/**
 * useAthleteSessionLog.spec.ts — reset al cambiar sesión (R-REG-05).
 */

import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAthleteSessionLog } from "./useAthleteSessionLog";

const { mockProgressQuery } = vi.hoisted(() => ({
    mockProgressQuery: vi.fn(),
}));

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteRunProgressQuery: (...args: unknown[]) => mockProgressQuery(...args),
    usePostAthleteRunExecutionMutation: () => [vi.fn()],
    usePostAthleteRunTimedResultMutation: () => [vi.fn()],
    usePostAthleteRunNotPerformedMutation: () => [vi.fn()],
    usePutAthleteExerciseNoteMutation: () => [vi.fn()],
}));

vi.mock("@nexia/shared/api/trainingSessionsApi", () => ({
    useUpdateTrainingSessionMutation: () => [vi.fn()],
}));

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 1 }),
}));

vi.mock("@nexia/shared/hooks/offline", () => ({
    useOfflineSessionLog: () => ({
        isOnline: true,
        pendingCount: 0,
        registrationSyncBlocked: false,
        logExecution: vi.fn(),
        logTimedResult: vi.fn(),
        finishSession: vi.fn(),
        refreshPendingCount: vi.fn(),
    }),
    REGISTRATION_WINDOW_SYNC_MESSAGE: "",
}));

const emptyView = { blocks: [], totalExercises: 0, totalSets: 0 };

describe("useAthleteSessionLog", () => {
    it("expone registrationKnown tras progress", () => {
        mockProgressQuery.mockReturnValue({
            data: {
                registration_editable: true,
                blocks: [],
                pending_count: 0,
            },
            isLoading: false,
            isFetching: false,
            isError: false,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() =>
            useAthleteSessionLog({
                sessionId: 4445,
                view: emptyView,
                sessionName: "QA",
                sessionDate: "2026-10-02",
            })
        );
        expect(result.current.registrationKnown).toBe(true);
        expect(result.current.logMode).toBe(false);
    });

    it("marca error de progress sin snapshot (M4)", () => {
        mockProgressQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isFetching: false,
            isError: true,
            refetch: vi.fn(),
        });
        const { result } = renderHook(() =>
            useAthleteSessionLog({
                sessionId: 4462,
                view: emptyView,
                sessionName: "QA",
                sessionDate: "2026-10-06",
            })
        );
        expect(result.current.isProgressError).toBe(true);
        expect(result.current.registrationKnown).toBe(true);
        expect(result.current.hasProgressSnapshot).toBe(false);
        expect(result.current.blockSheetState).toBe(null);
    });
});
