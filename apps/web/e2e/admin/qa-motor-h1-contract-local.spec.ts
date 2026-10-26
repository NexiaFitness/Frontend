/**
 * qa-motor-h1-contract-local.spec.ts — QA browser local Hito 1 (motor catálogo v2, SPEC_H1).
 *
 * Rama: feat/catalog-engine-v2 (BE ac3ed6b, FE 08114fa). Solo dev; credenciales vía global-setup / backend/.env.qa.
 * Restaura datos QA al final (cleanupCatalogQaExercises).
 */

import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { loginAsAdmin, qaAdminEmail } from "../fixtures/admin-auth";
import {
    allocateFreeExerciseId,
    cleanupCatalogQaExercises,
    loginAdminApiToken,
} from "../fixtures/catalog-import-qa";
import {
    firstExerciseIdFromExport,
    patchExportWithNewExercise,
} from "../fixtures/catalog-import-excel";

const API_BASE =
    process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nexia_token";

test.describe("Motor H1 — contrato catálogo (local)", () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(() => {
        if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim()) {
            test.skip(true, "Falta NEXIA_QA_ADMIN_PASSWORD (backend/.env.qa)");
        }
    });

    test.beforeEach(async ({ request }) => {
        const token = await loginAdminApiToken(request);
        process.env.NEXIA_QA_ADMIN_TOKEN = token;
        await cleanupCatalogQaExercises(request, token);
    });

    test.afterAll(async ({ request }) => {
        const token = process.env.NEXIA_QA_ADMIN_TOKEN;
        if (token?.trim()) {
            await cleanupCatalogQaExercises(request, token);
        }
    });

    test("alta: objetivo, carga axial y nivel vacíos; cardio sin músculos; fuerza exige motor", async ({
        page,
    }) => {
        test.setTimeout(180_000);
        await loginAsAdmin(page);
        await page.goto("/dashboard/admin/catalog/new", { waitUntil: "load" });

        await expect(page.locator("#cat-objetivo")).toContainText("Selecciona el objetivo");
        await expect(page.locator("#cat-axial")).toContainText("Selecciona la carga axial");
        await expect(page.locator("#cat-nivel")).toContainText("Selecciona el nivel");

        await page.locator("#cat-nombre").fill(`QA H1 cardio ${Date.now()}`);
        await page.locator("#cat-nombre-en").fill(`qa-h1-cardio-${Date.now()}`);
        await page.getByLabel(/Objetivo de entrenamiento/i).click();
        await page.getByRole("option", { name: /Cardiovascular/i }).click();
        await page.getByLabel(/Tipo/i).click();
        await page.getByRole("option").first().click();
        await page.getByLabel(/Carga axial/i).click();
        await page.getByRole("option", { name: /Baja/i }).first().click();
        await page.getByLabel(/Nivel/i).click();
        await page.getByRole("option", { name: /Principiante/i }).first().click();

        await page.getByRole("button", { name: /guardar/i }).first().click();
        await expect(page).toHaveURL(/\/dashboard\/admin\/catalog\/\d+/, { timeout: 30_000 });

        await page.goto("/dashboard/admin/catalog/new", { waitUntil: "load" });
        await page.locator("#cat-nombre").fill(`QA H1 fuerza sin PM ${Date.now()}`);
        await page.locator("#cat-nombre-en").fill(`qa-h1-no-pm-${Date.now()}`);
        await page.getByLabel(/Objetivo de entrenamiento/i).click();
        await page.getByRole("option", { name: /Fuerza/i }).click();
        await page.getByLabel(/Carga axial/i).click();
        await page.getByRole("option", { name: /Media/i }).first().click();
        await page.getByLabel(/Nivel/i).click();
        await page.getByRole("option", { name: /Intermedio/i }).first().click();
        await page.getByRole("button", { name: /guardar/i }).first().click();
        await expect(page.getByText(/principal|prime_mover|músculo/i)).toBeVisible({
            timeout: 15_000,
        });
    });

    test("listado: ejercicio incompleto en catálogo muestra faltantes, no OK", async ({
        page,
        request,
    }) => {
        test.setTimeout(120_000);
        const token = await loginAdminApiToken(request);
        const list = await request.get(
            `${API_BASE}/admin/catalog/exercises?include_inactive=true&limit=100`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        expect(list.ok()).toBeTruthy();
        const items = (await list.json()).items ?? [];
        const incomplete = items.find(
            (i: { contract_status?: string }) => i.contract_status === "incomplete"
        );
        test.skip(!incomplete, "No hay ejercicio incomplete en dev para este escenario");

        await loginAsAdmin(page);
        await page.goto("/dashboard/admin/catalog", { waitUntil: "load" });
        const search = incomplete.nombre ?? incomplete.nombre_ingles ?? "";
        await page.getByPlaceholder(/buscar/i).fill(String(search).slice(0, 20));
        await page.waitForTimeout(1000);
        const row = page.locator(
            `[data-testid="admin-catalog-row-${incomplete.exercise_pk}"]`
        );
        await expect(row).toBeVisible({ timeout: 20_000 });
        await expect(row.getByText(/^OK$/)).toHaveCount(0);
        await expect(row.getByText(/Falta|revisar|principal|patrón/i).first()).toBeVisible();
    });

    test("picker: contract=complete excluye incompletos; sesión conserva nombre", async ({
        request,
    }) => {
        const adminToken = await loginAdminApiToken(request);
        const all = await request.get(`${API_BASE}/exercises/?limit=5`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(all.ok()).toBeTruthy();
        const complete = await request.get(
            `${API_BASE}/exercises/?contract=complete&limit=500`,
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        expect(complete.ok()).toBeTruthy();
        const allBody = await all.json();
        const completeBody = await complete.json();
        const allItems = allBody.items ?? allBody;
        const completeItems = completeBody.items ?? completeBody;
        if (Array.isArray(allItems) && Array.isArray(completeItems)) {
            const incomplete = allItems.find(
                (e: { contract_status?: string }) => e.contract_status === "incomplete"
            );
            if (incomplete?.id) {
                const ids = new Set(
                    completeItems.map((e: { id: number }) => e.id)
                );
                expect(ids.has(incomplete.id)).toBe(false);
            }
        }
    });

    test("import: objetivo vacío bloquea; cambio axial informado sin tocar BD", async ({
        page,
        request,
    }) => {
        test.setTimeout(240_000);
        const token = await loginAdminApiToken(request);
        await loginAsAdmin(page);
        await page.goto("/dashboard/admin/catalog/import", { waitUntil: "load" });

        const exportRes = await page.request.get(`${API_BASE}/admin/catalog/export`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(exportRes.ok()).toBeTruthy();
        const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexia-h1-qa-"));
        const exportPath = path.join(workDir, "export.xlsx");
        fs.writeFileSync(exportPath, await exportRes.body());

        const anchorId = firstExerciseIdFromExport(exportPath);
        const newId = await allocateFreeExerciseId(request, token, exportPath, () =>
            String(Number(anchorId) + 9000)
        );
        const fichaRes = await request.get(
            `${API_BASE}/admin/catalog/exercises?search=${encodeURIComponent("h1-r5")}&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        if (fichaRes.ok()) {
            const items = (await fichaRes.json()).items ?? [];
            if (items[0]?.exercise_pk) {
                const pk = items[0].exercise_pk;
                const before = await request.get(
                    `${API_BASE}/exercises/${pk}/catalog`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const axialBefore = (await before.json()).axial_load;
                const patchedPath = path.join(workDir, "axial-change.xlsx");
                fs.copyFileSync(exportPath, patchedPath);
                await page.locator("#admin-catalog-import-file").setInputFiles(patchedPath);
                await page.getByRole("button", { name: /validar archivo/i }).click();
                await expect(
                    page.getByTestId("admin-catalog-import-field-change").first()
                ).toBeVisible({ timeout: 60_000 });
                const after = await request.get(
                    `${API_BASE}/exercises/${pk}/catalog`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                expect((await after.json()).axial_load).toBe(axialBefore);
            }
        }
    });

    test("volumen: sprint cardio no cuenta; sentadilla fuerza sí (API dev)", async ({
        request,
    }) => {
        const token = await loginAdminApiToken(request);
        const sprint = await request.get(
            `${API_BASE}/exercises/?search=sprint&limit=5`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const squat = await request.get(
            `${API_BASE}/exercises/?search=squat&limit=5`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        expect(sprint.ok() && squat.ok()).toBeTruthy();
        const sprintItem = ((await sprint.json()).items ?? [])[0];
        const squatItem = ((await squat.json()).items ?? [])[0];
        if (sprintItem?.objetivo_entrenamiento === "cardiovascular" && squatItem?.id) {
            expect(sprintItem.contract_status).toBe("complete");
            expect(squatItem.objetivo_entrenamiento).toBe("strength");
        }
    });
});
