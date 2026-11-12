/**
 * replicateSessionPresentation.spec.ts — Copy de omisiones de replicación (D10, D11).
 */

import { describe, expect, it } from "vitest";

import {
    buildReplicateOutcomeMessage,
    replicateEmptyWeeksMessage,
    replicateSkipReasonLabel,
} from "./replicateSessionPresentation";

describe("replicateEmptyWeeksMessage", () => {
    it("bloque 7 días: el día no se repite", () => {
        expect(replicateEmptyWeeksMessage(1)).toBe(
            "Este día no se repite en otras semanas del bloque.",
        );
    });

    it("hay otras semanas ocupadas pero ya pasaron", () => {
        expect(replicateEmptyWeeksMessage(2)).toContain("ya pasaron");
    });
});

describe("replicateSessionPresentation", () => {
    it("past_target_date y protected_session (D10/D11)", () => {
        const message = buildReplicateOutcomeMessage(
            1,
            {
                protectedItems: [{ week_ordinal: 2 } as never],
                pastTargetDate: [{ week_ordinal: 1 } as never],
                outsideBlock: [],
                unknown: [],
            },
            "replicate",
        );
        expect(message).toContain("registro del atleta");
        expect(message).toContain("fecha anterior a hoy");
        expect(replicateSkipReasonLabel("past_target_date")).toBe(
            "Fecha anterior a hoy: no se replica",
        );
        expect(replicateSkipReasonLabel("protected_session")).toBe(
            "Con registro del atleta: no se modifica",
        );
    });
});
