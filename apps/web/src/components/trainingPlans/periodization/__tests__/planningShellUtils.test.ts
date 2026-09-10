import { describe, expect, it } from "vitest";

import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import { resolveNextPhaseStartDate } from "../planningShellUtils";

function block(id: number, start: string, end: string): PlanPeriodBlock {
    return {
        id,
        training_plan_id: 1,
        start_date: start,
        end_date: end,
        volume_level: 5,
        intensity_level: 5,
        qualities: [],
        name: null,
        sort_order: id,
    };
}

describe("resolveNextPhaseStartDate", () => {
    it("devuelve planStartDate si no hay bloques", () => {
        expect(resolveNextPhaseStartDate([], "2026-09-08")).toBe("2026-09-08");
    });

    it("salta al día libre tras el bloque más tardío", () => {
        const blocks = [block(1, "2026-09-08", "2026-09-30")];
        expect(resolveNextPhaseStartDate(blocks, "2026-09-08")).toBe(
            "2026-10-01",
        );
    });
});
