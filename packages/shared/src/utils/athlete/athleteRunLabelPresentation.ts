/**
 * athleteRunLabelPresentation.ts — Copy atleta para slot/serie (B1 registro + run).
 * Los step_key / slot_label internos no cambian; solo presentación UI.
 */

import type { SessionGroupKind } from "../../sessionProgramming/sessionBlockView";

/** S1 → Serie 1, MAIN → Serie principal, DROP n → Escalón n, R1 → Serie n de la ronda. */
export function formatAthleteSetLabel(setLabel: string): string {
    const trimmed = setLabel.trim();
    const sMatch = /^S(\d+)$/i.exec(trimmed);
    if (sMatch) return `Serie ${sMatch[1]}`;

    const rMatch = /^R(\d+)$/i.exec(trimmed);
    if (rMatch) return `Serie ${rMatch[1]} de la ronda`;

    if (trimmed.toUpperCase() === "MAIN") return "Serie principal";

    const dropMatch = /^DROP\s*(\d+)$/i.exec(trimmed);
    if (dropMatch) return `Escalón ${dropMatch[1]}`;

    return trimmed;
}

/** A1 / índice numérico → Ejercicio N (superset, giant, AMRAP…). */
export function formatAthleteSlotCaption(
    slotLabel: string,
    slotIndexZeroBased: number
): string {
    const trimmed = slotLabel.trim();
    const aMatch = /^A(\d+)$/i.exec(trimmed);
    if (aMatch) return `Ejercicio ${aMatch[1]}`;
    if (/^\d+$/.test(trimmed)) return `Ejercicio ${trimmed}`;
    return `Ejercicio ${slotIndexZeroBased + 1}`;
}

/** Encabezado fila en registro al final: «Sentadilla · Serie 2». */
export function formatAthleteLogExerciseSetHeading(
    exerciseName: string,
    setLabel: string
): string {
    return `${exerciseName} · ${formatAthleteSetLabel(setLabel)}`;
}

/** Etiqueta secundaria bajo nombre en multi-slot logger. */
export function formatAthleteLogSlotSecondaryLabel(input: {
    groupKind?: SessionGroupKind | string | null;
    slotLabel: string;
    slotIndexZeroBased: number;
}): string {
    void input.groupKind;
    return formatAthleteSlotCaption(input.slotLabel, input.slotIndexZeroBased);
}
