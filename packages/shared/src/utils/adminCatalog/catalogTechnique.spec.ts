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
    splitPastedLines,
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
        expect(techniqueDraftFromOut(null)).toEqual({ description: "", steps: [""], tips: [] });
    });

    it("un paso con varias líneas pegadas cuenta como varios pasos", () => {
        const draft = { ...techniqueDraftFromOut(saved), steps: ["1. Uno\n2. Dos", "", "Tres"] };
        expect(techniqueFromDraft(draft).steps).toEqual(["Uno", "Dos", "Tres"]);
    });

    it("pegar varias líneas da una entrada por línea, sin numeración", () => {
        expect(splitPastedLines("1. Coloca la barra.\r\n\n2) Baja.")).toEqual([
            "Coloca la barra.",
            "Baja.",
        ]);
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
        expect(resolveTechniqueSubmit(draft, saved, "edit").payload).toBeNull();
    });

    it("al editar, espacios o numeración añadidos no cuentan como cambio (R8)", () => {
        const draft = {
            ...techniqueDraftFromOut(saved),
            steps: ["1. Acuéstate de lado.", "", "2. Levanta las caderas.  "],
        };
        expect(resolveTechniqueSubmit(draft, saved, "edit").payload).toBeNull();
    });

    it("un ejercicio sin técnica se guarda sin ella si no se escribe nada", () => {
        const result = resolveTechniqueSubmit(techniqueDraftFromOut(null), null, "edit");
        expect(result.payload).toBeNull();
        expect(result.errors).toEqual([]);
    });

    it("un cambio manda la técnica entera, normalizada", () => {
        const draft = { ...techniqueDraftFromOut(saved), tips: [] };
        const result = resolveTechniqueSubmit(draft, saved, "edit");
        expect(result.payload).toEqual({ ...saved, tips: [] });
        expect(result.errors).toEqual([]);
    });

    it("vaciar una técnica que existía es un error (R3)", () => {
        const result = resolveTechniqueSubmit(techniqueDraftFromOut(null), saved, "edit");
        expect(result.errors).toContain("La descripción es obligatoria.");
        expect(result.fieldErrors).toEqual({
            description: "La descripción es obligatoria.",
            steps: "Añade al menos un paso de ejecución.",
            tips: null,
        });
    });

    it("adoptar sin texto no manda técnica: el servidor copia la del candidato", () => {
        const result = resolveTechniqueSubmit(techniqueDraftFromOut(null), null, "adopt");
        expect(result.payload).toBeNull();
        expect(result.errors).toEqual([]);
    });

    it("adoptar con texto lo valida como al crear", () => {
        const draft = { ...techniqueDraftFromOut(null), description: "Qué es." };
        const result = resolveTechniqueSubmit(draft, null, "adopt");
        expect(result.errors).toEqual(["Añade al menos un paso de ejecución."]);
    });
});
