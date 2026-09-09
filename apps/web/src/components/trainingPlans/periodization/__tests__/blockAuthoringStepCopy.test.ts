/**
 * blockAuthoringStepCopy.test.ts
 */

import { describe, expect, it } from "vitest";
import { getBlockAuthoringStepCopy } from "../blockAuthoringStepCopy";

describe("blockAuthoringStepCopy", () => {
    it("expone título en forma de pregunta para cualidades", () => {
        const copy = getBlockAuthoringStepCopy("qualities");
        expect(copy.title).toMatch(/cualidades físicas/i);
        expect(copy.hint.length).toBeGreaterThan(20);
    });
});
