import { describe, expect, it } from "vitest";

import { createMockPlanPeriodBlock } from "@/test-utils/fixtures/planning";

import { resolveNextPhaseStartDate } from "../planningShellUtils";

describe("resolveNextPhaseStartDate", () => {
    it("devuelve planStartDate si no hay bloques", () => {
        expect(resolveNextPhaseStartDate([], "2026-09-08")).toBe("2026-09-08");
    });

    it("salta al día libre tras el bloque más tardío", () => {
        const blocks = [
            createMockPlanPeriodBlock({
                id: 1,
                start_date: "2026-09-08",
                end_date: "2026-09-30",
            }),
        ];
        expect(resolveNextPhaseStartDate(blocks, "2026-09-08")).toBe(
            "2026-10-01",
        );
    });
});
