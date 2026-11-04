/**
 * catalogBulkReview.ts — Filtros y cuerpo de la revisión masiva (H5).
 *
 * La pantalla solo enseña lo que estas funciones devuelven: la consulta del
 * listado y el POST con los valores que se ven.
 */

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
    AdminCatalogListParams,
    CatalogBulkReviewIn,
    CatalogValueReviewFilter,
} from "../../types/adminCatalog";

export const CATALOG_BULK_REVIEW_MAX = 200;

export interface CatalogReviewListQuery {
    review: CatalogValueReviewFilter;
    search?: string;
    axialLoad?: string;
    nivel?: string;
    pattern?: string;
    skip: number;
    limit: number;
}

export function buildCatalogReviewListParams(
    query: CatalogReviewListQuery
): AdminCatalogListParams {
    const search = query.search?.trim();
    const pattern = query.pattern?.trim();
    return {
        skip: query.skip,
        limit: query.limit,
        review: query.review,
        search: search ? search : undefined,
        axial_load: query.axialLoad || undefined,
        nivel: query.nivel || undefined,
        pattern: pattern ? pattern : undefined,
    };
}

export interface CatalogReviewShownSource {
    axial_load?: string | null;
    nivel?: string | null;
}

export interface CatalogReviewEdit {
    axialLoad?: string;
    nivel?: string;
}

/** Valor del desplegable: el cambio local, o el que vino del listado. */
export function shownReviewValues(
    row: CatalogReviewShownSource,
    edit?: CatalogReviewEdit
): { axialLoad: string; nivel: string } {
    return {
        axialLoad: edit?.axialLoad ?? row.axial_load ?? "",
        nivel: edit?.nivel ?? row.nivel ?? "",
    };
}

export interface CatalogBulkReviewDraft {
    exercisePk: number;
    axialLoad: string;
    nivel: string;
    expectedUpdatedAt: string;
}

export function buildCatalogBulkReviewBody(
    drafts: CatalogBulkReviewDraft[]
): { ok: true; body: CatalogBulkReviewIn } | { ok: false; reason: "empty" | "too_many" } {
    if (drafts.length < 1) return { ok: false, reason: "empty" };
    if (drafts.length > CATALOG_BULK_REVIEW_MAX) return { ok: false, reason: "too_many" };
    return {
        ok: true,
        body: {
            items: drafts.map((draft) => ({
                exercise_pk: draft.exercisePk,
                axial_load: draft.axialLoad,
                nivel: draft.nivel,
                expected_updated_at: draft.expectedUpdatedAt,
            })),
        },
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return isRecord(error) && "status" in error;
}

/** Nombres del 409 de la revisión en bloque. Null si el error es otro. */
export function parseCatalogBulkReviewConflicts(error: unknown): string[] | null {
    if (!isFetchBaseQueryError(error) || error.status !== 409) return null;
    const data = error.data;
    if (!isRecord(data) || !isRecord(data.detail) || !Array.isArray(data.detail.conflicts)) {
        return null;
    }
    return data.detail.conflicts.flatMap((row) =>
        isRecord(row) && typeof row.nombre === "string" ? [row.nombre] : []
    );
}
