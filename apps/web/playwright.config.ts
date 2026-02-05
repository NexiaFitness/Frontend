/**
 * Playwright E2E config — Nexia Fitness (Fase 7.3)
 *
 * Requisitos:
 * - Frontend: servidor en baseURL (por defecto http://localhost:5173)
 * - Backend: API en VITE_API_BASE_URL (por defecto http://127.0.0.1:8000/api/v1)
 * - Cuenta de prueba: nexiafitness.demo@gmail.com / Nexia.1234 (ver frontend/.env.example)
 * - Opcional: al menos un plan de entrenamiento para el flujo de planificación
 *
 * @see frontend/README.md § E2E
 * @see FASE7_ROADMAP_IMPLEMENTACION.md Fase 7.3
 */
/// <reference types="node" />

import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm exec vite",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
});
