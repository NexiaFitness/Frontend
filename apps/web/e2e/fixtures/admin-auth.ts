/**
 * admin-auth.ts — Sesión admin para E2E (catálogo / import Excel).
 *
 * Credenciales: NEXIA_QA_ADMIN_EMAIL y NEXIA_QA_ADMIN_PASSWORD (p. ej. backend/.env.qa).
 */

import type { Page } from "@playwright/test";

const LOGIN_FORM_TIMEOUT = 15_000;

function requireAdminPassword(): string {
    const password = String(process.env.NEXIA_QA_ADMIN_PASSWORD ?? "").trim();
    if (!password) {
        throw new Error(
            "E2E admin: define NEXIA_QA_ADMIN_PASSWORD (ver backend/.env.qa DEMO_ADMIN_*)."
        );
    }
    return password;
}

export const qaAdminEmail =
    process.env.NEXIA_QA_ADMIN_EMAIL?.trim() || "admin@test.com";

export async function loginAsAdmin(page: Page): Promise<void> {
    await page.goto("/auth/login", { waitUntil: "load" });
    const emailInput = page.getByLabel(/correo electrónico/i);
    await emailInput.waitFor({ state: "visible", timeout: LOGIN_FORM_TIMEOUT });
    await emailInput.fill(qaAdminEmail);
    await page.getByRole("textbox", { name: /^Contraseña/i }).fill(requireAdminPassword());
    await page.getByRole("button", { name: /iniciar sesión/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
}
