/**
 * D-REG-CLOSED-01 — QA M1–M8 (sesiones 4445 cerrada, 4462 editable).
 *
 * @spec docs/atleta/session-registration-closed-2026-10/03_SPEC_REGLAS_Y_CASOS_LIMITE.md
 */

import { test, expect } from "@playwright/test";
import { loginAsAthlete } from "../fixtures/athlete-auth";

const CLOSED_SESSION = 4445;
const OPEN_SESSION = 4462;

test.describe("Registro cerrado M1–M8", () => {
    test("QA-REG-M1 mode=log 4445: aviso, sin carga infinita, sin mode en URL", async ({
        page,
    }) => {
        test.setTimeout(90_000);
        const consoleErrors: string[] = [];
        page.on("console", (m) => {
            if (m.type() === "error") consoleErrors.push(m.text());
        });
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${CLOSED_SESSION}?mode=log`);
        await expect(page.getByText("Registro cerrado")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByText("Esta sesión ya no admite cambios.")).toBeVisible();
        expect(page.url()).not.toContain("mode=log");
        await expect(page.getByText("Cargando bloque…")).toHaveCount(0);
        expect(consoleErrors.some((e) => e.includes("403"))).toBe(false);
    });

    test("QA-REG-M2 4445 sin parámetro: aviso, sin POST escritura", async ({ page }) => {
        test.setTimeout(60_000);
        const posts: string[] = [];
        page.on("request", (r) => {
            if (r.method() === "POST") posts.push(r.url());
        });
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${CLOSED_SESSION}`);
        await expect(page.getByText("Registro cerrado")).toBeVisible({ timeout: 45_000 });
        expect(posts.filter((u) => u.includes("executions"))).toHaveLength(0);
    });

    test("QA-REG-M3 4462 mode=log editable", async ({ page }) => {
        test.setTimeout(90_000);
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${OPEN_SESSION}?mode=log`);
        await expect(page.getByText("Registro cerrado")).toHaveCount(0);
        await expect(page.getByRole("button", { name: /Registrado/i }).first()).toBeVisible({
            timeout: 45_000,
        });
        expect(page.url()).toContain("mode=log");
    });

    test("QA-REG-M5 sin GET training-plans 403 en cabecera", async ({ page }) => {
        test.setTimeout(60_000);
        const plan403: string[] = [];
        page.on("response", (r) => {
            if (r.url().includes("/training-plans/") && r.status() === 403) {
                plan403.push(r.url());
            }
        });
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${CLOSED_SESSION}`);
        await page.waitForTimeout(3000);
        await page.goto(`/dashboard/sessions/${OPEN_SESSION}`);
        await page.waitForTimeout(3000);
        expect(plan403).toHaveLength(0);
    });

    test("QA-REG-M4 fallo progress: mensaje y reintentar", async ({ browser }) => {
        test.setTimeout(90_000);
        const context = await browser.newContext();
        let progressFail = true;
        const progressApi =
            "**/api/v1/athlete/run-context/sessions/*/progress";
        await context.route(progressApi, async (route) => {
            if (!progressFail) {
                await route.continue();
                return;
            }
            await route.fulfill({
                status: 500,
                contentType: "application/json",
                body: JSON.stringify({ detail: "QA simulated failure" }),
            });
        });
        const page = await context.newPage();
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${OPEN_SESSION}`, { waitUntil: "networkidle" });
        await expect(
            page.getByRole("paragraph").filter({ hasText: "No pudimos cargar tu registro" })
        ).toBeVisible({ timeout: 45_000 });
        progressFail = false;
        await page.getByRole("button", { name: "Reintentar" }).click();
        await expect(
            page.getByRole("paragraph").filter({ hasText: "No pudimos cargar tu registro" })
        ).toHaveCount(0, { timeout: 45_000 });
        await context.close();
    });

    test("QA-REG-M7 cambio sesión resetea hoja", async ({ page }) => {
        test.setTimeout(90_000);
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${CLOSED_SESSION}?mode=log`);
        await expect(page.getByText("Registro cerrado")).toBeVisible({ timeout: 45_000 });
        await page.goto(`/dashboard/sessions/${OPEN_SESSION}?mode=log`);
        await expect(page.getByText("Registro cerrado")).toHaveCount(0);
        await expect(page.getByRole("button", { name: /Registrado/i }).first()).toBeVisible({
            timeout: 45_000,
        });
        expect(page.url()).toContain("mode=log");
    });

    test("QA-REG-M6 4445 bloques registrados sin Toca para registrar", async ({ page }) => {
        test.setTimeout(60_000);
        await loginAsAthlete(page);
        await page.goto(`/dashboard/sessions/${CLOSED_SESSION}`);
        await expect(page.getByText("Registro cerrado")).toBeVisible({ timeout: 45_000 });
        await expect(page.getByText("Toca para registrar")).toHaveCount(0);
    });
});
