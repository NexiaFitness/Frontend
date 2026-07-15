import { describe, expect, it } from "vitest";
import {
    EXERCISE_LOAD_TYPE,
    exerciseLoadTypeLabel,
    exerciseLoadTypeMatchesFilter,
    isExerciseLoadType,
    normalizeExerciseLoadType,
} from "./exerciseLoadType";

describe("normalizeExerciseLoadType", () => {
    it("maps legacy aliases to external", () => {
        expect(normalizeExerciseLoadType("ext")).toBe(EXERCISE_LOAD_TYPE.EXTERNAL);
        expect(normalizeExerciseLoadType("free_weight")).toBe(EXERCISE_LOAD_TYPE.EXTERNAL);
    });

    it("accepts canonical enum values", () => {
        expect(normalizeExerciseLoadType("bodyweight")).toBe(EXERCISE_LOAD_TYPE.BODYWEIGHT);
        expect(normalizeExerciseLoadType("mixed")).toBe(EXERCISE_LOAD_TYPE.MIXED);
    });

    it("returns null for unknown or empty", () => {
        expect(normalizeExerciseLoadType("")).toBeNull();
        expect(normalizeExerciseLoadType(null)).toBeNull();
        expect(normalizeExerciseLoadType("invalid")).toBeNull();
    });
});

describe("exerciseLoadTypeLabel", () => {
    it("returns Spanish label for canonical values", () => {
        expect(exerciseLoadTypeLabel("external")).toBe("Carga externa");
        expect(exerciseLoadTypeLabel("ext")).toBe("Carga externa");
    });
});

describe("exerciseLoadTypeMatchesFilter", () => {
    it("matches normalized load type", () => {
        expect(exerciseLoadTypeMatchesFilter("ext", EXERCISE_LOAD_TYPE.EXTERNAL)).toBe(true);
        expect(exerciseLoadTypeMatchesFilter("bodyweight", EXERCISE_LOAD_TYPE.EXTERNAL)).toBe(
            false
        );
        expect(exerciseLoadTypeMatchesFilter("external", "all")).toBe(true);
    });
});

describe("isExerciseLoadType", () => {
    it("validates canonical and legacy values", () => {
        expect(isExerciseLoadType("mixed")).toBe(true);
        expect(isExerciseLoadType("free_weight")).toBe(true);
        expect(isExerciseLoadType("compound")).toBe(false);
    });
});
