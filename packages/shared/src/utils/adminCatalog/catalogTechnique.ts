/**
 * catalogTechnique.ts — Técnica del ejercicio en la ficha admin: líneas, límites y envío.
 *
 * Contexto: SPEC_H10 (técnica editable). La ficha edita la descripción y dos listas (un
 * campo por paso y por consejo) y manda `technique` en el mismo guardado del bundle. El
 * servidor normaliza y valida igual (exercise_technique.py); esto es el espejo de la ficha.
 * Notas de mantenimiento:
 * - R6: `techniqueLines` y `stripLineMarker` deben coincidir con `normalize_lines` del
 *   backend. Si cambia uno, cambia el otro. Los mensajes también son los mismos.
 * - R8: en edición solo se manda la técnica si difiere de la guardada; si no, `null`.
 * - R3: se puede cambiar, nunca borrar. Vaciar una técnica que existía es un error.
 * - Adoptar desde la Biblioteca: vacía vale `null` y el servidor copia el texto del
 *   candidato; escrita, se valida y manda como al crear.
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

/** Texto tal como se edita: la descripción y una entrada por paso y por consejo. */
export interface CatalogTechniqueDraft {
    description: string;
    steps: string[];
    tips: string[];
}

export type CatalogTechniqueMode = "create" | "edit" | "adopt";

export interface CatalogTechniqueCounts {
    descriptionLength: number;
    steps: number;
    tips: number;
}

/** Error por campo: límites siempre; lo obligatorio, solo si `required`. */
export interface CatalogTechniqueFieldErrors {
    description: string | null;
    steps: string | null;
    tips: string | null;
}

export interface CatalogTechniqueSubmit {
    /** null = no se toca la técnica (R8, o adopción sin texto). */
    payload: CatalogTechniqueIn | null;
    errors: string[];
    fieldErrors: CatalogTechniqueFieldErrors;
}

export const CATALOG_TECHNIQUE_REQUIRED = {
    description: "La descripción es obligatoria.",
    steps: "Añade al menos un paso de ejecución.",
} as const;

/** Numeración o viñeta pegada al principio de la línea: «1.», «1)», «-», «•», «*». */
const LEADING_MARKER = /^\s*(?:\d+\s*[.)]|[-•*])\s+/;
const LINE_BREAK = /\r\n|\r|\n/;

const NO_FIELD_ERRORS: CatalogTechniqueFieldErrors = { description: null, steps: null, tips: null };

function formatCount(value: number): string {
    return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Quita la numeración o viñeta pegada al principio de una línea (R6). */
export function stripLineMarker(line: string): string {
    return line.replace(LEADING_MARKER, "");
}

/** R6: una línea por paso o consejo, sin vacías, sin espacios en los extremos ni numeración. */
export function techniqueLines(text: string): string[] {
    return text
        .split(LINE_BREAK)
        .map((line) => stripLineMarker(line).trim())
        .filter((line) => line.length > 0);
}

/** Texto pegado en un campo de paso: cada línea es una entrada, sin numeración. */
export function splitPastedLines(text: string): string[] {
    return techniqueLines(text);
}

export function emptyTechniqueDraft(): CatalogTechniqueDraft {
    return { description: "", steps: [""], tips: [] };
}

export function techniqueDraftFromOut(
    technique: CatalogTechniqueOut | null | undefined
): CatalogTechniqueDraft {
    if (!technique) return emptyTechniqueDraft();
    return {
        description: technique.description ?? "",
        steps: technique.steps.length > 0 ? [...technique.steps] : [""],
        tips: [...technique.tips],
    };
}

export function techniqueFromDraft(draft: CatalogTechniqueDraft): CatalogTechniqueIn {
    return {
        description: draft.description.trim(),
        steps: techniqueLines(draft.steps.join("\n")),
        tips: techniqueLines(draft.tips.join("\n")),
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

/** Errores por campo. Con `required`, la descripción vacía o sin pasos también (R2, R3). */
export function techniqueFieldErrors(
    technique: CatalogTechniqueIn,
    required = false
): CatalogTechniqueFieldErrors {
    const { descriptionMax, stepsMax, tipsMax } = CATALOG_TECHNIQUE_LIMITS;
    const length = technique.description.length;
    const descriptionLimit =
        length > descriptionMax
            ? `La descripción tiene ${formatCount(length)} caracteres; el máximo es ${formatCount(
                  descriptionMax
              )}.`
            : null;
    const stepsLimit = linesError(technique.steps, stepsMax, { plural: "pasos", singular: "paso" });
    return {
        description:
            required && length === 0 ? CATALOG_TECHNIQUE_REQUIRED.description : descriptionLimit,
        steps:
            required && technique.steps.length === 0 ? CATALOG_TECHNIQUE_REQUIRED.steps : stepsLimit,
        tips: linesError(technique.tips, tipsMax, { plural: "consejos", singular: "consejo" }),
    };
}

/** R2, R3 y R5: errores de una técnica que se va a guardar, en el orden del servidor. */
export function techniqueErrors(technique: CatalogTechniqueIn): string[] {
    const errors: string[] = [];
    if (technique.description.length === 0) errors.push(CATALOG_TECHNIQUE_REQUIRED.description);
    if (technique.steps.length === 0) errors.push(CATALOG_TECHNIQUE_REQUIRED.steps);
    const limits = techniqueFieldErrors(technique);
    for (const message of [limits.description, limits.steps, limits.tips]) {
        if (message) errors.push(message);
    }
    return errors;
}

/**
 * Qué técnica manda el guardado.
 * - Crear: siempre, y es obligatoria (R2).
 * - Editar: solo si cambió respecto a la guardada (R8); si cambió, se valida entera, así
 *   que vaciar una técnica que existía da error (R3).
 * - Adoptar: vacía no se manda (el servidor copia la del candidato); escrita, como al crear.
 */
export function resolveTechniqueSubmit(
    draft: CatalogTechniqueDraft,
    saved: CatalogTechniqueOut | null | undefined,
    mode: CatalogTechniqueMode
): CatalogTechniqueSubmit {
    const technique = techniqueFromDraft(draft);
    const unchanged =
        mode === "edit" && sameTechnique(technique, techniqueFromDraft(techniqueDraftFromOut(saved)));
    if (unchanged || (mode === "adopt" && isTechniqueEmpty(technique))) {
        return { payload: null, errors: [], fieldErrors: NO_FIELD_ERRORS };
    }
    return {
        payload: technique,
        errors: techniqueErrors(technique),
        fieldErrors: techniqueFieldErrors(technique, true),
    };
}
