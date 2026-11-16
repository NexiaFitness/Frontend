/**
 * spanishUiAccentGuard.spec.ts — B-20: la guarda detecta copy sin tilde.
 */

import { describe, expect, it } from "vitest";

import {
    assertAccentedSpanishUi,
    findUnaccentedSpanishUiWords,
} from "./spanishUiAccentGuard";
import { STANDALONE_SESSION_KIND_LABEL_ES } from "../../clients/clientDisplayPresentation";

describe("spanishUiAccentGuard (B-20)", () => {
    it("señala sesion / tecnica / segun / del dia sin tilde", () => {
        expect(
            findUnaccentedSpanishUiWords(
                "Constructor de Sesion: Que se entrena hoy segun la planificacion del dia",
            ),
        ).toEqual(
            expect.arrayContaining([
                "del dia",
                "planificacion",
                "segun",
                "sesion",
            ]),
        );
    });

    it("acepta copy ya acentuado", () => {
        expect(() =>
            assertAccentedSpanishUi(
                "Constructor de Sesión. Qué se entrena hoy según la planificación del día.",
            ),
        ).not.toThrow();
        expect(() =>
            assertAccentedSpanishUi(STANDALONE_SESSION_KIND_LABEL_ES),
        ).not.toThrow();
    });

    it("falla antes si el badge standalone perdiera la tilde", () => {
        expect(() => assertAccentedSpanishUi("Sesion libre")).toThrow(/sesion/i);
    });
});
