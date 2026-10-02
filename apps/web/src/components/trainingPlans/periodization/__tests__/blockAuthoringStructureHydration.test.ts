/**
 * blockAuthoringStructureHydration.test.ts — F7 hidratación única por blockId.
 */

import { describe, expect, it } from "vitest";

import { shouldFetchWeeklyStructureHydration } from "../blockAuthoringStructureHydration";

describe("shouldFetchWeeklyStructureHydration", () => {
    it("no fetch si ya hidratado para el mismo blockId", () => {
        expect(
            shouldFetchWeeklyStructureHydration({
                mode: "edit",
                blockId: 76,
                structureLoaded: false,
                hydratedBlockId: 76,
            }),
        ).toBe(false);
    });

    it("fetch en edit cuando blockId distinto al hidratado", () => {
        expect(
            shouldFetchWeeklyStructureHydration({
                mode: "edit",
                blockId: 76,
                structureLoaded: false,
                hydratedBlockId: null,
            }),
        ).toBe(true);
    });

    it("no fetch en create", () => {
        expect(
            shouldFetchWeeklyStructureHydration({
                mode: "create",
                blockId: 76,
                structureLoaded: false,
                hydratedBlockId: null,
            }),
        ).toBe(false);
    });
});
