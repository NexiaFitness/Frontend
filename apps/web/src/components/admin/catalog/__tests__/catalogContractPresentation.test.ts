/**
 * catalogContractPresentation.test.ts — Avisos de calidad + contrato en el listado admin (H1).
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import { describe, expect, it } from "vitest";
import { catalogStatusBadges } from "../catalogContractPresentation";

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

    it("H10: NO_TECHNIQUE se lee «Sin técnica»", () => {
        expect(catalogStatusBadges(["NO_TECHNIQUE"], [])[0]?.label).toBe("Sin técnica");
    });

    it("muestra un código desconocido tal cual", () => {
        expect(catalogStatusBadges([], ["nuevo_codigo"])[0]?.label).toBe("nuevo_codigo");
    });
});
