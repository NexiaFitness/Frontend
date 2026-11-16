import { describe, expect, it } from "vitest";

import {
    formatClientIdentityLine,
    labelPhysicalQualitySlug,
    labelSessionType,
    labelTrainingGoal,
    STANDALONE_SESSION_KIND_LABEL_ES,
} from "./clientDisplayPresentation";

describe("labelTrainingGoal", () => {
    it("traduce hypertrophy a Hipertrofia", () => {
        expect(labelTrainingGoal("hypertrophy")).toBe("Hipertrofia");
    });
});

describe("labelPhysicalQualitySlug", () => {
    it("no convierte primary en Primary", () => {
        expect(labelPhysicalQualitySlug("primary")).toBe("Primario");
    });

    it("traduce hypertrophy sin Title Case inglés", () => {
        expect(labelPhysicalQualitySlug("hypertrophy")).toBe("Hipertrofia");
    });

    it("traduce fuerza_maxima con tilde, no el slug", () => {
        expect(labelPhysicalQualitySlug("fuerza_maxima")).toBe("Fuerza máxima");
    });
});

describe("labelSessionType", () => {
    it("pinta Técnica y Evaluación con tilde, no el slug ni el texto sin acento", () => {
        expect(labelSessionType("technique")).toBe("Técnica");
        expect(labelSessionType("TECHNIQUE")).toBe("Técnica");
        expect(labelSessionType("assessment")).toBe("Evaluación");
        expect(labelSessionType("strength")).toBe("Fuerza");
        expect(labelSessionType("endurance")).toBe("Resistencia");
        expect(labelSessionType("")).toBe("Sesión");
        expect(labelSessionType(null)).toBe("Sesión");
    });
});

describe("STANDALONE_SESSION_KIND_LABEL_ES", () => {
    it("lleva tilde en Sesión", () => {
        expect(STANDALONE_SESSION_KIND_LABEL_ES).toBe("Sesión libre");
        expect(STANDALONE_SESSION_KIND_LABEL_ES).not.toMatch(/Sesion\b/);
    });
});

describe("formatClientIdentityLine", () => {
    it("pone el objetivo en español, no el slug", () => {
        expect(
            formatClientIdentityLine({
                nombre: "Diana",
                apellidos: "QA",
                objetivo_entrenamiento: "hypertrophy",
            }),
        ).toBe("Diana · QA · Hipertrofia");
    });

    it("omite el objetivo si viene vacío", () => {
        expect(
            formatClientIdentityLine({
                nombre: "Bruno",
                apellidos: "QA",
                objetivo_entrenamiento: null,
            }),
        ).toBe("Bruno · QA");
    });
});
