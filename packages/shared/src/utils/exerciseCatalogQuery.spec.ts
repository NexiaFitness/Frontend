/**
 * exerciseCatalogQuery.spec.ts — Lógica pura de las lecturas del catálogo (PERF-7).
 *
 * Contexto: parámetros de GET /exercises/ (mismos nombres, orden y repetición que antes
 * de extraerlos de useExercises.ts) y tags de caché.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import { describe, expect, it } from "vitest";
import { appendExerciseListFilters, exerciseListTags } from "./exerciseCatalogQuery";

function query(filters: Parameters<typeof appendExerciseListFilters>[1]): string {
    const params = new URLSearchParams();
    appendExerciseListFilters(params, filters);
    return params.toString();
}

describe("appendExerciseListFilters", () => {
    it("sin filtros no añade nada", () => {
        expect(query({})).toBe("");
    });

    it("todos los filtros, en el orden y con la repetición del backend", () => {
        expect(
            query({
                tipo: "multiarticular",
                nivel: "intermediate",
                equipo: "barbell",
                patron_movimiento: "squat",
                tipo_carga: "external",
                search: "press banca",
                muscle_group_ids: [1, 2],
                equipment_ids: [3],
                movement_pattern_ids: [4, 5],
                client_id: 78,
                contract: "complete",
            })
        ).toBe(
            "tipo=multiarticular&nivel=intermediate&equipo=barbell&patron_movimiento=squat" +
                "&tipo_carga=external&search=press+banca&muscle_group_ids=1&muscle_group_ids=2" +
                "&equipment_ids=3&movement_pattern_ids=4&movement_pattern_ids=5" +
                "&movement_pattern_role=primary&client_id=78&contract=complete"
        );
    });

    it("el rol del patrón solo viaja si hay patrones", () => {
        expect(query({ movement_pattern_role: "any" })).toBe("");
        expect(query({ movement_pattern_ids: [9], movement_pattern_role: "any" })).toBe(
            "movement_pattern_ids=9&movement_pattern_role=any"
        );
    });

    it("client_id 0 se envía; listas vacías no", () => {
        expect(query({ client_id: 0, equipment_ids: [], muscle_group_ids: [] })).toBe(
            "client_id=0"
        );
    });
});

describe("exerciseListTags", () => {
    it("un tag por id y el de lista", () => {
        expect(exerciseListTags([{ id: 1 }, { id: 2 }])).toEqual([
            { type: "Exercise", id: 1 },
            { type: "Exercise", id: 2 },
            { type: "Exercise", id: "LIST" },
        ]);
    });

    it("sin datos, solo el de lista", () => {
        expect(exerciseListTags(undefined)).toEqual([{ type: "Exercise", id: "LIST" }]);
    });
});
