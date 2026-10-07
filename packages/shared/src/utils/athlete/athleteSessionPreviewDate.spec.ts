import { describe, expect, it } from "vitest";
import {
    formatAthleteSessionExerciseSetSummary,
    formatAthleteSessionPreviewDate,
} from "./athleteSessionUtils";

describe("formatAthleteSessionPreviewDate", () => {
    it("capitalizes weekday and keeps month lowercase (es-ES)", () => {
        const formatted = formatAthleteSessionPreviewDate("2026-10-09");
        expect(formatted.startsWith("Viernes")).toBe(true);
        expect(formatted).toMatch(/octubre/);
        expect(formatted).not.toMatch(/Octubre/);
    });
});

describe("formatAthleteSessionExerciseSetSummary", () => {
    it("singulariza ejercicio y serie", () => {
        expect(formatAthleteSessionExerciseSetSummary(1, 1)).toBe(
            "1 ejercicio · 1 serie"
        );
    });

    it("pluraliza cuando hace falta", () => {
        expect(formatAthleteSessionExerciseSetSummary(3, 12)).toBe(
            "3 ejercicios · 12 series"
        );
    });
});
