/**
 * E2E Admin — Import/export catálogo Excel v2 (F12).
 *
 * Requiere: backend :8000, frontend :5173, cuenta admin (NEXIA_QA_ADMIN_PASSWORD).
 * Flujo: export → subir mismo archivo → validar → confirmar (sin cambios).
 */

import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { loginAsAdmin } from "../fixtures/admin-auth";

const API_BASE =
    process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nexia_token";

test.describe("Admin — Catálogo import Excel v2", () => {
    test.beforeEach(() => {
        if (!process.env.NEXIA_QA_ADMIN_PASSWORD?.trim()) {
            test.skip(
                true,
                "Falta NEXIA_QA_ADMIN_PASSWORD (backend/.env.qa DEMO_ADMIN_PASSWORD)"
            );
        }
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
            page.getByRole("button", { name: /exportar excel v2/i })
        ).toBeVisible();
        await page.getByRole("button", { name: /exportar excel v2/i }).click();

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
            name: /confirmar import/i,
        });
        await expect(confirmButton).toBeEnabled();

        await confirmButton.click();

        await expect(
            page.getByText(/no hubo cambios que aplicar|sin cambios/i)
        ).toBeVisible({ timeout: 30_000 });
    });
});
