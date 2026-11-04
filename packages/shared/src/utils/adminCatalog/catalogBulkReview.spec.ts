import { describe, expect, it } from "vitest";

import {
    buildCatalogBulkReviewBody,
    buildCatalogReviewListParams,
    parseCatalogBulkReviewConflicts,
    shownReviewValues,
} from "./catalogBulkReview";

describe("revisión masiva del catálogo", () => {
    it("arma la consulta con el filtro y omite los vacíos", () => {
        expect(
            buildCatalogReviewListParams({
                review: "rubric",
                search: "  sentadilla ",
                axialLoad: "",
                nivel: "beginner",
                pattern: "  ",
                skip: 0,
                limit: 50,
            })
        ).toEqual({
            skip: 0,
            limit: 50,
            review: "rubric",
            search: "sentadilla",
            axial_load: undefined,
            nivel: "beginner",
            pattern: undefined,
        });
    });

    it("muestra el valor editado y, si no hay edición, el del listado", () => {
        expect(shownReviewValues({ axial_load: "low", nivel: "beginner" })).toEqual({
            axialLoad: "low",
            nivel: "beginner",
        });
        expect(
            shownReviewValues(
                { axial_load: "low", nivel: "beginner" },
                { axialLoad: "high" }
            )
        ).toEqual({ axialLoad: "high", nivel: "beginner" });
    });

    it("construye el cuerpo con los valores visibles y rechaza 0 o más de 200", () => {
        const draft = {
            exercisePk: 4,
            axialLoad: "none",
            nivel: "advanced",
            expectedUpdatedAt: "2026-11-04T00:00:00",
        };
        expect(buildCatalogBulkReviewBody([draft])).toEqual({
            ok: true,
            body: {
                items: [
                    {
                        exercise_pk: 4,
                        axial_load: "none",
                        nivel: "advanced",
                        expected_updated_at: "2026-11-04T00:00:00",
                    },
                ],
            },
        });
        expect(buildCatalogBulkReviewBody([])).toEqual({ ok: false, reason: "empty" });
        expect(
            buildCatalogBulkReviewBody(Array.from({ length: 201 }, () => draft)).ok
        ).toBe(false);
    });

    it("saca los nombres del 409 y ignora otro error", () => {
        expect(
            parseCatalogBulkReviewConflicts({
                status: 409,
                data: {
                    detail: {
                        code: "CONCURRENT_MODIFICATION",
                        conflicts: [{ exercise_pk: 1, nombre: "Remo" }],
                    },
                },
            })
        ).toEqual(["Remo"]);
        expect(parseCatalogBulkReviewConflicts({ status: 500, data: {} })).toBeNull();
    });
});
