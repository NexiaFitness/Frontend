/**
 * blockAuthoringFocusContext — meta compacta sin placeholders vacíos.
 */

import { buildClientAuthoringMetaItems } from "../blockAuthoringFocusContext";
import type { Client } from "@nexia/shared/types/client";

function clientStub(overrides: Partial<Client> = {}): Client {
    return {
        id: 1,
        nombre: "QA",
        apellidos: "Manual",
        objetivo_entrenamiento: "hipertrofia",
        experiencia: "media",
        session_duration: null,
        training_days: [],
        ...overrides,
    } as Client;
}

describe("buildClientAuthoringMetaItems", () => {
    it("omite duración y días sin valor", () => {
        const items = buildClientAuthoringMetaItems(clientStub());
        const labels = items.map((i) => i.label);
        expect(labels).toContain("Objetivo");
        expect(labels).toContain("Experiencia");
        expect(labels).not.toContain("Duración");
        expect(labels).not.toContain("Días");
        expect(items.every((i) => i.value !== "—" && i.value !== "No especificada")).toBe(
            true,
        );
    });
});
