/**
 * catalogContractPresentation.test.ts — Avisos de calidad + contrato en el listado admin (H1).
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import { describe, expect, it } from "vitest";
import { catalogStatusBadges } from "../catalogContractPresentation";
import { retargetMuscleRow, type MuscleRowDraft } from "../adminCatalogFormTypes";

describe("catalogStatusBadges", () => {
    it("muestra OK solo si el contrato está completo", () => {
        expect(catalogStatusBadges(["OK"], [])).toEqual([{ key: "OK", label: "OK", tone: "ok" }]);
        const badges = catalogStatusBadges(["OK"], ["axial_load_pending_review"]);
        expect(badges.map((b) => b.key)).toEqual(["contract-axial_load_pending_review"]);
        expect(badges[0]?.label).toBe("Carga axial por revisar");
    });

    it("no duplica lo que ya dice un flag de calidad", () => {
        const badges = catalogStatusBadges(["NO_PM", "NO_EQUIPMENT"], ["prime_mover", "equipment", "nivel"]);
        expect(badges.map((b) => b.key)).toEqual(["NO_PM", "NO_EQUIPMENT", "contract-nivel"]);
    });

    it("muestra un código desconocido tal cual", () => {
        expect(catalogStatusBadges([], ["nuevo_codigo"])[0]?.label).toBe("nuevo_codigo");
    });
});

describe("retargetMuscleRow", () => {
    const row: MuscleRowDraft = {
        key: "m-1",
        muscle_id: 7,
        role: "synergist",
        evidence_level: "closed",
        is_coach_decision: true,
        evidence_note: "Decisión de Adrián",
    };

    it("conserva la trazabilidad si no cambia músculo ni rol", () => {
        expect(retargetMuscleRow(row, { role: "synergist" }).evidence_note).toBe("Decisión de Adrián");
    });

    it.each([
        [{ role: "prime_mover" as const }],
        [{ muscle_id: 9 }],
    ])("limpia la trazabilidad al cambiar %o", (patch) => {
        const next = retargetMuscleRow(row, patch);
        expect(next.evidence_level).toBeNull();
        expect(next.is_coach_decision).toBe(false);
        expect(next.evidence_note).toBeNull();
    });
});
