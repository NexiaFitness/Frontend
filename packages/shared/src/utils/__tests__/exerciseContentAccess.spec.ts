import { describe, expect, it } from "vitest";

import { canReadExerciseContent } from "../exerciseContentAccess";

describe("canReadExerciseContent", () => {
    it("deja leer al entrenador y al admin", () => {
        expect(canReadExerciseContent("trainer")).toBe(true);
        expect(canReadExerciseContent("admin")).toBe(true);
    });

    it("deja fuera al atleta y a quien no tiene rol", () => {
        expect(canReadExerciseContent("athlete")).toBe(false);
        expect(canReadExerciseContent(null)).toBe(false);
        expect(canReadExerciseContent(undefined)).toBe(false);
    });
});
