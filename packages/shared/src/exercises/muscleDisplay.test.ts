/**
 * muscleDisplay — DC-11 prime mover chips and filters.
 */
import { describe, expect, it } from "vitest";
import {
    exerciseMatchesMuscleFilter,
    exercisePrimeMoverLabels,
    muscleFacetLabel,
} from "./muscleDisplay";

describe("exercisePrimeMoverLabels", () => {
    it("returns all prime movers sorted by priority", () => {
        const ex = {
            muscles: [
                { name_es: "cuádriceps femoral", role: "prime_mover", priority: 2 },
                { name_es: "glúteo mayor", role: "prime_mover", priority: 1 },
            ],
        };
        expect(exercisePrimeMoverLabels(ex)).toEqual([
            "glúteo mayor",
            "cuádriceps femoral",
        ]);
    });

    it("caps at three chips", () => {
        const ex = {
            muscles: [
                { name_es: "a", role: "prime_mover", priority: 1 },
                { name_es: "b", role: "prime_mover", priority: 2 },
                { name_es: "c", role: "prime_mover", priority: 3 },
                { name_es: "d", role: "prime_mover", priority: 4 },
            ],
        };
        expect(exercisePrimeMoverLabels(ex)).toEqual(["a", "b", "c"]);
    });
});

describe("exerciseMatchesMuscleFilter", () => {
    const squat = {
        muscles: [
            { name_es: "glúteo mayor", role: "prime_mover", priority: 1 },
            { name_es: "cuádriceps femoral", role: "prime_mover", priority: 2 },
        ],
    };

    it("matches secondary prime mover in filter", () => {
        expect(exerciseMatchesMuscleFilter(squat, "cuádriceps femoral")).toBe(true);
    });

    it("matches primary prime mover", () => {
        expect(exerciseMatchesMuscleFilter(squat, "glúteo mayor")).toBe(true);
    });

    it("rejects unrelated muscle", () => {
        expect(exerciseMatchesMuscleFilter(squat, "bíceps braquial")).toBe(false);
    });
});

describe("muscleFacetLabel", () => {
    it("returns first prime mover by priority", () => {
        const ex = {
            muscles: [
                { name_es: "erectores espinales", role: "prime_mover", priority: 1 },
                { name_es: "recto abdominal", role: "prime_mover", priority: 2 },
            ],
        };
        expect(muscleFacetLabel(ex)).toBe("erectores espinales");
    });
});
