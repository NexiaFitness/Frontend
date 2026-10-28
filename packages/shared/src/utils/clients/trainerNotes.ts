/**
 * Notas del entrenador — modelo único de producto.
 *
 * - Edición y ficha: notes_1, notes_2, notes_3 + observaciones (texto adicional).
 * - Lesiones estructuradas: pestaña Lesiones / API (no texto libre en perfil).
 * - lesiones_relevantes: legacy; se absorbe al cargar/guardar y se limpia en API.
 */

import type { Client, ClientFormData } from "../../types/client";

export const TRAINER_NOTES_SECTION_TITLE = "Notas del entrenador";

export const TRAINER_NOTE_FIELD_LABELS = {
    note1: "Nota 1",
    note2: "Nota 2",
    note3: "Nota 3",
    additional: "Notas adicionales",
} as const;

export const TRAINER_NOTES_HEALTH_HINT =
    "Registra lesiones en la pestaña Lesiones de la ficha del cliente.";

export const TRAINER_NOTES_EMPTY = "Sin notas del entrenador.";

const LEGACY_INJURY_PREFIX = "[Migrado desde texto legacy de lesiones]\n";

export interface ResolvedTrainerNotes {
    note1: string;
    note2: string;
    note3: string;
    additional: string;
}

function trimOrEmpty(value: string | null | undefined): string {
    return (value ?? "").trim();
}

/**
 * Combina slots actuales con lesiones_relevantes legacy solo para mostrar/editar.
 * No muta el objeto de entrada.
 */
export function resolveTrainerNotesFromClient(
    client: Pick<
        Client,
        "notes_1" | "notes_2" | "notes_3" | "observaciones" | "lesiones_relevantes"
    >,
): ResolvedTrainerNotes {
    let note1 = trimOrEmpty(client.notes_1);
    let note2 = trimOrEmpty(client.notes_2);
    let note3 = trimOrEmpty(client.notes_3);
    let additional = trimOrEmpty(client.observaciones);

    const legacy = trimOrEmpty(client.lesiones_relevantes);
    if (legacy) {
        const block = `${LEGACY_INJURY_PREFIX}${legacy}`;
        if (!note1) {
            note1 = block;
        } else if (!note2) {
            note2 = block;
        } else if (!note3) {
            note3 = block;
        } else {
            additional = additional ? `${additional}\n\n${block}` : block;
        }
    }

    return { note1, note2, note3, additional };
}

export function hasAnyTrainerNote(notes: ResolvedTrainerNotes): boolean {
    return Boolean(
        notes.note1 || notes.note2 || notes.note3 || notes.additional,
    );
}

/**
 * Estado inicial del formulario (alta/edición) alineado con la ficha.
 */
export function normalizeClientFormTrainerNotes(
    data: ClientFormData,
): ClientFormData {
    const resolved = resolveTrainerNotesFromClient(data);
    return {
        ...data,
        notes_1: resolved.note1 || null,
        notes_2: resolved.note2 || null,
        notes_3: resolved.note3 || null,
        observaciones: resolved.additional || null,
        lesiones_relevantes: null,
    };
}

/**
 * Payload de create/update: notas canónicas y limpieza del campo legacy.
 */
export function applyTrainerNotesToClientPayload<T extends ClientFormData>(
    data: T,
): T & { lesiones_relevantes: null } {
    const normalized = normalizeClientFormTrainerNotes(data);
    return {
        ...data,
        notes_1: normalized.notes_1 ?? null,
        notes_2: normalized.notes_2 ?? null,
        notes_3: normalized.notes_3 ?? null,
        observaciones: normalized.observaciones ?? null,
        lesiones_relevantes: null,
    };
}

/** Lista ordenada para revisión onboarding. */
export function listTrainerNotesForReview(data: ClientFormData): string[] {
    const resolved = resolveTrainerNotesFromClient(data);
    return [resolved.note1, resolved.note2, resolved.note3, resolved.additional].filter(
        Boolean,
    );
}
