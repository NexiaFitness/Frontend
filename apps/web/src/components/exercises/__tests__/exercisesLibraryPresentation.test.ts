import { describe, expect, it } from "vitest";
import {
    EXERCISES_LIBRARY_TITLE_BASE,
    exercisesLibraryHeading,
} from "../exercisesLibraryPresentation";

describe("exercisesLibraryHeading", () => {
    it("returns base title while count is unknown", () => {
        expect(exercisesLibraryHeading(null)).toBe(EXERCISES_LIBRARY_TITLE_BASE);
    });

    it("includes total when count is known", () => {
        expect(exercisesLibraryHeading(107)).toBe("Ejercicios · 107");
        expect(exercisesLibraryHeading(0)).toBe("Ejercicios · 0");
    });
});
