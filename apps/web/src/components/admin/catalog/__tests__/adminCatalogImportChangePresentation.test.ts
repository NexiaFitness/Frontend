/**
 * adminCatalogImportChangePresentation.test.ts — Frases de los cambios de relaciones del import.
 *
 * Contexto: QA_H8_P_2026-11-07. Cada elemento se lee en las palabras del Excel y la nota de
 * evidencia nunca se muestra, solo que cambió.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { describe, expect, it } from "vitest";
import { catalogImportItemLine } from "../adminCatalogImportChangePresentation";

describe("catalogImportItemLine", () => {
    it("cambio de prioridad y nota de un músculo objetivo", () => {
        expect(
            catalogImportItemLine({
                change: "changed",
                name: "Erectores espinales",
                role: "prime_mover",
                attributes: [
                    { attribute: "priority", before: "0", after: "2" },
                    { attribute: "evidence_note", before: null, after: null },
                ],
            })
        ).toBe("Erectores espinales · Objetivo: prioridad 0 → 2; nota de evidencia cambiada");
    });

    it("cambio de rol, evidencia y decisión con las palabras del Excel", () => {
        expect(
            catalogImportItemLine({
                change: "changed",
                name: "Glúteo mayor",
                role: "synergist",
                attributes: [
                    { attribute: "role", before: "prime_mover", after: "synergist" },
                    { attribute: "evidence_level", before: "closed", after: "extrapolation" },
                    { attribute: "is_coach_decision", before: "true", after: "false" },
                ],
            })
        ).toBe(
            "Glúteo mayor · Sinergista: rol Objetivo → Sinergista; evidencia Cerrado → " +
                "Extrapolación; decisión del entrenador Sí → No"
        );
    });

    it("añadido y quitado, con y sin rol", () => {
        expect(
            catalogImportItemLine({
                change: "added",
                name: "Bisagra de cadera",
                role: "secondary",
                attributes: [],
            })
        ).toBe("Añadido: Bisagra de cadera (Secundario)");
        expect(
            catalogImportItemLine({ change: "removed", name: "Esterilla", role: null, attributes: [] })
        ).toBe("Quitado: Esterilla");
    });

    it("un valor vacío se lee como guion", () => {
        expect(
            catalogImportItemLine({
                change: "changed",
                name: "Transverso del abdomen",
                role: "synergist",
                attributes: [{ attribute: "evidence_level", before: null, after: "limited" }],
            })
        ).toBe("Transverso del abdomen · Sinergista: evidencia — → Evidencia limitada");
    });
});
