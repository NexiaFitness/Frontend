/**
 * catalog-import-qa.ts — Limpieza y utilidades API para E2E import catálogo (F12).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import type { APIRequestContext } from "@playwright/test";

const API_BASE =
    process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export async function loginAdminApiToken(
    request: APIRequestContext
): Promise<string> {
    const email =
        process.env.NEXIA_QA_ADMIN_EMAIL?.trim() ||
        process.env.DEMO_ADMIN_EMAIL?.trim() ||
        "admin@test.com";
    const password = String(
        process.env.NEXIA_QA_ADMIN_PASSWORD ?? process.env.DEMO_ADMIN_PASSWORD ?? ""
    ).trim();
    if (!password) {
        throw new Error("Falta NEXIA_QA_ADMIN_PASSWORD para login API E2E");
    }
    const res = await request.post(`${API_BASE}/auth/login`, {
        form: { username: email, password },
    });
    if (!res.ok()) {
        throw new Error(`Login admin E2E falló: ${res.status()} ${await res.text()}`);
    }
    const body = (await res.json()) as { access_token: string };
    return body.access_token;
}

const QA_NAME_PATTERNS = [
    /^qa-inactive-reuse-/i,
    /^e2e-excel-new/i,
    /^excel-import-new-exercise/i,
    /^qa-browser-catalog-/i,
];

async function maxNumericExerciseCode(
    request: APIRequestContext,
    token: string
): Promise<number> {
    let skip = 0;
    const limit = 200;
    let max = 0;
    let total = Number.POSITIVE_INFINITY;
    while (skip < total) {
        const res = await request.get(
            `${API_BASE}/admin/catalog/exercises?include_inactive=true&skip=${skip}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok()) {
            break;
        }
        const body = await res.json();
        total = typeof body.total === "number" ? body.total : 0;
        const items = (body.items ?? []) as { exercise_code: string }[];
        for (const item of items) {
            const n = Number.parseInt(item.exercise_code, 10);
            if (!Number.isNaN(n)) {
                max = Math.max(max, n);
            }
        }
        if (items.length === 0) {
            break;
        }
        skip += limit;
    }
    return max;
}

/** Siguiente código libre: máximo entre Excel exportado y catálogo API (incl. inactivos). */
export async function allocateFreeExerciseId(
    request: APIRequestContext,
    token: string,
    exportXlsxPath: string,
    fromExport: (path: string) => number
): Promise<number> {
    const fromFile = fromExport(exportXlsxPath);
    const fromApi = (await maxNumericExerciseCode(request, token)) + 1;
    return Math.max(fromFile, fromApi);
}

export async function deactivateExerciseByPk(
    request: APIRequestContext,
    token: string,
    exercisePk: number
): Promise<void> {
    const res = await request.delete(`${API_BASE}/exercises/${exercisePk}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok() && res.status() !== 404) {
        throw new Error(`No se pudo desactivar ejercicio ${exercisePk}: ${res.status()}`);
    }
}

export async function findExercisePkByCode(
    request: APIRequestContext,
    token: string,
    exerciseCode: string
): Promise<number | null> {
    const code = String(exerciseCode).trim();
    let skip = 0;
    const limit = 200;
    let total = Number.POSITIVE_INFINITY;
    while (skip < total) {
        const res = await request.get(
            `${API_BASE}/admin/catalog/exercises?include_inactive=true&skip=${skip}&limit=${limit}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok()) {
            return null;
        }
        const body = await res.json();
        total = typeof body.total === "number" ? body.total : 0;
        const items = (body.items ?? []) as {
            exercise_pk: number;
            exercise_code: string;
        }[];
        const exact = items.find((item) => item.exercise_code === code);
        if (exact) {
            return exact.exercise_pk;
        }
        if (items.length === 0) {
            break;
        }
        skip += limit;
    }
    return null;
}

export async function findExercisePkByEnglishName(
    request: APIRequestContext,
    token: string,
    nombreEn: string
): Promise<number | null> {
    const res = await request.get(
        `${API_BASE}/admin/catalog/exercises?search=${encodeURIComponent(nombreEn)}&include_inactive=true&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok()) {
        return null;
    }
    const body = await res.json();
    const items = (body.items ?? []) as {
        exercise_pk: number;
        nombre_ingles?: string | null;
    }[];
    const match = items.find(
        (item) => (item.nombre_ingles ?? "").toLowerCase() === nombreEn.toLowerCase()
    );
    return match?.exercise_pk ?? null;
}

/** Desactiva ejercicios de prueba creados por specs F12 (no falla si ya no existen). */
export async function cleanupCatalogQaExercises(
    request: APIRequestContext,
    token: string
): Promise<void> {
    const res = await request.get(
        `${API_BASE}/admin/catalog/exercises?include_inactive=true&limit=500`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok()) {
        return;
    }
    const body = await res.json();
    const items = (body.items ?? []) as {
        exercise_pk: number;
        nombre_ingles?: string | null;
        nombre: string;
    }[];
    for (const item of items) {
        const en = item.nombre_ingles ?? "";
        const es = item.nombre ?? "";
        const isQa = QA_NAME_PATTERNS.some(
            (re) => re.test(en) || re.test(es)
        );
        if (!isQa) {
            continue;
        }
        await deactivateExerciseByPk(request, token, item.exercise_pk);
    }
}
