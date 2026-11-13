/**
 * searchText.spec.ts — Búsqueda sin acentos ni mayúsculas y opciones no elegibles.
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import { describe, expect, it } from "vitest";

import { filterSearchOptions, foldSearchText, sentenceCaseLabel } from "./searchText";

const muscles = [
    { value: 1, label: "bíceps braquial" },
    { value: 2, label: "braquial" },
    { value: 3, label: "braquiorradial" },
    { value: 4, label: "tríceps" },
];

describe("searchText", () => {
    it("pliega acentos y mayúsculas", () => {
        expect(foldSearchText("  Bíceps BRAQUIAL ")).toBe("biceps braquial");
    });

    it("pone mayúscula inicial sin tocar el resto", () => {
        expect(sentenceCaseLabel("bíceps braquial")).toBe("Bíceps braquial");
        expect(sentenceCaseLabel("")).toBe("");
    });

    it("filtra por contenido y en el orden recibido", () => {
        expect(filterSearchOptions(muscles, "BRA").map((o) => o.value)).toEqual([1, 2, 3]);
        expect(filterSearchOptions(muscles, "biceps").map((o) => o.value)).toEqual([1]);
        expect(filterSearchOptions(muscles, "")).toHaveLength(4);
    });

    it("devuelve las no elegibles con su motivo", () => {
        const result = filterSearchOptions(muscles, "braq", new Map([[2, "Ya es objetivo"]]));
        expect(result.find((o) => o.value === 2)?.disabledReason).toBe("Ya es objetivo");
        expect(result.find((o) => o.value === 3)?.disabledReason).toBeNull();
    });

    it("busca también en el texto secundario", () => {
        const options = [{ value: "a", label: "Codo", hint: "flexión" }];
        expect(filterSearchOptions(options, "flex")).toHaveLength(1);
    });
});
