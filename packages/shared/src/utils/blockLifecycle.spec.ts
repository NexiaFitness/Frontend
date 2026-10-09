/**
 * blockLifecycle.spec.ts — Variante de confirmación y etiqueta de fase archivada (D-BLQ-2).
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import { describe, expect, it } from "vitest";

import { formatPhaseNameWithStatus, resolveBlockRemovalVariant } from "./blockLifecycle";

describe("resolveBlockRemovalVariant", () => {
    it("sin sesiones → borrado simple", () => {
        expect(resolveBlockRemovalVariant({ action: "delete", planned_sessions: 0 })).toBe(
            "delete-empty",
        );
    });

    it("solo planificadas → borrado con recuento", () => {
        expect(resolveBlockRemovalVariant({ action: "delete", planned_sessions: 3 })).toBe(
            "delete-planned",
        );
    });

    it("con entrenadas → archivar", () => {
        expect(resolveBlockRemovalVariant({ action: "archive", planned_sessions: 3 })).toBe(
            "archive",
        );
    });
});

describe("formatPhaseNameWithStatus", () => {
    it("activa sin sufijo; archivada con sufijo", () => {
        expect(formatPhaseNameWithStatus("Fuerza base", true)).toBe("Fuerza base");
        expect(formatPhaseNameWithStatus("Fuerza base", false)).toBe("Fuerza base (archivada)");
    });
});
