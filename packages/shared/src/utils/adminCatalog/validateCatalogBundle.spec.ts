/**
 * validateCatalogBundle.test.ts — Validación cliente bundle Admin.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { describe, expect, it } from "vitest";
import {
    finalizeCatalogBundle,
    orderMusclesForCommit,
    parseCatalogAxialLoad,
    validateCatalogBundleDraft,
    type CatalogBundleDraft,
} from "./validateCatalogBundle";

function validDraft(overrides: Partial<CatalogBundleDraft["core"]> = {}): CatalogBundleDraft {
    return {
        core: {
            nombre: "Sentadilla",
            tipo: "multiarticular",
            nivel: "intermediate",
            axial_load: "high",
            ...overrides,
        },
        muscles: [{ muscle_id: 1, role: "prime_mover" }],
        movement_patterns: [{ movement_pattern_id: 1, role: "primary" }],
        joint_actions: [{ joint_id: 1, action_id: 2, role: "primary" }],
        equipment_ids: [1],
        tag_ids: [],
    };
}

describe("validateCatalogBundleDraft", () => {
    it("ok con draft mínimo válido", () => {
        const result = validateCatalogBundleDraft({
            core: {
                nombre: "Sentadilla",
                tipo: "multiarticular",
                nivel: "intermediate",
                axial_load: "high",
            },
            muscles: [{ muscle_id: 1, role: "prime_mover" }],
            movement_patterns: [{ movement_pattern_id: 1, role: "primary" }],
            joint_actions: [{ joint_id: 1, action_id: 2, role: "primary" }],
            equipment_ids: [1],
            tag_ids: [],
        });
        expect(result.ok).toBe(true);
        expect(result.firstSectionWithError).toBeNull();
    });

    it("falla sin prime mover y marca sección músculos", () => {
        const result = validateCatalogBundleDraft({
            core: {
                nombre: "X",
                tipo: "monoarticular",
                nivel: "beginner",
                axial_load: "none",
            },
            muscles: [{ muscle_id: 1, role: "synergist" }],
            movement_patterns: [{ movement_pattern_id: 1, role: "primary" }],
            joint_actions: [{ joint_id: 1, action_id: 2, role: "primary" }],
            equipment_ids: [1],
            tag_ids: [],
        });
        expect(result.ok).toBe(false);
        expect(result.firstSectionWithError).toBe("musculos");
        expect(result.bySection.some((s) => s.section === "musculos")).toBe(true);
    });

    it("detecta músculo duplicado (DC-01)", () => {
        const result = validateCatalogBundleDraft({
            core: {
                nombre: "X",
                tipo: "complex",
                nivel: "advanced",
                axial_load: "medium",
            },
            muscles: [
                { muscle_id: 5, role: "prime_mover" },
                { muscle_id: 5, role: "synergist" },
            ],
            movement_patterns: [{ movement_pattern_id: 1, role: "primary" }],
            joint_actions: [{ joint_id: 1, action_id: 2, role: "primary" }],
            equipment_ids: [1],
            tag_ids: [],
        });
        expect(result.ok).toBe(false);
        expect(result.bySection.find((s) => s.section === "musculos")?.messages.join(" ")).toMatch(
            /duplicado/i
        );
    });
});

describe("carga axial y nivel obligatorios (sin valor por defecto)", () => {
    it("falla si la carga axial no está elegida", () => {
        const result = validateCatalogBundleDraft(validDraft({ axial_load: null }));
        expect(result.ok).toBe(false);
        expect(result.firstSectionWithError).toBe("datos");
        expect(result.bySection[0]?.messages).toContain("La carga axial es obligatoria");
    });

    it("falla si el nivel está vacío", () => {
        const result = validateCatalogBundleDraft(validDraft({ nivel: "" }));
        expect(result.ok).toBe(false);
        expect(result.bySection[0]?.messages).toContain("El nivel es obligatorio");
    });

    it("finalizeCatalogBundle no produce payload sin carga axial", () => {
        expect(finalizeCatalogBundle(validDraft({ axial_load: null }))).toBeNull();
    });

    it("finalizeCatalogBundle conserva la carga axial elegida", () => {
        expect(finalizeCatalogBundle(validDraft({ axial_load: "none" }))?.core.axial_load).toBe("none");
    });
});

describe("parseCatalogAxialLoad", () => {
    it.each([
        ["HIGH", "high"],
        [" low ", "low"],
        ["none", "none"],
    ])("reconoce %s", (raw, expected) => {
        expect(parseCatalogAxialLoad(raw)).toBe(expected);
    });

    it.each([[null], [undefined], [""], ["alta"]])("devuelve null para %s", (raw) => {
        expect(parseCatalogAxialLoad(raw)).toBeNull();
    });
});

describe("orderMusclesForCommit", () => {
    it("pone PM primero preservando orden relativo", () => {
        const ordered = orderMusclesForCommit([
            { muscle_id: 2, role: "synergist" },
            { muscle_id: 1, role: "prime_mover" },
            { muscle_id: 3, role: "prime_mover" },
        ]);
        expect(ordered.map((m) => m.muscle_id)).toEqual([1, 3, 2]);
    });
});
