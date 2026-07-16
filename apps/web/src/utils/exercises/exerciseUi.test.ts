import { describe, expect, it } from "vitest";
import { isComplexExerciseTipo, tipoLabelFromBackend } from "./exerciseUi";

describe("tipoLabelFromBackend", () => {
    it("maps monoarticular to Aislamiento", () => {
        expect(tipoLabelFromBackend("monoarticular")).toBe("Aislamiento");
    });

    it("maps multiarticular to Compuesto", () => {
        expect(tipoLabelFromBackend("multiarticular")).toBe("Compuesto");
    });

    it("maps complex to Complejo", () => {
        expect(tipoLabelFromBackend("complex")).toBe("Complejo");
    });

    it("falls back unknown values to Compuesto", () => {
        expect(tipoLabelFromBackend("")).toBe("Compuesto");
        expect(tipoLabelFromBackend("unknown")).toBe("Compuesto");
    });
});

describe("isComplexExerciseTipo", () => {
    it("returns true only for complex", () => {
        expect(isComplexExerciseTipo("complex")).toBe(true);
        expect(isComplexExerciseTipo("Complex")).toBe(true);
        expect(isComplexExerciseTipo("multiarticular")).toBe(false);
        expect(isComplexExerciseTipo("monoarticular")).toBe(false);
    });
});
