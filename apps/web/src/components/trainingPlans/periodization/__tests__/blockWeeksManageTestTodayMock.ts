/**
 * Fija «hoy» dentro del bloque de prueba (2026-09-22 — 2026-09-28) para que las semanas
 * personalizadas no se reclasifiquen como pasada (D-REP-6) y el CTA «Restaurar semana tipo» siga visible.
 */
import { vi } from "vitest";

vi.mock("@nexia/shared", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@nexia/shared")>();
    return {
        ...actual,
        businessTodayYmd: () => "2026-09-24",
    };
});
