/**
 * athleteRunRestPhase.spec.ts — Reglas de fase descanso run atleta.
 */

import { describe, expect, it } from "vitest";
import {
    restPhaseAfterConfirmSaved,
    shouldAllowRestReconfirmSticky,
    shouldShowRestChip,
    shouldShowRestOverlay,
    shouldShowRunLogger,
} from "./athleteRunRestPhase";

describe("restPhaseAfterConfirmSaved", () => {
    it("abre overlay cuando el descanso ya corría y queda tiempo", () => {
        expect(
            restPhaseAfterConfirmSaved({
                hasRestTimer: true,
                remainingSeconds: 55,
                restCountdownWasActive: true,
            })
        ).toBe("rest_overlay");
    });

    it("avanza si no hay timer activo", () => {
        expect(
            restPhaseAfterConfirmSaved({
                hasRestTimer: true,
                remainingSeconds: 90,
                restCountdownWasActive: false,
            })
        ).toBe("advance");
    });

    it("avanza si el tiempo ya expiró", () => {
        expect(
            restPhaseAfterConfirmSaved({
                hasRestTimer: true,
                remainingSeconds: 0,
                restCountdownWasActive: true,
            })
        ).toBe("advance");
    });
});

describe("shouldShowRestChip", () => {
    it("solo en logging_rest, no en overlay", () => {
        expect(shouldShowRestChip("logging_rest", true, 30)).toBe(true);
        expect(shouldShowRestChip("rest_overlay", true, 30)).toBe(false);
    });
});

describe("shouldShowRestOverlay", () => {
    it("requiere fase overlay y tiempo positivo", () => {
        expect(shouldShowRestOverlay("rest_overlay", 10)).toBe(true);
        expect(shouldShowRestOverlay("logging_rest", 10)).toBe(false);
    });
});

describe("shouldShowRunLogger", () => {
    it("oculta logger bajo overlay fullscreen", () => {
        expect(shouldShowRunLogger("rest_overlay", false)).toBe(false);
        expect(shouldShowRunLogger("logging_rest", false)).toBe(true);
    });
});

describe("shouldAllowRestReconfirmSticky", () => {
    it("permite reconfirmar en logging_rest y rest_overlay con timer", () => {
        expect(shouldAllowRestReconfirmSticky("logging_rest", true, 40)).toBe(true);
        expect(shouldAllowRestReconfirmSticky("rest_overlay", true, 40)).toBe(true);
        expect(shouldAllowRestReconfirmSticky("doing", true, 40)).toBe(false);
    });
});
