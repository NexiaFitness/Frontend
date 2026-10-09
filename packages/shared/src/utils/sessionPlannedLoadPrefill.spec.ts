/**
 * sessionPlannedLoadPrefill.spec.ts — D-BLQ-3: relleno de sliders al cambiar la fecha.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import { describe, expect, it } from "vitest";

import { shouldReapplyPlannedLoadPrefill } from "./sessionPlannedLoadPrefill";

describe("shouldReapplyPlannedLoadPrefill", () => {
    it("misma fecha: conserva la foto fija", () => {
        expect(shouldReapplyPlannedLoadPrefill(false, "2026-03-09", "2026-03-09")).toBe(false);
    });

    it("fecha cambiada y sliders sin tocar: se rellenan de nuevo", () => {
        expect(shouldReapplyPlannedLoadPrefill(false, "2026-03-09", "2026-03-16")).toBe(true);
    });

    it("fecha cambiada pero el entrenador tocó los sliders: no se pisan", () => {
        expect(shouldReapplyPlannedLoadPrefill(true, "2026-03-09", "2026-03-16")).toBe(false);
    });

    it("sesión aún sin cargar (sin fecha original): no se rellena", () => {
        expect(shouldReapplyPlannedLoadPrefill(false, null, "2026-03-16")).toBe(false);
    });
});
