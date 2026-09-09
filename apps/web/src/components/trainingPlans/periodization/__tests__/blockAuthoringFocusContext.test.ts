/**
 * blockAuthoringFocusContext.test.ts
 */

import { describe, expect, it } from "vitest";
import { createMockClient } from "@/test-utils/fixtures/clients/clients";
import {
    buildBlockAuthoringBreadcrumbs,
    buildClientAuthoringMetaItems,
    formatClientDisplayName,
} from "../blockAuthoringFocusContext";

describe("blockAuthoringFocusContext", () => {
    it("formatea nombre completo del cliente", () => {
        expect(
            formatClientDisplayName({
                nombre: "Carlos",
                apellidos: "Medina Vega",
            }),
        ).toBe("Carlos Medina Vega");
    });

    it("construye breadcrumbs del journey create", () => {
        const items = buildBlockAuthoringBreadcrumbs({
            clientId: 345,
            clientName: "Carlos Medina Vega",
            planId: 528,
            mode: "create",
        });

        expect(items.at(-1)?.label).toBe("Nuevo bloque");
        expect(items.at(-1)?.active).toBe(true);
        expect(items.find((item) => item.label === "Planificación")?.path).toContain(
            "tab=planning",
        );
    });

    it("expone meta compacta del cliente", () => {
        const items = buildClientAuthoringMetaItems(
            createMockClient({
                objetivo_entrenamiento: "hypertrophy",
                experiencia: "Alta",
                session_duration: "60-90",
                training_days: ["Monday", "Wednesday", "Friday"],
            }),
        );

        expect(items.map((item) => item.label)).toEqual([
            "Objetivo",
            "Experiencia",
            "Duración",
            "Días",
        ]);
        expect(items[3]?.value).toContain("L");
    });
});
