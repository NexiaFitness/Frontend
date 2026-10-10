/**
 * useAthleteRunLoggerTouchState.spec.ts — R-LOG-06 reset al cambiar paso.
 */

import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { buildRunLoggerFieldTouchKey } from "@nexia/shared/utils/athlete/runLoggerHydrationPolicy";
import { useAthleteRunLoggerTouchState } from "./useAthleteRunLoggerTouchState";

describe("useAthleteRunLoggerTouchState", () => {
    it("clears field marks when currentStepKey changes", () => {
        const { result, rerender } = renderHook(
            ({ stepKey }: { stepKey: string | undefined }) =>
                useAthleteRunLoggerTouchState(stepKey),
            { initialProps: { stepKey: "round-1" as string | undefined } }
        );

        act(() => {
            result.current.markSlotField("slot-a", "weight");
        });
        expect(
            result.current
                .getTouchedSnapshot()
                .has(buildRunLoggerFieldTouchKey("slot", "slot-a", "weight"))
        ).toBe(true);

        rerender({ stepKey: "round-2" });
        expect(result.current.getTouchedSnapshot().size).toBe(0);
    });
});
