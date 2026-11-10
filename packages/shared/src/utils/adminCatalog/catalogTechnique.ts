/**
 * catalogTechnique.ts — Técnica del ejercicio en la ficha admin: líneas, límites y envío.
 *
 * Contexto: SPEC_H10 (técnica editable). La ficha edita tres textos (descripción, un paso
 * por línea y un consejo por línea) y manda `technique` en el mismo guardado del bundle.
 * El servidor normaliza y valida igual (R5, R6); esto es el espejo para la ficha.
 * Notas de mantenimiento:
 * - R6: la normalización de líneas debe coincidir con `exercise_technique.normalize_lines`
 *   del backend. Si cambia una, cambia la otra.
 * - R8: en edición solo se manda la técnica si difiere de la guardada; si no, `null`.
 * - R3: se puede cambiar, nunca borrar. Vaciar una técnica que existía es un error.
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import type { CatalogTechniqueIn, CatalogTechniqueOut } from "../../types/adminCatalog";

/** Límites R5, contrastados con el texto existente (máximos: 427, 7 pasos, 290). */
export const CATALOG_TECHNIQUE_LIMITS = {
    descriptionMax: 1000,
    stepsMax: 15,
    tipsMax: 10,
    lineMax: 400,
} as const;

/** Texto tal como se escribe en la ficha: pasos y consejos, uno por línea. */
export interface CatalogTechniqueDraft {
    description: string;
    stepsText: string;
    tipsText: string;
}

export interface CatalogTechniqueCounts {
    descriptionLength: number;
    steps: number;
    tips: number;
}

/** Errores en vivo por campo (solo límites; lo obligatorio se avisa al guardar). */
export interface CatalogTechniqueFieldErrors {
    description: string | null;
    steps: string | null;
    tips: string | null;
}

export interface CatalogTechniqueSubmit {
    /** null = no se toca la técnica (R8). */
    payload: CatalogTechniqueIn | null;
    errors: string[];
}

/** Numeración o viñeta pegada al principio de la línea: «1.», «1)», «-», «•», «*». */
const LEADING_MARKER = /^\s*(?:\d+\s*[.)]|[-•*])\s+/;

function formatCount(value: number): string {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** R6: una línea por paso o consejo, sin vacías, sin espacios en los extremos ni numeración. */
export function techniqueLines(text: string): string[] {
    return text
        .split(/\r\n|\r|\n/)
        .map((line) => line.replace(LEADING_MARKER, "").trim())
        .filter((line) => line.length > 0);
}

export function techniqueDraftFromOut(
    technique: CatalogTechniqueOut | null | undefined
): CatalogTechniqueDraft {
    return {
        description: technique?.description ?? "",
        stepsText: (technique?.steps ?? []).join("\n"),
        tipsText: (technique?.tips ?? []).join("\n"),
    };
}

export function techniqueFromDraft(draft: CatalogTechniqueDraft): CatalogTechniqueIn {
    return {
        description: draft.description.trim(),
        steps: techniqueLines(draft.stepsText),
        tips: techniqueLines(draft.tipsText),
    };
}

export function isTechniqueEmpty(technique: CatalogTechniqueIn): boolean {
    return (
        technique.description.length === 0 &&
        technique.steps.length === 0 &&
        technique.tips.length === 0
    );
}

function sameLines(a: readonly string[], b: readonly string[]): boolean {
    return a.length === b.length && a.every((line, index) => line === b[index]);
}

export function sameTechnique(a: CatalogTechniqueIn, b: CatalogTechniqueIn): boolean {
    return (
        a.description === b.description && sameLines(a.steps, b.steps) && sameLines(a.tips, b.tips)
    );
}

export function techniqueCounts(technique: CatalogTechniqueIn): CatalogTechniqueCounts {
    return {
        descriptionLength: technique.description.length,
        steps: technique.steps.length,
        tips: technique.tips.length,
    };
}

function linesError(
    lines: readonly string[],
    max: number,
    noun: { plural: string; singular: string }
): string | null {
    const { lineMax } = CATALOG_TECHNIQUE_LIMITS;
    if (lines.length > max) {
        return `Hay ${lines.length} ${noun.plural}; el máximo es ${max}.`;
    }
    const index = lines.findIndex((line) => line.length > lineMax);
    if (index >= 0) {
        return `El ${noun.singular} ${index + 1} tiene ${formatCount(
            lines[index]?.length ?? 0
        )} caracteres; el máximo es ${lineMax}.`;
    }
    return null;
}

export function techniqueFieldErrors(technique: CatalogTechniqueIn): CatalogTechniqueFieldErrors {
    const { descriptionMax, stepsMax, tipsMax } = CATALOG_TECHNIQUE_LIMITS;
    const length = technique.description.length;
    return {
        description:
            length > descriptionMax
                ? `La descripción tiene ${formatCount(length)} caracteres; el máximo es ${formatCount(
                      descriptionMax
                  )}.`
                : null,
        steps: linesError(technique.steps, stepsMax, { plural: "pasos", singular: "paso" }),
        tips: linesError(technique.tips, tipsMax, { plural: "consejos", singular: "consejo" }),
    };
}

/** R2, R3 y R5: errores de una técnica que se va a guardar. */
export function techniqueErrors(technique: CatalogTechniqueIn): string[] {
    const errors: string[] = [];
    if (technique.description.length === 0) {
        errors.push("La descripción es obligatoria.");
    }
    if (technique.steps.length === 0) {
        errors.push("Añade al menos un paso de ejecución.");
    }
    const fields = techniqueFieldErrors(technique);
    for (const message of [fields.description, fields.steps, fields.tips]) {
        if (message) errors.push(message);
    }
    return errors;
}

/**
 * Qué técnica manda el guardado. Al crear siempre se manda y es obligatoria (R2). Al editar
 * solo se manda si cambió respecto a la guardada (R8); si cambió, se valida entera, así que
 * vaciar una técnica que existía da error (R3).
 */
export function resolveTechniqueSubmit(
    draft: CatalogTechniqueDraft,
    saved: CatalogTechniqueOut | null | undefined,
    mode: "create" | "edit"
): CatalogTechniqueSubmit {
    const technique = techniqueFromDraft(draft);
    if (mode === "edit") {
        const baseline = techniqueFromDraft(techniqueDraftFromOut(saved));
        if (sameTechnique(technique, baseline)) {
            return { payload: null, errors: [] };
        }
    }
    return { payload: technique, errors: techniqueErrors(technique) };
}
