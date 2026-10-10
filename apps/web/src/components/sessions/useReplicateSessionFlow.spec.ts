/**
 * useReplicateSessionFlow.spec.ts — Replicación mixta y omisiones (D-LOG-INTEGRITY-01).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useReplicateSessionFlow } from "./useReplicateSessionFlow";

const replicateMock = vi.fn();
const showSuccess = vi.fn();
const showError = vi.fn();

vi.mock("@nexia/shared", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@nexia/shared")>();
    return {
        ...actual,
        useGetPeriodBlockQuery: () => ({
            data: {
                start_date: "2026-03-02",
                end_date: "2026-03-29",
            },
            isLoading: false,
        }),
        useReplicateTrainingSessionMutation: () => [replicateMock, { isLoading: false }],
    };
});

vi.mock("@/components/ui/feedback", () => ({
    useToast: () => ({ showSuccess, showError }),
}));

const session = {
    id: 99,
    session_date: "2026-03-02",
    session_name: "QA",
    training_plan_id: 1,
    period_block_id: 2,
};

describe("useReplicateSessionFlow", () => {
    beforeEach(() => {
        replicateMock.mockReset();
        showSuccess.mockReset();
        showError.mockReset();
    });

    it("mezcla creadas y omitidas (past_target_date) sin error", async () => {
        replicateMock.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    count: 2,
                    created_sessions: [],
                    conflicts_skipped: [
                        {
                            week_ordinal: 1,
                            period_block_id: 2,
                            session_date: "2026-02-23",
                            reason: "past_target_date",
                        },
                    ],
                }),
        });

        const { result } = renderHook(() => useReplicateSessionFlow(session));

        await act(async () => {
            await result.current.handleReplicate();
        });

        expect(showError).not.toHaveBeenCalled();
        expect(showSuccess).toHaveBeenCalledWith(
            expect.stringContaining("2 sesiones replicadas"),
        );
        expect(showSuccess).toHaveBeenCalledWith(
            expect.stringContaining("fecha anterior a hoy"),
        );
    });

    it("motivo desconocido no lanza y muestra éxito parcial", async () => {
        replicateMock.mockReturnValue({
            unwrap: () =>
                Promise.resolve({
                    count: 1,
                    created_sessions: [],
                    conflicts_skipped: [
                        {
                            week_ordinal: 3,
                            period_block_id: 2,
                            session_date: "2026-03-16",
                            reason: "new_backend_reason",
                        },
                    ],
                }),
        });

        const { result } = renderHook(() => useReplicateSessionFlow(session));

        await act(async () => {
            await result.current.handleReplicate();
        });

        expect(showError).not.toHaveBeenCalled();
        expect(showSuccess).toHaveBeenCalledWith(
            expect.stringContaining("motivo no reconocido"),
        );
    });
});
