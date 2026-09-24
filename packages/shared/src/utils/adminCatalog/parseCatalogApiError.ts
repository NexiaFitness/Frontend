/**
 * parseCatalogApiError.ts — Extrae 409 concurrency y 413/415/422 del cuerpo FastAPI.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
    CatalogConcurrencyErrorOut,
    CatalogValidationErrorBody,
} from "../../types/adminCatalog";

/** Códigos HTTP de rechazo de subida/import (catalog_import_upload + validación). */
const CATALOG_IMPORT_UPLOAD_STATUSES = new Set([413, 415, 422]);

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return isRecord(error) && "status" in error;
}

function parseDetailErrorsArray(detail: unknown): string[] {
    if (isRecord(detail) && Array.isArray(detail.errors)) {
        return detail.errors.filter((e): e is string => typeof e === "string");
    }
    if (typeof detail === "string") return [detail];
    if (Array.isArray(detail)) {
        return detail.map((item) => {
            if (typeof item === "string") return item;
            if (isRecord(item) && typeof item.msg === "string") return item.msg;
            return "Error de validación";
        });
    }
    return [];
}

export function parseCatalogConcurrencyError(
    error: unknown
): CatalogConcurrencyErrorOut | null {
    if (!isFetchBaseQueryError(error) || error.status !== 409) return null;
    const data = error.data;
    if (!isRecord(data)) return null;
    const detail = data.detail;
    if (!isRecord(detail)) return null;
    if (typeof detail.detail !== "string") return null;
    return {
        detail: detail.detail,
        server_updated_at:
            typeof detail.server_updated_at === "string" || detail.server_updated_at === null
                ? detail.server_updated_at
                : undefined,
        expected_updated_at:
            typeof detail.expected_updated_at === "string" ||
            detail.expected_updated_at === null
                ? detail.expected_updated_at
                : undefined,
        diff_summary: isRecord(detail.diff_summary) ? detail.diff_summary : {},
    };
}

export function parseCatalogValidationErrors(error: unknown): string[] {
    if (!isFetchBaseQueryError(error) || error.status !== 422) return [];
    const data = error.data;
    if (!isRecord(data)) return [];
    return parseDetailErrorsArray(data.detail);
}

/** Mensaje cuando el proxy (p. ej. nginx) responde 413 sin JSON del backend. */
export const CATALOG_IMPORT_FILE_TOO_LARGE_MESSAGE =
    "El fichero supera el tamaño máximo permitido";

/**
 * Mensajes de rechazo de import/upload: `detail: { detail: CODE, errors: [msg] }`
 * en 413 (tamaño), 415 (tipo) y 422 (workbook/validación).
 */
export function parseCatalogImportUploadErrors(error: unknown): string[] {
    if (!isFetchBaseQueryError(error)) return [];
    if (
        typeof error.status !== "number" ||
        !CATALOG_IMPORT_UPLOAD_STATUSES.has(error.status)
    ) {
        return [];
    }
    const data = error.data;
    if (!isRecord(data)) return [];
    return parseDetailErrorsArray(data.detail);
}

/**
 * Primer mensaje de `detail.errors`, o fallback.
 * Un 413 sin cuerpo JSON (HTML de nginx / límite del proxy) usa
 * {@link CATALOG_IMPORT_FILE_TOO_LARGE_MESSAGE}.
 */
export function catalogImportUploadErrorMessage(
    error: unknown,
    fallback: string
): string {
    if (isFetchBaseQueryError(error) && error.status === 413) {
        const fromBody = parseCatalogImportUploadErrors(error)[0];
        return fromBody ?? CATALOG_IMPORT_FILE_TOO_LARGE_MESSAGE;
    }
    const errors = parseCatalogImportUploadErrors(error);
    return errors[0] ?? fallback;
}

export function asCatalogValidationBody(error: unknown): CatalogValidationErrorBody | null {
    const errors = parseCatalogValidationErrors(error);
    if (errors.length === 0) return null;
    return { detail: "VALIDATION_FAILED", errors };
}
