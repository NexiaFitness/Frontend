/**
 * parseAdminPhysicalTestsApiError.ts — Errores API tests físicos admin.
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface AdminPhysicalTestsFieldErrors {
    name?: string;
    category?: string;
    unit?: string;
    form?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return isRecord(error) && "status" in error;
}

function messageFromItem(item: unknown): string | null {
    if (!isRecord(item)) return null;
    const msg = item.msg;
    return typeof msg === "string" ? msg : null;
}

function fieldFromItem(item: unknown): string | null {
    if (!isRecord(item)) return null;
    if (typeof item.field === "string") return item.field;
    if (Array.isArray(item.loc) && item.loc.length > 0) {
        const last = item.loc[item.loc.length - 1];
        return typeof last === "string" ? last : null;
    }
    return null;
}

const FIELD_KEYS = new Set(["name", "category", "unit"]);

export function parseAdminPhysicalTestsApiError(error: unknown): AdminPhysicalTestsFieldErrors {
    if (!isFetchBaseQueryError(error)) {
        return { form: "No se pudo completar la operación." };
    }

    const data = error.data;

    if (error.status === 422) {
        const errors: AdminPhysicalTestsFieldErrors = {};
        const detail = isRecord(data) ? data.detail : data;

        const applyItem = (item: unknown) => {
            const field = fieldFromItem(item);
            const msg = messageFromItem(item) ?? (typeof item === "string" ? item : null);
            if (!msg) return;
            if (field && FIELD_KEYS.has(field)) {
                errors[field as keyof AdminPhysicalTestsFieldErrors] = msg;
            } else {
                errors.form = msg;
            }
        };

        if (Array.isArray(detail)) {
            detail.forEach(applyItem);
        } else if (isRecord(detail) && typeof detail.msg === "string") {
            applyItem(detail);
        } else if (typeof detail === "string") {
            errors.form = detail;
        }

        if (!errors.form && Object.keys(errors).length === 0) {
            errors.form = "Revisa los campos del formulario.";
        }
        return errors;
    }

    if (isRecord(data)) {
        const detail = data.detail;
        if (typeof detail === "string") return { form: detail };
    }

    return { form: "Error del servidor. Intenta de nuevo." };
}
