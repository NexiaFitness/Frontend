/**
 * D2 — Resolución de tipo de sesión en create (query + default), sin inferencia exclusiva por fecha.
 */

export type SessionCreateKind = "program" | "standalone";

export function parseSessionCreateKindParam(
    raw: string | null | undefined,
): SessionCreateKind | null {
    if (raw === "program" || raw === "standalone") return raw;
    return null;
}

export function defaultSessionCreateKind(input: {
    planIdFromUrl: number | null;
    hasActivePlanForDate: boolean;
}): SessionCreateKind {
    if (input.planIdFromUrl) return "program";
    return input.hasActivePlanForDate ? "program" : "standalone";
}
