/**
 * athleteRunGroupRoundPersist.spec.ts — S4/S5 persistencia ronda guiada.
 */

import { describe, expect, it } from "vitest";

import {
    isSlotReadyToPersist,
    shouldSkipSlotOnGroupRoundSave,
} from "./athleteRunGroupRoundPersist";

describe("athleteRunGroupRoundPersist (H2)", () => {
    it("S4 / D-B3: weight_reps con peso null es persistible si hay reps", () => {
        expect(
            isSlotReadyToPersist({ weight: null, reps: 12 }, "weight_reps")
        ).toBe(true);
        expect(
            isSlotReadyToPersist({ weight: null, reps: 0 }, "weight_reps")
        ).toBe(false);
    });

    it("S5: slot completado se omite salvo tocado de nuevo", () => {
        const completed = new Set(["slot-a"]);
        const touched = new Set<string>();
        expect(shouldSkipSlotOnGroupRoundSave("slot-a", completed, touched)).toBe(
            true
        );
        touched.add("slot-a");
        expect(shouldSkipSlotOnGroupRoundSave("slot-a", completed, touched)).toBe(
            false
        );
    });
});
