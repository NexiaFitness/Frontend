/**
 * weekStructureClassificationParity.test.ts — Paridad F5 vs BE _classify_week_ordinals_by_template.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { classifyWeeksWithBaseline } from "@nexia/shared";

type ParityCase = {
    id: string;
    template_ordinal: number;
    weeks: Array<{
        week_ordinal: number;
        days: Array<{
            day_of_week: number;
            patterns: Array<{ movement_pattern_id: number; sub_pattern: null }>;
        }>;
    }>;
    expected_inherited: number[];
    expected_personalized: number[];
};

const fixturePath = join(
    dirname(fileURLToPath(import.meta.url)),
    "fixtures/week_structure_classification_parity.json",
);

const cases = JSON.parse(readFileSync(fixturePath, "utf-8")) as ParityCase[];

describe("weekStructureClassificationParity", () => {
    for (const caseDef of cases) {
        it(`FE classifyWeeksWithBaseline — ${caseDef.id}`, () => {
            const weeks = caseDef.weeks.map((w) => ({
                week_ordinal: w.week_ordinal,
                label: null,
                days: w.days.map((d) => ({
                    day_of_week: d.day_of_week,
                    patterns: d.patterns.map((p) => ({
                        movement_pattern_id: p.movement_pattern_id,
                        sub_pattern: p.sub_pattern,
                    })),
                })),
            }));
            const kinds = classifyWeeksWithBaseline(
                weeks,
                weeks,
                caseDef.template_ordinal,
            );
            const inherited = Object.entries(kinds)
                .filter(([, k]) => k === "heredada")
                .map(([ord]) => Number(ord))
                .filter((n) => n !== caseDef.template_ordinal);
            const personalized = Object.entries(kinds)
                .filter(([, k]) => k === "personalizada")
                .map(([ord]) => Number(ord));
            expect(inherited.sort()).toEqual(
                [...caseDef.expected_inherited].sort(),
            );
            expect(personalized.sort()).toEqual(
                [...caseDef.expected_personalized].sort(),
            );
        });
    }
});
