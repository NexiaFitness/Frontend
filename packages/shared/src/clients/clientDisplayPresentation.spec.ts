import { describe, expect, it } from "vitest";
import {
    formatTemplateAssignEndDate,
    labelClientExperience,
    labelClientProfileFields,
    labelSessionDuration,
    labelSessionType,
    labelTrainingGoal,
} from "./clientDisplayPresentation";

describe("labelTrainingGoal", () => {
    it("translates snake_case goals", () => {
        expect(labelTrainingGoal("hypertrophy")).toBe("Hipertrofia");
        expect(labelTrainingGoal("weight_loss")).toBe("Pérdida de peso");
    });

    it("returns fallback for empty", () => {
        expect(labelTrainingGoal(null)).toBe("No definido");
    });
});

describe("labelClientExperience", () => {
    it("keeps Spanish enum values", () => {
        expect(labelClientExperience("Media")).toBe("Media");
    });
});

describe("labelSessionDuration", () => {
    it("translates duration enum", () => {
        expect(labelSessionDuration("medium_1h_to_1h30")).toBe("1 h – 1 h 30");
    });
});

describe("labelSessionType", () => {
    it("translates strength", () => {
        expect(labelSessionType("strength")).toBe("Fuerza");
    });
});

describe("labelClientProfileFields", () => {
    it("humanizes missing field keys", () => {
        expect(labelClientProfileFields(["session_duration", "experiencia"])).toBe(
            "Duración de sesión, Nivel de experiencia",
        );
    });
});

describe("formatTemplateAssignEndDate", () => {
    it("includes week count when provided", () => {
        expect(formatTemplateAssignEndDate("2026-08-24", 4)).toContain("4 semanas");
    });
});
