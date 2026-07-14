/**
 * athleteSessionPreviewUtils.spec.ts
 */

import { describe, expect, it } from "vitest";
import { buildAthletePreviewGroupRows } from "./athleteSessionPreviewUtils";
import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";

function supersetGroup(): SessionExerciseGroupView {
    return {
        groupId: "g1",
        kind: "superset",
        badgeLabel: "SUPERSET A",
        rounds: 3,
        timeCapMinutes: null,
        intervalSeconds: null,
        restBetweenSeconds: 90,
        slots: [
            {
                slotLabel: "A1",
                exerciseId: 1,
                exerciseName: "Curl martillo",
                notes: null,
                sets: [{ label: "R1", index: 1, plannedReps: "10", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 1 }],
            },
            {
                slotLabel: "A2",
                exerciseId: 2,
                exerciseName: "Extensión tríceps",
                notes: null,
                sets: [{ label: "R1", index: 1, plannedReps: "12", plannedWeight: null, plannedDuration: null, plannedRest: null, effortCharacter: null, effortValue: null, actualReps: null, actualWeight: null, actualEffortValue: null, rowLoggedSets: 0, sourceLineId: 2 }],
            },
        ],
    };
}

describe("buildAthletePreviewGroupRows", () => {
    it("superset → una fila con rondas", () => {
        const rows = buildAthletePreviewGroupRows(supersetGroup());
        expect(rows).toHaveLength(1);
        expect(rows[0]?.title).toBe("SUPERSET A");
        expect(rows[0]?.detail).toContain("3 rondas");
        expect(rows[0]?.detail).toContain("Curl martillo");
    });
});
