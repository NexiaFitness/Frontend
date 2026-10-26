/**
 * E2E Admin — Import/export catálogo Excel v2 (F12).
 *
 * Contexto: round-trip sin cambios; credenciales vía global-setup + backend/.env.qa.
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
    loginAdminApiToken,
} from "../fixtures/catalog-import-qa";

const API_BASE =
    process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nexia_token";

test.describe("Admin — Catálogo import Excel v2", () => {
    test.beforeEach(async ({ request }) => {
        if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim()) {
            test.skip(
                true,
                "Falta NEXIA_QA_ADMIN_PASSWORD (backend/.env.qa DEMO_ADMIN_PASSWORD)"
            );
        }
        const token = await loginAdminApiToken(request);
        process.env.NEXIA_QA_ADMIN_TOKEN = token;
        await cleanupCatalogQaExercises(request, token);
    });

    test("export, upload, validate y confirm round-trip sin cambios", async ({
        page,
    }) => {
        test.setTimeout(120_000);
        await loginAsAdmin(page);
        await page.goto("/dashboard/admin/catalog/import", { waitUntil: "load" });

        await expect(
            page.getByRole("heading", { name: /importar y exportar catálogo/i })
        ).toBeVisible();

        await expect(
            page.getByTestId("admin-catalog-export-catalog")
        ).toBeVisible();
        await page.getByTestId("admin-catalog-export-catalog").click();

        const downloadDir = fs.mkdtempSync(path.join(os.tmpdir(), "nexia-catalog-e2e-"));
        const downloadPath = path.join(downloadDir, "nexia_catalog_export.xlsx");

        const token = await page.evaluate(
            (key) => localStorage.getItem(key),
            TOKEN_KEY
        );
        expect(token).toBeTruthy();
        const exportRes = await page.request.get(`${API_BASE}/admin/catalog/export`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(exportRes.ok()).toBeTruthy();
        fs.writeFileSync(downloadPath, await exportRes.body());

        const fileInput = page.locator("#admin-catalog-import-file");
        await fileInput.setInputFiles(downloadPath);

        await page.getByRole("button", { name: /validar archivo/i }).click();

        await expect(page.getByTestId("admin-catalog-import-summary")).toBeVisible({
            timeout: 60_000,
        });

        const confirmButton = page.getByRole("button", {
            name: /aplicar cambios al catálogo/i,
        });
        await expect(confirmButton).toBeEnabled();

        await confirmButton.click();

        await expect(
            page.getByText(/no hubo cambios que aplicar|sin cambios/i)
        ).toBeVisible({ timeout: 30_000 });
    });
});
