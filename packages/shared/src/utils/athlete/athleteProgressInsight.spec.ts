/**
 * athleteProgressInsight.spec.ts — Prioridad del veredicto de progreso.
 * @author Frontend Team
 * @since v1.0.3
 */

import { describe, expect, it } from "vitest";
import { buildAthleteProgressInsight } from "./athleteProgressInsight";
import type { RecentRecordRow } from "./athleteProgressUtils";

const emptyAdherence = { percent: null, completed: 0, planned: 0 };

function pr(name: string): RecentRecordRow {
    return {
        exerciseId: 1,
        exerciseName: name,
        maxWeight: 100,
        maxReps: 5,
        trackingDate: "2026-10-01",
        previousMaxWeight: 90,
        isPersonalBest: true,
    };
}

describe("buildAthleteProgressInsight", () => {
    it("prefers a PR over streak", () => {
        const insight = buildAthleteProgressInsight({
            personalRecords: [pr("Sentadilla")],
            consecutiveWeeks: 5,
            adherence: emptyAdherence,
            previousAdherence: null,
            lifetimeCompleted: 20,
            nextSessionName: null,
            hasActivePlan: true,
        });
        expect(insight?.kind).toBe("pr");
        expect(insight?.headline).toContain("Sentadilla");
    });

    it("uses streak when there is no PR", () => {
        const insight = buildAthleteProgressInsight({
            personalRecords: [],
            consecutiveWeeks: 3,
            adherence: emptyAdherence,
            previousAdherence: null,
            lifetimeCompleted: 12,
            nextSessionName: null,
            hasActivePlan: true,
        });
        expect(insight?.kind).toBe("streak");
        expect(insight?.headline).toContain("3 semanas");
    });

    it("uses adherence lift after streak is too short", () => {
        const insight = buildAthleteProgressInsight({
            personalRecords: [],
            consecutiveWeeks: 1,
            adherence: { percent: 80, completed: 4, planned: 5 },
            previousAdherence: { percent: 60, completed: 3, planned: 5 },
            lifetimeCompleted: 20,
            nextSessionName: null,
            hasActivePlan: true,
        });
        expect(insight?.kind).toBe("adherence_up");
    });

    it("welcomes the first sessions", () => {
        const insight = buildAthleteProgressInsight({
            personalRecords: [],
            consecutiveWeeks: 1,
            adherence: { percent: 100, completed: 2, planned: 2 },
            previousAdherence: null,
            lifetimeCompleted: 2,
            nextSessionName: "Pierna",
            hasActivePlan: true,
        });
        expect(insight?.kind).toBe("welcome");
    });

    it("offers resume when adherence is low", () => {
        const insight = buildAthleteProgressInsight({
            personalRecords: [],
            consecutiveWeeks: 1,
            adherence: { percent: 40, completed: 2, planned: 5 },
            previousAdherence: { percent: 40, completed: 2, planned: 5 },
            lifetimeCompleted: 20,
            nextSessionName: "Torso",
            hasActivePlan: true,
        });
        expect(insight?.kind).toBe("resume");
        expect(insight?.subline).toContain("Torso");
    });

    it("omits verdict when nothing applies", () => {
        expect(
            buildAthleteProgressInsight({
                personalRecords: [],
                consecutiveWeeks: 1,
                adherence: { percent: 80, completed: 4, planned: 5 },
                previousAdherence: { percent: 78, completed: 4, planned: 5 },
                lifetimeCompleted: 20,
                nextSessionName: "Pierna",
                hasActivePlan: true,
            })
        ).toBeNull();
    });
});
