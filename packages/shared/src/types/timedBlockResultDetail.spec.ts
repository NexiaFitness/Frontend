/**
 * timedBlockResultDetail.spec.ts — Helpers lectura detail tipado (ex parseTimedBlockResultPayload).
 */

import { describe, expect, it } from "vitest";
import { emomAthleteNoteFromDetail } from "./timedBlockResultDetail";

describe("emomAthleteNoteFromDetail", () => {
    it("extrae nota cuando as_planned es false", () => {
        expect(
            emomAthleteNoteFromDetail({
                kind: "emom",
                interval_total: 6,
                as_planned: false,
                athlete_note: "  Paré en el 4  ",
            })
        ).toBe("Paré en el 4");
    });

    it("ignora nota vacía", () => {
        expect(
            emomAthleteNoteFromDetail({
                kind: "emom",
                interval_total: 6,
                as_planned: false,
                athlete_note: "   ",
            })
        ).toBeNull();
    });

    it("devuelve null si no es EMOM", () => {
        expect(
            emomAthleteNoteFromDetail({
                kind: "amrap",
                partial_total: 0,
                partial_by_slot: {},
            })
        ).toBeNull();
    });
});
