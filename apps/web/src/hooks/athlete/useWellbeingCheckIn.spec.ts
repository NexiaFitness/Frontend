import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWellbeingCheckIn } from "./useWellbeingCheckIn";

const unwrap = vi.fn();

vi.mock("@nexia/shared/api/trainingSessionsApi", () => ({
    useSubmitWellbeingCheckInMutation: () => [
        (args: unknown) => ({ unwrap: () => unwrap(args) }),
        { isLoading: false },
    ],
}));

describe("useWellbeingCheckIn (B7)", () => {
    it("devuelve failed sin lanzar cuando la API falla", async () => {
        unwrap.mockRejectedValueOnce(new Error("network"));
        const { result } = renderHook(() => useWellbeingCheckIn(99));

        let outcome: string | undefined;
        await act(async () => {
            outcome = await result.current.submit(2);
        });

        expect(outcome).toBe("failed");
    });
});
