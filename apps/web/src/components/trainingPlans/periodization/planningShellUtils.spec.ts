import { describe, expect, it } from "vitest";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import {
    hasStaleFocusParam,
    isPeriodBlockVisibleInMonth,
    parseFocusedBlockId,
    resolveFocusedBlockId,
} from "./planningShellUtils";

const blocks: PlanPeriodBlock[] = [
    {
        id: 42,
        training_plan_id: 1,
        name: "Fase",
        start_date: "2026-09-01",
        end_date: "2026-09-30",
        volume_level: 5,
        intensity_level: 5,
    } as PlanPeriodBlock,
];

describe("planningShellUtils focus (G9)", () => {
    it("parseFocusedBlockId acepta id presente en bloques", () => {
        const params = new URLSearchParams("focus=42");
        expect(parseFocusedBlockId(params, blocks)).toBe(42);
    });

    it("parseFocusedBlockId rechaza id desconocido", () => {
        const params = new URLSearchParams("focus=999");
        expect(parseFocusedBlockId(params, blocks)).toBeNull();
    });

    it("hasStaleFocusParam detecta focus inválido", () => {
        expect(hasStaleFocusParam(new URLSearchParams("focus=999"), blocks)).toBe(
            true,
        );
        expect(hasStaleFocusParam(new URLSearchParams("focus=42"), blocks)).toBe(
            false,
        );
        expect(hasStaleFocusParam(new URLSearchParams(), blocks)).toBe(false);
    });

    it("resolveFocusedBlockId tolera focus pendiente post-create", () => {
        const params = new URLSearchParams("focus=99");
        expect(parseFocusedBlockId(params, blocks)).toBeNull();
        expect(resolveFocusedBlockId(params, blocks, 99)).toBe(99);
        expect(hasStaleFocusParam(params, blocks, 99)).toBe(false);
    });

    it("isPeriodBlockVisibleInMonth", () => {
        expect(
            isPeriodBlockVisibleInMonth(blocks[0], new Date(2026, 8, 1)),
        ).toBe(true);
        expect(
            isPeriodBlockVisibleInMonth(blocks[0], new Date(2026, 10, 1)),
        ).toBe(false);
    });
});
