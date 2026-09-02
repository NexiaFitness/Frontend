/**
 * blockAuthoringModel.test.ts — Reglas de navegación D-PAP (5 pasos).
 */

import { describe, expect, it } from "vitest";

import {
    BLOCK_AUTHOR_STEP_ORDER,
    canNavigateToBlockAuthorStep,
    nextBlockAuthorStep,
    prevBlockAuthorStep,
} from "../blockAuthoringModel";

describe("blockAuthoringModel", () => {
    it("orders five D-PAP steps", () => {
        expect(BLOCK_AUTHOR_STEP_ORDER).toEqual([
            "qualities",
            "volumeIntensity",
            "days",
            "patterns",
            "summary",
        ]);
    });

    it("nextBlockAuthorStep walks forward until summary", () => {
        expect(nextBlockAuthorStep("qualities")).toBe("volumeIntensity");
        expect(nextBlockAuthorStep("patterns")).toBe("summary");
        expect(nextBlockAuthorStep("summary")).toBeNull();
    });

    it("prevBlockAuthorStep walks backward until qualities", () => {
        expect(prevBlockAuthorStep("days")).toBe("volumeIntensity");
        expect(prevBlockAuthorStep("qualities")).toBeNull();
    });

    it("create mode blocks forward jumps beyond maxReached + 1", () => {
        expect(
            canNavigateToBlockAuthorStep(
                "create",
                "patterns",
                "qualities",
                "volumeIntensity",
            ),
        ).toBe(false);
        expect(
            canNavigateToBlockAuthorStep(
                "create",
                "days",
                "qualities",
                "volumeIntensity",
            ),
        ).toBe(true);
    });

    it("edit mode allows jumping to any step", () => {
        expect(
            canNavigateToBlockAuthorStep(
                "edit",
                "summary",
                "qualities",
                "qualities",
            ),
        ).toBe(true);
    });
});
