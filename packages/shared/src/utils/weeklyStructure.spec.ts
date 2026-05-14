/**
 * Tests unitarios: generateSyntheticWeeks + mergeWeeklyStructureWeeks
 *
 * Contexto: SPEC_FIX_ESTRUCTURA_SEMANAL_BLOQUES_ANTIGUOS.md §9.2
 */

import { describe, expect, it } from "vitest";
import { generateSyntheticWeeks, mergeWeeklyStructureWeeks } from "./weeklyStructure";
import type { WeeklyStructureWeek } from "../types/weeklyStructure";

describe("generateSyntheticWeeks", () => {
    it("bloque de 28 días → 4 semanas sintéticas con 7 días vacíos cada una", () => {
        const weeks = generateSyntheticWeeks("2026-02-01", "2026-02-28");
        expect(weeks).toHaveLength(4);
        expect(weeks.map((w) => w.week_ordinal)).toEqual([1, 2, 3, 4]);
        weeks.forEach((w) => {
            expect(w.label).toBeNull();
            expect(w.id).toBeUndefined();
            expect(w.days).toHaveLength(7);
            expect(w.days.map((d) => d.day_of_week)).toEqual([1, 2, 3, 4, 5, 6, 7]);
            expect(w.days.every((d) => d.patterns.length === 0)).toBe(true);
        });
    });

    it("bloque de 3 días → 1 semana sintética", () => {
        const weeks = generateSyntheticWeeks("2026-01-01", "2026-01-03");
        expect(weeks).toHaveLength(1);
        expect(weeks[0].week_ordinal).toBe(1);
    });

    it("bloque de 8 días → 2 semanas sintéticas (ceil)", () => {
        const weeks = generateSyntheticWeeks("2026-01-01", "2026-01-08");
        expect(weeks).toHaveLength(2);
    });

    it("fechas iguales → 1 semana", () => {
        const weeks = generateSyntheticWeeks("2026-01-01", "2026-01-01");
        expect(weeks).toHaveLength(1);
    });

    it("startDate posterior a endDate → array vacío", () => {
        const weeks = generateSyntheticWeeks("2026-02-01", "2026-01-01");
        expect(weeks).toHaveLength(0);
    });
});

describe("mergeWeeklyStructureWeeks", () => {
    const realWeek = (ordinal: number, label?: string): WeeklyStructureWeek => ({
        id: ordinal * 100,
        week_ordinal: ordinal,
        label: label ?? null,
        days: [
            { id: 1, day_of_week: 1, patterns: [{ id: 1, movement_pattern_id: 10, name_es: "Empuje" }] },
        ],
    });

    const syntheticWeek = (ordinal: number): WeeklyStructureWeek => ({
        week_ordinal: ordinal,
        label: null,
        days: [{ day_of_week: 1, patterns: [] }],
    });

    it("realWeeks vacío → devuelve solo syntheticWeeks", () => {
        const synth = [syntheticWeek(1), syntheticWeek(2)];
        const merged = mergeWeeklyStructureWeeks([], synth);
        expect(merged).toHaveLength(2);
        expect(merged.map((w) => w.week_ordinal)).toEqual([1, 2]);
    });

    it("realWeeks con ordinal 2 + synthetic 1,2,3,4 → devuelve 1(real)+2+3+4(synth) ordenado", () => {
        const real = [realWeek(2, "Real S2")];
        const synth = [syntheticWeek(1), syntheticWeek(2), syntheticWeek(3), syntheticWeek(4)];
        const merged = mergeWeeklyStructureWeeks(real, synth);
        expect(merged).toHaveLength(4);
        expect(merged.map((w) => w.week_ordinal)).toEqual([1, 2, 3, 4]);
        // La semana 2 debe ser la real (tiene id)
        expect(merged.find((w) => w.week_ordinal === 2)?.id).toBe(200);
        expect(merged.find((w) => w.week_ordinal === 2)?.label).toBe("Real S2");
    });

    it("todos los ordinals cubiertos por reales → devuelve solo reales", () => {
        const real = [realWeek(1), realWeek(2)];
        const synth = [syntheticWeek(1), syntheticWeek(2)];
        const merged = mergeWeeklyStructureWeeks(real, synth);
        expect(merged).toHaveLength(2);
        expect(merged.every((w) => w.id != null)).toBe(true);
    });

    it("ordena por week_ordinal ascendente", () => {
        const real = [realWeek(3), realWeek(1)];
        const synth = [syntheticWeek(2), syntheticWeek(4)];
        const merged = mergeWeeklyStructureWeeks(real, synth);
        expect(merged.map((w) => w.week_ordinal)).toEqual([1, 2, 3, 4]);
    });
});
