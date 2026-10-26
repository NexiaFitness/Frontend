/**
 * E2E Admin — Alta real de ejercicio vía import Excel v2 (F12).
 *
 * Contexto: export API → parche Python → validar/confirmar → listado.
 * Credenciales: global-setup carga backend/.env.qa (qa.md §8).
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
    firstExerciseIdFromExport,
    nextFreeExerciseIdFromExport,
    patchExportWithNewExercise,
} from "../fixtures/catalog-import-excel";
import {
    allocateFreeExerciseId,
    cleanupCatalogQaExercises,
    loginAdminApiToken,
} from "../fixtures/catalog-import-qa";

const API_BASE =
    process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nexia_token";

test.describe("Admin — Catálogo import Excel v2 (alta)", () => {
    test.beforeEach(() => {
        if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim()) {
            test.skip(
                true,
                "Falta NEXIA_QA_ADMIN_PASSWORD (backend/.env.qa DEMO_ADMIN_PASSWORD)"
            );
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

    test("export, nueva fila en Excel, validar Nuevos=1, confirmar y listado", async ({
        page,
        request,
    }) => {
        test.setTimeout(180_000);
        const nombreEn = `e2e-excel-new-${Date.now()}`;
        const nombreEs = `E2E Excel Alta ${Date.now()}`;

        await loginAsAdmin(page);
        await page.goto("/dashboard/admin/catalog/import", { waitUntil: "load" });

        const token = await page.evaluate(
            (key) => localStorage.getItem(key),
            TOKEN_KEY
        );
        expect(token).toBeTruthy();
        process.env.NEXIA_QA_ADMIN_TOKEN = token!;

        const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexia-catalog-add-e2e-"));
        const exportPath = path.join(workDir, "export.xlsx");
        const patchedPath = path.join(workDir, "patched.xlsx");

        const exportRes = await page.request.get(`${API_BASE}/admin/catalog/export`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(exportRes.ok()).toBeTruthy();
        fs.writeFileSync(exportPath, await exportRes.body());

        const anchorId = firstExerciseIdFromExport(exportPath);
        const newId = await allocateFreeExerciseId(
            request,
            token!,
            exportPath,
            nextFreeExerciseIdFromExport
        );
        patchExportWithNewExercise(exportPath, patchedPath, {
            newExerciseId: newId,
            nombreEs,
            nombreEn,
            anchorId,
        });

        const fileInput = page.locator("#admin-catalog-import-file");
        await fileInput.setInputFiles(patchedPath);

        await page.getByRole("button", { name: /validar archivo/i }).click();

        const summary = page.getByTestId("admin-catalog-import-summary");
        await expect(summary).toBeVisible({ timeout: 60_000 });

        await expect(
            page.getByTestId("admin-catalog-import-summary-new-count")
        ).toContainText("1", { timeout: 60_000 });

        const confirmButton = page.getByRole("button", {
            name: /aplicar cambios al catálogo/i,
        });
        await expect(confirmButton).toBeEnabled();
        await confirmButton.click();

        await expect(page.getByText(/1 nuevo/i)).toBeVisible({ timeout: 30_000 });

        await page.getByRole("button", { name: /ir al listado/i }).click();
        await expect(page.getByTestId("admin-catalog-list")).toBeVisible({
            timeout: 30_000,
        });

        const search = page.getByRole("searchbox", {
            name: /buscar por nombre o slug en/i,
        });
        await search.fill(nombreEn);
        await expect(
            page.getByRole("cell", { name: nombreEs, exact: true })
        ).toBeVisible({ timeout: 30_000 });
    });
});
