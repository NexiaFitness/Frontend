/**
 * listOps.spec.ts — Mover, insertar, quitar y sustituir sin mutar la lista.
 *
 * @author Frontend Team
 * @since v6.1.0
 */

import { describe, expect, it } from "vitest";

import { insertAfter, moveItem, removeAt, replaceAt } from "./listOps";

describe("listOps", () => {
    const list = ["a", "b", "c"];

    it("mueve hacia arriba y hacia abajo", () => {
        expect(moveItem(list, 1, 0)).toEqual(["b", "a", "c"]);
        expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a"]);
        expect(list).toEqual(["a", "b", "c"]);
    });

    it("fuera de rango no cambia nada", () => {
        expect(moveItem(list, 0, -1)).toBe(list);
        expect(moveItem(list, 2, 3)).toBe(list);
        expect(removeAt(list, 5)).toBe(list);
        expect(replaceAt(list, -1, ["x"])).toBe(list);
    });

    it("inserta después de un índice, o al principio con -1", () => {
        expect(insertAfter(list, 0, ["x", "y"])).toEqual(["a", "x", "y", "b", "c"]);
        expect(insertAfter(list, -1, ["x"])).toEqual(["x", "a", "b", "c"]);
        expect(insertAfter(list, 9, ["x"])).toEqual(["a", "b", "c", "x"]);
    });

    it("quita y sustituye por varios", () => {
        expect(removeAt(list, 1)).toEqual(["a", "c"]);
        expect(replaceAt(list, 1, ["x", "y"])).toEqual(["a", "x", "y", "c"]);
    });
});
