/**
 * timedBlockRunUtils.spec.ts — payloads timed-results (FE-4 EMOM nota).
 */

import { describe, expect, it } from "vitest";
import { buildEmomTimedResultPayload } from "./timedBlockRunUtils";
import type { AthleteRunStep } from "./buildAthleteRunSteps";

const runStep = {
    stepKey: "block-emom-timed",
    groupId: "block-emom",
    blockId: 1,
    timedMode: "countdown_interval",
} as AthleteRunStep;

describe("buildEmomTimedResultPayload", () => {
    it("incluye athlete_note en detail cuando hay nota", () => {
        const payload = buildEmomTimedResultPayload({
            sessionId: 4436,
            runStep,
            intervals: [{ intervalKey: "i1", minuteIndex: 1, minuteTotal: 1, slots: [] }],
            asPlanned: false,
            failedCount: 1,
            athleteNote: "QA-1C fatiga",
        });
        expect(payload.detail?.kind).toBe("emom");
        if (payload.detail?.kind === "emom") {
            expect(payload.detail.athlete_note).toBe("QA-1C fatiga");
            expect(payload.detail.as_planned).toBe(false);
        }
        expect(payload.emom_completed_count).toBeNull();
        expect(payload.emom_failed_count).toBeNull();
    });

    it("Sí → contadores 6/0 explícitos", () => {
        const payload = buildEmomTimedResultPayload({
            sessionId: 4436,
            runStep,
            intervals: [
                { intervalKey: "i1", minuteIndex: 1, minuteTotal: 2, slots: [] },
                { intervalKey: "i2", minuteIndex: 2, minuteTotal: 2, slots: [] },
            ],
            asPlanned: true,
            failedCount: 0,
        });
        expect(payload.emom_completed_count).toBe(2);
        expect(payload.emom_failed_count).toBe(0);
    });
});
