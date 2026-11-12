/**
 * guidedRunStepActions.spec.ts — Última serie: solo «Finalizar sesión» tras guardar.
 */

import { describe, expect, it } from "vitest";
import {
    guidedRunConfirmLabel,
    shouldShowGuidedStepActions,
} from "./guidedRunStepActions";

describe("shouldShowGuidedStepActions", () => {
    it("el último paso sin guardar sigue ofreciendo Guardar", () => {
        expect(
            shouldShowGuidedStepActions(true, false, true, {
                phase: "doing",
                hasRestTimer: false,
                remainingSeconds: 0,
            })
        ).toBe(true);
    });

    it("el último paso ya guardado no vuelve a ofrecer Guardar", () => {
        expect(
            shouldShowGuidedStepActions(true, true, true, {
                phase: "logging_rest",
                hasRestTimer: true,
                remainingSeconds: 45,
            })
        ).toBe(false);
    });

    it("un paso intermedio guardado puede reconfirmar durante el descanso", () => {
        expect(
            shouldShowGuidedStepActions(true, true, false, {
                phase: "logging_rest",
                hasRestTimer: true,
                remainingSeconds: 45,
            })
        ).toBe(true);
    });
});

describe("guidedRunConfirmLabel", () => {
    it("la serie suelta se llama Guardar", () => {
        expect(guidedRunConfirmLabel(false, false, false, false)).toBe("Guardar");
    });
});
