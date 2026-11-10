/**
 * catalogTechnique.spec.ts — Normalización, límites y envío de la técnica (SPEC_H10).
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import { describe, expect, it } from "vitest";

import {
    CATALOG_TECHNIQUE_LIMITS,
    resolveTechniqueSubmit,
    techniqueCounts,
    techniqueDraftFromOut,
    techniqueFieldErrors,
    techniqueFromDraft,
    techniqueLines,
} from "./catalogTechnique";

const saved = {
    description: "Una variación de plancha lateral.",
    steps: ["Acuéstate de lado.", "Levanta las caderas."],
    tips: ["No hundas la cadera."],
};

describe("techniqueLines (R6)", () => {
    it("una línea por paso, sin vacías ni espacios en los extremos", () => {
        expect(techniqueLines("  Uno  \n\n Dos\r\nTres\r\n")).toEqual(["Uno", "Dos", "Tres"]);
    });

    it("quita la numeración o viñeta pegada al principio", () => {
        expect(techniqueLines("1. Uno\n2) Dos\n- Tres\n• Cuatro\n* Cinco")).toEqual([
            "Uno",
            "Dos",
            "Tres",
            "Cuatro",
            "Cinco",
        ]);
    });

    it("no confunde una cifra del texto con numeración", () => {
        expect(techniqueLines("1.5 kg en cada mano\n3 series")).toEqual([
            "1.5 kg en cada mano",
            "3 series",
        ]);
    });
});

describe("borrador", () => {
    it("ida y vuelta desde la técnica guardada", () => {
        expect(techniqueFromDraft(techniqueDraftFromOut(saved))).toEqual(saved);
    });

    it("sin técnica guardada empieza vacío", () => {
        expect(techniqueDraftFromOut(null)).toEqual({ description: "", stepsText: "", tipsText: "" });
    });

    it("cuenta caracteres, pasos y consejos ya normalizados", () => {
        expect(techniqueCounts(saved)).toEqual({ descriptionLength: 33, steps: 2, tips: 1 });
    });
});

describe("límites (R5)", () => {
    it("avisa por campo al superar un límite", () => {
        const long = "x".repeat(CATALOG_TECHNIQUE_LIMITS.lineMax + 1);
        const errors = techniqueFieldErrors({
            description: "d".repeat(CATALOG_TECHNIQUE_LIMITS.descriptionMax + 1),
            steps: ["Uno", long],
            tips: Array.from({ length: CATALOG_TECHNIQUE_LIMITS.tipsMax + 1 }, (_, i) => `C${i}`),
        });
        expect(errors.description).toBe("La descripción tiene 1.001 caracteres; el máximo es 1.000.");
        expect(errors.steps).toBe("El paso 2 tiene 401 caracteres; el máximo es 400.");
        expect(errors.tips).toBe("Hay 11 consejos; el máximo es 10.");
    });

    it("dentro de los límites no hay error", () => {
        expect(techniqueFieldErrors(saved)).toEqual({ description: null, steps: null, tips: null });
    });
});

describe("resolveTechniqueSubmit", () => {
    it("al crear, la técnica es obligatoria (R2)", () => {
        const result = resolveTechniqueSubmit(techniqueDraftFromOut(null), null, "create");
        expect(result.errors).toEqual([
            "La descripción es obligatoria.",
            "Añade al menos un paso de ejecución.",
        ]);
    });

    it("al editar sin cambios no manda nada (R8)", () => {
        const draft = techniqueDraftFromOut(saved);
        expect(resolveTechniqueSubmit(draft, saved, "edit")).toEqual({ payload: null, errors: [] });
    });

    it("al editar, espacios o numeración añadidos no cuentan como cambio (R8)", () => {
        const draft = { ...techniqueDraftFromOut(saved), stepsText: "1. Acuéstate de lado.\n\n2. Levanta las caderas.  " };
        expect(resolveTechniqueSubmit(draft, saved, "edit").payload).toBeNull();
    });

    it("un ejercicio sin técnica se guarda sin ella si no se escribe nada", () => {
        expect(resolveTechniqueSubmit(techniqueDraftFromOut(null), null, "edit")).toEqual({
            payload: null,
            errors: [],
        });
    });

    it("un cambio manda la técnica entera, normalizada", () => {
        const draft = { ...techniqueDraftFromOut(saved), tipsText: "" };
        expect(resolveTechniqueSubmit(draft, saved, "edit")).toEqual({
            payload: { ...saved, tips: [] },
            errors: [],
        });
    });

    it("vaciar una técnica que existía es un error (R3)", () => {
        const result = resolveTechniqueSubmit(techniqueDraftFromOut(null), saved, "edit");
        expect(result.errors).toContain("La descripción es obligatoria.");
    });
});
