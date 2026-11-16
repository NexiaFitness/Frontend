/**
 * sessionConstructorPresentation.test.ts — B-20: copy del constructor con tilde.
 */

import { describe, expect, it } from "vitest";

import {
    SESSION_CONSTRUCTOR_EMPTY,
    SESSION_CONSTRUCTOR_TITLE,
} from "../sessionConstructorPresentation";

describe("sessionConstructorPresentation (B-20)", () => {
    it("usa Sesión con tilde en título y vacío", () => {
        expect(SESSION_CONSTRUCTOR_TITLE).toBe("Constructor de Sesión");
        expect(SESSION_CONSTRUCTOR_EMPTY).toContain("tu sesión");
        expect(SESSION_CONSTRUCTOR_TITLE).not.toMatch(/Sesion\b/);
        expect(SESSION_CONSTRUCTOR_EMPTY).not.toMatch(/\bsesion\b/);
    });
});
