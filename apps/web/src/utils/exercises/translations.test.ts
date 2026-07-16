import { describe, expect, it } from "vitest";
import {
    EQUIPMENT_NAME_EN_TO_ES,
    formatEquipmentLabelLine,
    getEquipmentLabel,
} from "./translations";

describe("getEquipmentLabel", () => {
    it("maps catalog EN slugs to Spanish name_es", () => {
        expect(getEquipmentLabel("barbell")).toBe("barra");
        expect(getEquipmentLabel("bench")).toBe("banco");
        expect(getEquipmentLabel("box")).toBe("cajón");
        expect(getEquipmentLabel("pull_up_bar")).toBe("barra de dominadas");
    });

    it("is idempotent for values already in Spanish", () => {
        expect(getEquipmentLabel("banco")).toBe("banco");
        expect(getEquipmentLabel("barra de dominadas")).toBe("barra de dominadas");
    });

    it("returns empty for none", () => {
        expect(getEquipmentLabel("none")).toBe("");
        expect(getEquipmentLabel("NONE")).toBe("");
    });

    it("covers all 26 catalog equipment entries", () => {
        const catalogEn = [
            "bodyweight",
            "barbell",
            "dumbbell",
            "kettlebell",
            "machine",
            "cable",
            "resistance_band",
            "medicine_ball",
            "smith_machine",
            "trap_bar",
            "ez_bar",
            "landmine",
            "bench",
            "pull_up_bar",
            "rings",
            "trx",
            "box",
            "sled",
            "rower",
            "bike",
            "skierg",
            "bumper_plates",
            "foam_roller",
            "yoga_mat",
            "sandbag",
            "jump_rope",
        ];
        for (const key of catalogEn) {
            expect(EQUIPMENT_NAME_EN_TO_ES[key], key).toBeTruthy();
            expect(getEquipmentLabel(key)).toBe(EQUIPMENT_NAME_EN_TO_ES[key]);
        }
    });
});

describe("formatEquipmentLabelLine", () => {
    it("translates comma-separated legacy EN tokens", () => {
        expect(formatEquipmentLabelLine("barbell,bench")).toBe("barra, banco");
        expect(formatEquipmentLabelLine("pull_up_bar, rings")).toBe("barra de dominadas, anillas");
    });

    it("preserves Spanish catalog lines from auto-suggest", () => {
        expect(formatEquipmentLabelLine("banco, barra")).toBe("banco, barra");
    });
});
