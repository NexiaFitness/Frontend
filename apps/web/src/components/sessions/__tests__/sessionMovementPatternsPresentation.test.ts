/**
 * sessionMovementPatternsPresentation.test.ts — B-20 tildes en patrones del día.
 */

import { describe, expect, it } from "vitest";

import { assertAccentedSpanishUi } from "@nexia/shared/utils/text/spanishUiAccentGuard";

import {
    SESSION_MOVEMENT_PATTERNS_EMPTY,
    SESSION_MOVEMENT_PATTERNS_SUBTITLE,
    SESSION_MOVEMENT_PATTERNS_TITLE,
} from "../sessionMovementPatternsPresentation";
import {
    SESSION_CONSTRUCTOR_EMPTY,
    SESSION_CONSTRUCTOR_TITLE,
} from "@/components/sessionProgramming/sessionConstructorPresentation";

describe("B-20 UI copy accents", () => {
    it("patrones del día llevan tilde", () => {
        for (const [label, text] of [
            ["title", SESSION_MOVEMENT_PATTERNS_TITLE],
            ["subtitle", SESSION_MOVEMENT_PATTERNS_SUBTITLE],
            ["empty", SESSION_MOVEMENT_PATTERNS_EMPTY],
        ] as const) {
            assertAccentedSpanishUi(text, label);
        }
        expect(SESSION_MOVEMENT_PATTERNS_TITLE).toContain("día");
        expect(SESSION_MOVEMENT_PATTERNS_SUBTITLE).toMatch(/Qué|según|planificación/);
    });

    it("constructor de sesión lleva tilde", () => {
        assertAccentedSpanishUi(SESSION_CONSTRUCTOR_TITLE, "constructor title");
        assertAccentedSpanishUi(SESSION_CONSTRUCTOR_EMPTY, "constructor empty");
    });
});
