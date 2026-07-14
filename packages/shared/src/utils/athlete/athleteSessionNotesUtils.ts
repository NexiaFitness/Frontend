/**
 * athleteSessionNotesUtils.ts — Notas de sesión atleta vs avisos sistema (coherencia).
 * Alineado con backend COHERENCE_NOTES_PREFIX en crud/planning/coherence.py
 */

/** Bloques persistidos por validate_session_coherence — no mostrar al atleta como nota del entrenador. */
export const COHERENCE_NOTES_PREFIX = "[Avisos de coherencia:";
export const COHERENCE_NOTES_PREFIX_LEGACY = "[Coherence Warnings:";

const COHERENCE_BLOCK_RE =
    /\[(?:Avisos de coherencia|Coherence Warnings):[^\]]*\]/gi;

/** Elimina bloques de avisos de coherencia del texto de notas. */
export function stripCoherenceWarningsFromNotes(notes: string): string {
    return notes
        .replace(COHERENCE_BLOCK_RE, "")
        .replace(/\n{2,}/g, "\n")
        .trim();
}

/** True si queda texto legible para el atleta tras quitar avisos automáticos. */
export function hasHumanTrainerNote(notes: string | null | undefined): boolean {
    if (!notes?.trim()) return false;
    return stripCoherenceWarningsFromNotes(notes).length > 0;
}

/** Texto para mostrar al atleta (sin avisos de coherencia). */
export function formatTrainerNoteForAthlete(notes: string): string {
    return stripCoherenceWarningsFromNotes(notes);
}
