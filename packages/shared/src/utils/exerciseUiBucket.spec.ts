/**
 * exerciseUiBucket.spec.ts — `planningPatternOptions` (taxonomía v2, H2).
 */
import { describe, expect, it } from "vitest";
import type { MovementPattern } from "../types/exercise";
import { planningPatternOptions } from "./exerciseUiBucket";

function pattern(id: number, name_en: string, is_planning_selectable: boolean): MovementPattern {
    return {
        id,
        name_en,
        name_es: null,
        description: null,
        ui_bucket: "LOWER",
        body_region: "lower",
        joint_subgroup: null,
        kind: "compound",
        is_planning_selectable,
        is_active: true,
        created_at: "2026-10-27T00:00:00Z",
        updated_at: "2026-10-27T00:00:00Z",
    };
}

const CATALOG = [pattern(1, "squat", true), pattern(2, "locomotion", false)];

describe("planningPatternOptions", () => {
    it("oculta los patrones no seleccionables", () => {
        expect(planningPatternOptions(CATALOG, []).map((p) => p.id)).toEqual([1]);
    });

    it("mantiene un patrón no seleccionable si ya está elegido", () => {
        expect(planningPatternOptions(CATALOG, [2]).map((p) => p.id)).toEqual([1, 2]);
    });
});
