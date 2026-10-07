import { describe, expect, it } from "vitest";
import { formatAthleteSessionPreviewDate } from "./athleteSessionUtils";

describe("formatAthleteSessionPreviewDate", () => {
    it("capitalizes weekday and keeps month lowercase (es-ES)", () => {
        const formatted = formatAthleteSessionPreviewDate("2026-10-09");
        expect(formatted.startsWith("Viernes")).toBe(true);
        expect(formatted).toMatch(/octubre/);
        expect(formatted).not.toMatch(/Octubre/);
    });
});
