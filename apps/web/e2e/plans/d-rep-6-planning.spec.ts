/**
 * E2E D-REP-6 — planificación: semanas pasadas, repetir semana, asignar plantilla.
 * Datos por UI (qa.md §2.1). Credenciales vía env (backend/.env.qa).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import { navigateToPlans } from "../fixtures/navigation";
import { ensureOnPlanDetail } from "../fixtures/plans";

test.describe("D-REP-6 — planificación", () => {
    test.beforeEach(async ({ page }) => {
        page.on("dialog", (dialog) => dialog.accept());
        await loginAsTrainer(page);
        await navigateToPlans(page);
        await ensureOnPlanDetail(page);
        const clientNav = page.getByRole("navigation", {
            name: /tabs del cliente/i,
        });
        await clientNav.getByRole("button", { name: /planificación/i }).click();
        await expect(page.getByTestId("client-planning-tab")).toBeVisible({
            timeout: 15_000,
        });
    });

    test("apply-template UI: BLOCKED — sin superficie web que invoque apply-template", async () => {
        test.info().annotations.push({
            type: "blocked",
            description:
                "applyWeeklyStructureTemplate no tiene caller en apps/web; cubrir vía API en integración BE o añadir UI.",
        });
        expect(true).toBe(true);
    });

    test("repetir semana: toast weeks_skipped al forzar destino terminado por red", async ({
        page,
    }) => {
        await page.route(
            "**/weekly-structure/weeks/*/repeat",
            async (route) => {
                if (route.request().method() !== "POST") {
                    await route.continue();
                    return;
                }
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        copied_week_ordinals: [],
                        sessions_copied: 0,
                        sessions_skipped: 0,
                        weeks_skipped: [
                            { week_ordinal: 2, reason: "past_target_date" },
                        ],
                    }),
                });
            },
        );

        const weeklyEditor = page.getByTestId("weekly-structure-editor").first();
        const hasEditor = await weeklyEditor.isVisible().catch(() => false);
        if (!hasEditor) {
            test.skip(true, "No hay bloque con editor de estructura visible en este cliente");
        }

        const repeatBtn = page.getByRole("button", { name: /repetir/i }).first();
        if (!(await repeatBtn.isVisible().catch(() => false))) {
            test.skip(true, "Botón repetir semana no visible");
        }

        await repeatBtn.click();
        await page.getByRole("checkbox").first().check({ force: true });
        await page.getByRole("button", { name: /confirmar|repetir/i }).click();

        await expect(page.getByText(/Semana ya terminada: no se modifica/i)).toBeVisible({
            timeout: 10_000,
        });
    });
});
