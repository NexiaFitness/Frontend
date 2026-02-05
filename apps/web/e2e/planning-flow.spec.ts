/**
 * E2E: Flujo period-based — Login → Planes → Planificación (Fase 7.3)
 *
 * Requisitos:
 * - Backend corriendo en http://127.0.0.1:8000 (o VITE_API_BASE_URL)
 * - Frontend en baseURL (por defecto http://localhost:5173)
 * - Cuenta de prueba (ver .env.example): nexiafitness.demo@gmail.com / Nexia.1234
 * - Opcional: al menos un plan de entrenamiento para abrir el tab Planificación
 *
 * El test falla de forma clara si: login falla, la pantalla no existe,
 * el endpoint cambió o el flujo de datos se rompe.
 */

import { test, expect } from "@playwright/test";

const demoUser = "nexiafitness.demo@gmail.com";
const demoPassword = "Nexia.1234";

test.describe("Planning flow (period-based)", () => {
  test("login → training plans → plan detail → Planificación tab shows baseline/calendar UI", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => {});

    const url = page.url();
    const isDashboard = url.includes("/dashboard");
    const isLogin = url.includes("/auth/login");

    if (!isDashboard) {
      if (!isLogin) await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
      await page.getByRole("textbox", { name: /email|correo/i }).fill(demoUser);
      await page.getByRole("textbox", { name: /contraseña|password/i }).fill(demoPassword);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      await page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => {
        if (page.url().includes("/auth/login"))
          throw new Error(
            "E2E login failed: la cuenta demo debe tener email verificado y perfil trainer completo. Ejecuta una vez: cd backend && python scripts/seed_demo_user.py"
          );
        throw new Error("E2E login failed: no se redirigió al dashboard.");
      });
    }

    // Clickear en el sidebar desktop (role="complementary"), no en el drawer móvil.
    // En desktop: sidebar visible (complementary) + drawer cerrado (list); ambos tienen links con el mismo texto → acotamos al sidebar para evitar strict mode violation (ver DIAGNOSTICO_E2E.md §2.9).
    await page
      .getByRole("complementary")
      .getByRole("link", { name: /planes de entrenamiento/i })
      .click();
    await expect(page).toHaveURL(/\/dashboard\/training-plans/, { timeout: 10_000 });

    await expect(
      page.getByRole("heading", { name: /planificación de entrenamiento/i })
    ).toBeVisible({ timeout: 10_000 });

    // Si hay al menos un plan, abrir el primero y comprobar tab Planificación
    const verDetalles = page.getByRole("button", { name: /ver detalles/i }).first();
    const hasPlan = await verDetalles.isVisible().catch(() => false);

    if (hasPlan) {
      await verDetalles.click();
      await expect(page).toHaveURL(/\/dashboard\/training-plans\/\d+/);

      await page.getByRole("tab", { name: /planificación/i }).click();

      await expect(
        page
          .getByText(/nuevo baseline mensual|calendario de planificación|baselines mensuales/i)
          .first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      // Sin planes: al menos comprobar que la página de listado es correcta
      await expect(
        page.getByText(/programas activos|biblioteca de templates|crear|crea y gestiona/i).first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
