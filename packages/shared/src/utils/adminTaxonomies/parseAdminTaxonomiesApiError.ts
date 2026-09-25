/**
 * parseAdminTaxonomiesApiError.ts — Errores API taxonomías admin (422/409).
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { TaxonomyDeactivateErrorDetail, TaxonomyUsageBreakdown } from "../../types/adminTaxonomies";

export interface AdminTaxonomiesFieldErrors {
    name_en?: string;
    name_es?: string;
    name?: string;
    ui_bucket?: string;
    parent_id?: string;
    level?: string;
    muscle_group_id?: string;
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

const FIELD_KEYS = new Set([
    "name_en",
    "name_es",
    "name",
    "ui_bucket",
    "parent_id",
    "level",
    "muscle_group_id",
]);

export function parseAdminTaxonomiesApiError(error: unknown): AdminTaxonomiesFieldErrors {
    if (!isFetchBaseQueryError(error)) {
        return { form: "No se pudo completar la operación." };
    }

    const data = error.data;

    if (error.status === 422) {
        const errors: AdminTaxonomiesFieldErrors = {};
        const detail = isRecord(data) ? data.detail : data;

        const applyItem = (item: unknown) => {
            const field = fieldFromItem(item);
            const msg = messageFromItem(item) ?? (typeof item === "string" ? item : null);
            if (!msg) return;
            if (field && FIELD_KEYS.has(field)) {
                errors[field as keyof AdminTaxonomiesFieldErrors] = msg;
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

export function parseTaxonomyDeactivateConflict(
    error: unknown
): TaxonomyDeactivateErrorDetail | null {
    if (!isFetchBaseQueryError(error) || error.status !== 409) return null;
    const data = error.data;
    if (!isRecord(data)) return null;
    const detail = data.detail;
    if (!isRecord(detail)) return null;
    if (detail.code !== "TAXONOMY_IN_USE") return null;
    const usage_count = typeof detail.usage_count === "number" ? detail.usage_count : 0;
    const rawBreakdown = detail.usage_breakdown;
    const usage_breakdown: TaxonomyUsageBreakdown = {};
    if (isRecord(rawBreakdown)) {
        for (const [key, value] of Object.entries(rawBreakdown)) {
            if (typeof value === "number") usage_breakdown[key] = value;
        }
    }
    return { code: "TAXONOMY_IN_USE", usage_count, usage_breakdown };
}
