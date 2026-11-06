/**
 * exerciseSafetyState.spec.ts — H7: sin respuesta no es «sin hallazgo», y el tope es un estado.
 */

import { describe, expect, it } from "vitest";
import type { ExerciseSafetyResponse } from "../types/engineSafety";
import { exerciseSafetyUiState } from "./exerciseSafetyState";

function verdict(partial: Partial<ExerciseSafetyResponse>): ExerciseSafetyResponse {
    return {
        is_safe: false,
        blocking: false,
        suggested_alternatives: [],
        status: "safe",
        ...partial,
    };
}

describe("exerciseSafetyUiState", () => {
    it("no presenta como comprobado un ejercicio sin respuesta", () => {
        expect(exerciseSafetyUiState(undefined, { checkFailed: false, checkPending: false })).toBe(
            "unchecked"
        );
    });

    it("conserva exceeds_limit", () => {
        expect(
            exerciseSafetyUiState(verdict({ status: "exceeds_limit", blocking: true }), {
                checkFailed: false,
            })
        ).toBe("exceeds_limit");
    });
});
