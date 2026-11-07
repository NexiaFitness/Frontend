/**
 * Handlers MSW — listado del catálogo admin (GET /admin/catalog/exercises).
 *
 * Contexto: extraído de `index.ts` cuando pasó de 400 líneas (agent.md §7.1, revisión de
 * Kimi de H8-P). `index.ts` los reexporta y mete el de por defecto en `adminCatalogHandlers`.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { http, HttpResponse } from "msw";

const now = "2026-09-24T12:00:00.000Z";

export const mockAdminCatalogListItems = [
    {
        exercise_pk: 11,
        exercise_code: "squat_back",
        nombre: "Sentadilla trasera",
        nombre_ingles: "Back squat",
        is_active: true,
        review_status: "reviewed",
        catalog_reviewed_at: now,
        quality_flags: ["OK"],
    },
    {
        exercise_pk: 97,
        exercise_code: "hip_thrust",
        nombre: "Empuje de cadera",
        nombre_ingles: "Hip thrust",
        is_active: false,
        review_status: "pending",
        catalog_reviewed_at: null,
        quality_flags: ["NO_PM", "PM_PRIORITY"],
    },
];

export const listAdminCatalogHandler = http.get(
    "*/admin/catalog/exercises",
    async ({ request }) => {
        const url = new URL(request.url);
        const includeInactive = url.searchParams.get("include_inactive") === "true";
        const reviewStatus = url.searchParams.get("review_status");
        const search = (url.searchParams.get("search") ?? "").toLowerCase();

        const items = mockAdminCatalogListItems.filter((item) => {
            if (!includeInactive && !item.is_active) return false;
            if (reviewStatus && item.review_status !== reviewStatus) return false;
            if (search && !item.nombre.toLowerCase().includes(search)) return false;
            return true;
        });

        return HttpResponse.json(
            {
                items,
                total: items.length,
                skip: Number(url.searchParams.get("skip") ?? 0),
                limit: Number(url.searchParams.get("limit") ?? 50),
                review_progress: { reviewed_count: 34, active_count: 107, queue_count: 12 },
            },
            { status: 200 }
        );
    }
);

export const listAdminCatalogEmptyHandler = http.get(
    "*/admin/catalog/exercises",
    async () =>
        HttpResponse.json(
            {
                items: [],
                total: 0,
                skip: 0,
                limit: 50,
                review_progress: { reviewed_count: 0, active_count: 0 },
            },
            { status: 200 }
        )
);

export const listAdminCatalogErrorHandler = http.get(
    "*/admin/catalog/exercises",
    async () => HttpResponse.json({ detail: "boom" }, { status: 500 })
);
