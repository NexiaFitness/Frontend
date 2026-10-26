/**
 * E2E Admin — Reutilizar código de ejercicio inactivo (F12).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { loginAsAdmin } from "../fixtures/admin-auth";
import {
    cleanupCatalogQaExercises,
    deactivateExerciseByPk,
    allocateFreeExerciseId,
    findExercisePkByCode,
    loginAdminApiToken,
} from "../fixtures/catalog-import-qa";
import {
    firstExerciseIdFromExport,
    nextFreeExerciseIdFromExport,
    patchExportExerciseNames,
    patchExportWithNewExercise,
} from "../fixtures/catalog-import-excel";

const API_BASE =
    process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nexia_token";

test.describe("Admin — Import código inactivo", () => {
    test.beforeEach(async ({ request }) => {
        if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim()) {
            test.skip(true, "Falta NEXIA_QA_ADMIN_PASSWORD");
        }
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

    test("validate muestra was_inactive, cambios y confirmar reactiva en listado", async ({
        page,
        request,
    }) => {
        test.setTimeout(300_000);
        const seedEn = `qa-inactive-reuse-seed-${Date.now()}`;
        const seedEs = `QA Inactivo seed ${Date.now()}`;
        const nombreEn = `qa-inactive-reuse-${Date.now()}`;
        const nombreEs = `QA Inactivo UI ${Date.now()}`;

        await loginAsAdmin(page);
        const token = await page.evaluate(
            (key) => localStorage.getItem(key),
            TOKEN_KEY
        );
        expect(token).toBeTruthy();
        process.env.NEXIA_QA_ADMIN_TOKEN = token!;

        const exportRes = await page.request.get(
            `${API_BASE}/admin/catalog/export?include_inactive=true`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        expect(exportRes.ok()).toBeTruthy();
        const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexia-inactive-e2e-"));
        const exportPath = path.join(workDir, "export.xlsx");
        const createPath = path.join(workDir, "create.xlsx");
        const patchedPath = path.join(workDir, "patched.xlsx");
        fs.writeFileSync(exportPath, await exportRes.body());

        const anchorId = firstExerciseIdFromExport(exportPath);
        const newId = await allocateFreeExerciseId(
            request,
            token!,
            exportPath,
            nextFreeExerciseIdFromExport
        );

        patchExportWithNewExercise(exportPath, createPath, {
            newExerciseId: newId,
            nombreEs: seedEs,
            nombreEn: seedEn,
            anchorId,
        });

        await page.goto("/dashboard/admin/catalog/import", { waitUntil: "load" });
        await page.locator("#admin-catalog-import-file").setInputFiles(createPath);
        await page.getByRole("button", { name: /validar archivo/i }).click();
        await expect(page.getByTestId("admin-catalog-import-summary")).toBeVisible({
            timeout: 60_000,
        });
        const confirmCreate = page.waitForResponse(
            (res) =>
                res.url().includes("/catalog/import/confirm") && res.status() === 200,
            { timeout: 60_000 }
        );
        await page
            .getByRole("button", { name: /aplicar cambios al catálogo/i })
            .click();
        await confirmCreate;
        await expect(page.getByText(/1 nuevo\(s\)/i)).toBeVisible({
            timeout: 30_000,
        });

        let seedPk: number | null = null;
        for (let attempt = 0; attempt < 20; attempt += 1) {
            seedPk = await findExercisePkByCode(request, token!, String(newId));
            if (seedPk != null) {
                break;
            }
            await page.waitForTimeout(500);
        }
        expect(seedPk).not.toBeNull();
        await deactivateExerciseByPk(request, token!, seedPk!);

        const export2 = await page.request.get(
            `${API_BASE}/admin/catalog/export?include_inactive=true`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        expect(export2.ok()).toBeTruthy();
        fs.writeFileSync(exportPath, await export2.body());

        patchExportExerciseNames(exportPath, patchedPath, newId, nombreEs, nombreEn);

        await page.locator("#admin-catalog-import-file").setInputFiles(patchedPath);
        await page.getByRole("button", { name: /validar archivo/i }).click();

        await expect(page.getByTestId("admin-catalog-import-summary")).toBeVisible({
            timeout: 60_000,
        });

        await expect(
            page.getByTestId("admin-catalog-import-inactive-id-warning")
        ).toBeVisible();

        await expect(
            page.getByTestId("admin-catalog-import-summary-updated-count")
        ).toContainText("1");

        const estadoChange = page
            .getByTestId("admin-catalog-import-field-change")
            .filter({ hasText: "Estado" });
        if (await estadoChange.count()) {
            await expect(estadoChange).toContainText("Inactivo");
            await expect(estadoChange).toContainText("Activo");
        }

        await page
            .getByRole("button", { name: /aplicar cambios al catálogo/i })
            .click();
        await expect(page.getByText(/1 actualizado/i)).toBeVisible({ timeout: 30_000 });

        await page
            .getByRole("button", { name: /ver pendientes de revisión/i })
            .click();
        await expect(page).toHaveURL(/pendientes=1/);

        const search = page.getByRole("searchbox", {
            name: /buscar por nombre o slug en/i,
        });
        await search.fill(nombreEn);
        await expect(
            page.getByRole("cell", { name: nombreEs, exact: true })
        ).toBeVisible({ timeout: 30_000 });
    });
});
