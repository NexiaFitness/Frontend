/**
 * parseAdminUsersApiError.ts — Errores API usuarios admin (422/409).
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface AdminUsersFieldErrors {
    email?: string;
    password?: string;
    new_password?: string;
    reason?: string;
    form?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return isRecord(error) && "status" in error;
}

function messageFromValidationItem(item: unknown): string | null {
    if (!isRecord(item)) return null;
    const msg = item.msg;
    return typeof msg === "string" ? msg : null;
}

function locTail(loc: unknown): string | null {
    if (!Array.isArray(loc) || loc.length === 0) return null;
    const last = loc[loc.length - 1];
    return typeof last === "string" ? last : null;
}

export function parseAdminUsersApiError(error: unknown): AdminUsersFieldErrors {
    if (!isFetchBaseQueryError(error)) {
        return { form: "No se pudo completar la operación." };
    }

    const data = error.data;
    if (error.status === 409) {
        const detail =
            isRecord(data) && typeof data.detail === "string"
                ? data.detail
                : "Conflicto: la operación no está permitida.";
        const lower = detail.toLowerCase();
        if (lower.includes("email") || lower.includes("registered") || lower.includes("already")) {
            return { email: detail };
        }
        return { form: detail };
    }

    if (error.status === 422 && Array.isArray(data)) {
        const errors: AdminUsersFieldErrors = {};
        for (const item of data) {
            const field = locTail(isRecord(item) ? item.loc : null);
            const msg = messageFromValidationItem(item);
            if (!field || !msg) continue;
            if (field === "email" || field === "password" || field === "new_password" || field === "reason") {
                errors[field] = msg;
            } else {
                errors.form = msg;
            }
        }
        if (!errors.form && Object.keys(errors).length === 0) {
            errors.form = "Revisa los campos del formulario.";
        }
        return errors;
    }

    if (isRecord(data)) {
        const detail = data.detail;
        if (typeof detail === "string") {
            return { form: detail };
        }
        if (Array.isArray(detail)) {
            const joined = detail
                .map(messageFromValidationItem)
                .filter((m): m is string => Boolean(m))
                .join(" ");
            if (joined) return { form: joined };
        }
    }

    return { form: "Error del servidor. Intenta de nuevo." };
}
