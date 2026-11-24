/**
 * constructorValidationPresentation.test.ts — Copy del aviso al crear sesión con contenido.
 */

import { describe, expect, it } from "vitest";
import { sessionCreatedWithContentToast } from "../constructorValidationPresentation";

describe("sessionCreatedWithContentToast", () => {
    it("usa singular con un bloque y un ejercicio", () => {
        expect(sessionCreatedWithContentToast(1, 1)).toBe(
            "Sesión creada con 1 bloque y 1 ejercicio."
        );
    });

    it("usa plural con varios", () => {
        expect(sessionCreatedWithContentToast(2, 5)).toBe(
            "Sesión creada con 2 bloques y 5 ejercicios."
        );
    });
});
