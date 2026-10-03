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
    it("incluye athlete_note en payload_json cuando hay nota", () => {
        const payload = buildEmomTimedResultPayload({
            sessionId: 4436,
            runStep,
            intervals: [{ intervalKey: "i1", minuteIndex: 1, minuteTotal: 1, slots: [] }],
            asPlanned: false,
            failedCount: 1,
            athleteNote: "QA-1C fatiga",
        });
        const parsed = JSON.parse(payload.payload_json ?? "{}") as {
            athlete_note?: string;
            as_planned?: boolean;
        };
        expect(parsed.athlete_note).toBe("QA-1C fatiga");
        expect(parsed.as_planned).toBe(false);
    });
});
