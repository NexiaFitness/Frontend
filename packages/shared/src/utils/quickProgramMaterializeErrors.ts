/**
 * quickProgramMaterializeErrors.ts — Mensajes de usuario para errores O9 (Quick Program materialize).
 */

import { getMutationErrorMessage } from "./errorMessage";

/** Códigos estables devueltos por la API (detail.code). */
export const QP_MATERIALIZE_ERROR_CODE = {
    IDEMPOTENCY_PAYLOAD_MISMATCH: "QP_IDEMPOTENCY_PAYLOAD_MISMATCH",
} as const;

export type QuickProgramMaterializeErrorCode =
    (typeof QP_MATERIALIZE_ERROR_CODE)[keyof typeof QP_MATERIALIZE_ERROR_CODE];

const USER_MESSAGES_ES: Record<QuickProgramMaterializeErrorCode, string> = {
    [QP_MATERIALIZE_ERROR_CODE.IDEMPOTENCY_PAYLOAD_MISMATCH]:
        "El borrador cambió respecto a un intento anterior de crear la programación. " +
        "Pulsa «Crear programación» de nuevo. Si el aviso continúa, recarga la página y vuelve a entrar en programación rápida.",
};

function extractHttpDetail(error: unknown): unknown {
    if (error == null || typeof error !== "object" || !("data" in error)) {
        return null;
    }
    const data = (error as { data?: unknown }).data;
    if (data == null) return null;
    if (typeof data === "object" && "detail" in data) {
        return (data as { detail: unknown }).detail;
    }
    return data;
}

function readErrorCode(detail: unknown): string | null {
    if (detail == null || typeof detail !== "object" || !("code" in detail)) {
        return null;
    }
    const code = (detail as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
}

function isLegacyIdempotencyConflictDetail(detail: unknown): boolean {
    if (typeof detail !== "string") return false;
    const lower = detail.toLowerCase();
    return (
        lower.includes("different payload") ||
        lower.includes("client_request_id")
    );
}

/**
 * Mensaje en español para errores de materialize QP.
 * Usar en UI; el detail técnico del backend queda para logs.
 */
export function getQuickProgramMaterializeErrorMessage(error: unknown): string {
    const detail = extractHttpDetail(error);
    const code = readErrorCode(detail);

    if (code && code in USER_MESSAGES_ES) {
        return USER_MESSAGES_ES[code as QuickProgramMaterializeErrorCode];
    }

    if (isLegacyIdempotencyConflictDetail(detail)) {
        return USER_MESSAGES_ES[
            QP_MATERIALIZE_ERROR_CODE.IDEMPOTENCY_PAYLOAD_MISMATCH
        ];
    }

    if (
        error != null &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status?: unknown }).status === 409
    ) {
        return USER_MESSAGES_ES[
            QP_MATERIALIZE_ERROR_CODE.IDEMPOTENCY_PAYLOAD_MISMATCH
        ];
    }

    return getMutationErrorMessage(error);
}
