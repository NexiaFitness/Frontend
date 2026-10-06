import { describe, expect, it } from "vitest";
import { computeEpley1RmKg, formatLastMarkLine } from "./athleteExerciseOneRm";
import type { AthleteLastPerformance } from "../../types/athleteLastPerformance";

describe("computeEpley1RmKg", () => {
    it("returns weight for single rep", () => {
        expect(computeEpley1RmKg(80, 1)).toBe(80);
    });

    it("estimates for submax sets", () => {
        expect(computeEpley1RmKg(100, 10)).toBe(133.3);
    });
});

describe("formatLastMarkLine", () => {
    it("formats weight and reps", () => {
        const perf: AthleteLastPerformance = {
            exercise_id: 1,
            client_id: 1,
            applies_one_rm: true,
            one_rm_kg: null,
            one_rm_kind: null,
            performed_at: null,
            weight_kg: 20,
            reps: 10,
            rpe: null,
            source: "session_blocks",
        };
        expect(formatLastMarkLine(perf)).toBe("Última marca: 20 kg × 10 reps");
    });
});
