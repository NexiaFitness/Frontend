/**
 * parseTimedBlockResultPayload.ts — Lectura segura de payload_json (timed_block_results).
 * Contexto: nota EMOM del atleta (D6); sin acoplar UI entrenador a forma interna del JSON.
 * @author Frontend Team
 * @since v8.3.0
 */

export interface ParsedEmomTimedPayload {
    asPlanned?: boolean;
    athleteNote?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Extrae campos EMOM conocidos; devuelve null si el JSON no es parseable. */
export function parseEmomTimedPayloadJson(
    payloadJson: string | null | undefined
): ParsedEmomTimedPayload | null {
    if (payloadJson == null || payloadJson.trim() === "") {
        return null;
    }
    try {
        const raw: unknown = JSON.parse(payloadJson);
        if (!isRecord(raw)) {
            return null;
        }
        const out: ParsedEmomTimedPayload = {};
        if (typeof raw.as_planned === "boolean") {
            out.asPlanned = raw.as_planned;
        }
        if (typeof raw.athlete_note === "string") {
            const trimmed = raw.athlete_note.trim();
            if (trimmed.length > 0) {
                out.athleteNote = trimmed;
            }
        }
        return out;
    } catch {
        return null;
    }
}

/** Nota libre del atleta en EMOM «No completado»; null si no hay texto usable. */
export function parseEmomAthleteNoteFromPayloadJson(
    payloadJson: string | null | undefined
): string | null {
    return parseEmomTimedPayloadJson(payloadJson)?.athleteNote ?? null;
}
