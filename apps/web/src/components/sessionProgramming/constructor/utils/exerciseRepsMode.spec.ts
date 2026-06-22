import { describe, expect, it } from "vitest";
import { getExerciseRepsTipo, mapExerciseRepsToPayload } from "./exerciseRepsMode";

describe("exerciseRepsMode", () => {
    it("mantiene reps cuando otro ejercicio del bloque usa tiempo (row fallback tiempo)", () => {
        expect(
            getExerciseRepsTipo(
                { plannedReps: "10", plannedDuration: null },
                "tiempo"
            )
        ).toBe("reps");
    });

    it("respeta repsTipo por ejercicio al persistir", () => {
        const repsPayload = mapExerciseRepsToPayload({
            repsTipo: "reps",
            plannedReps: "10",
            plannedDuration: null,
            effortCharacter: null,
            effortValue: null,
        });
        const timePayload = mapExerciseRepsToPayload({
            repsTipo: "tiempo",
            plannedReps: null,
            plannedDuration: 30,
            effortCharacter: null,
            effortValue: null,
        });

        expect(repsPayload.planned_reps).toBe("10");
        expect(repsPayload.planned_duration).toBeNull();
        expect(timePayload.planned_reps).toBeNull();
        expect(timePayload.planned_duration).toBe(30);
    });
});
