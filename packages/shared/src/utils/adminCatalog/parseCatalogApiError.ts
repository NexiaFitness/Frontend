/**
 * parseCatalogApiError.ts — Extrae 409 concurrency y 422 validation del cuerpo FastAPI.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
    CatalogConcurrencyErrorOut,
    CatalogValidationErrorBody,
} from "../../types/adminCatalog";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return isRecord(error) && "status" in error;
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
                ? (detail.server_updated_at as string | null)
                : undefined,
        expected_updated_at:
            typeof detail.expected_updated_at === "string" || detail.expected_updated_at === null
                ? (detail.expected_updated_at as string | null)
                : undefined,
        diff_summary: isRecord(detail.diff_summary)
            ? (detail.diff_summary as Record<string, unknown>)
            : {},
    };
}

export function parseCatalogValidationErrors(error: unknown): string[] {
    if (!isFetchBaseQueryError(error) || error.status !== 422) return [];
    const data = error.data;
    if (!isRecord(data)) return [];
    const detail = data.detail;
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

export function asCatalogValidationBody(error: unknown): CatalogValidationErrorBody | null {
    const errors = parseCatalogValidationErrors(error);
    if (errors.length === 0) return null;
    return { detail: "VALIDATION_FAILED", errors };
}
