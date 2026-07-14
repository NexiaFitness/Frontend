/**
 * athleteRunGroupContext.spec.ts
 */

import { describe, expect, it } from "vitest";
import type { AthleteFlatExercise } from "../../offline/athleteSessionTypes";
import {
    buildAthleteRunGroupContext,
    buildTimedBlockExplanation,
    shouldRestAfterCompletingStep,
} from "./athleteRunGroupContext";

function step(
    overrides: Partial<AthleteFlatExercise> & Pick<AthleteFlatExercise, "stepKey" | "name">
): AthleteFlatExercise {
    return {
        blockExerciseId: 1,
        exerciseId: 1,
        blockName: "Hipertrofia",
        groupKind: "superset",
        setLabel: "R1",
        setIndex: 1,
        totalSetsInSlot: 3,
        plannedLabel: "10 repeticiones",
        plannedWeight: null,
        defaultWeight: 0,
        defaultReps: 10,
        restSeconds: 90,
        defaultRpe: null,
        videoUrl: null,
        loggedSets: 0,
        badgeLabel: "SUPERSET A",
        groupId: "block-62-superset-1",
        roundIndex: 1,
        roundTotal: 3,
        slotLabel: "A1",
        instruction: "",
        ...overrides,
    };
}

describe("shouldRestAfterCompletingStep", () => {
    const a1 = step({ stepKey: "a1", name: "Press", slotLabel: "A1", restSeconds: null });
    const a2 = step({
        stepKey: "a2",
        name: "Remo",
        slotLabel: "A2",
        blockExerciseId: 2,
        exerciseId: 2,
        restSeconds: 90,
    });

    it("no descansa entre A1 y A2 de la misma ronda", () => {
        expect(shouldRestAfterCompletingStep(a1, a2)).toBe(false);
    });

    it("descansa al cerrar ronda (A2 → A1 ronda 2)", () => {
        const a1r2 = step({
            stepKey: "a1r2",
            name: "Press",
            slotLabel: "A1",
            roundIndex: 2,
            restSeconds: null,
        });
        expect(shouldRestAfterCompletingStep(a2, a1r2)).toBe(true);
    });
});

describe("buildTimedBlockExplanation", () => {
    it("amrap — repeticiones en time cap", () => {
        expect(
            buildTimedBlockExplanation({
                groupKind: "amrap",
                timeCapMinutes: 6,
                slotCount: 2,
            })
        ).toBe("Repite la secuencia de ejercicios tantas veces como puedas en 6 min.");
    });

    it("emom — lenguaje atleta sin jerga de ventana", () => {
        expect(
            buildTimedBlockExplanation({
                groupKind: "emom",
                intervalSeconds: 60,
                slotCount: 2,
            })
        ).toBe(
            "Tienes 60 segundos para hacer estos ejercicios. Si terminas antes, espera al siguiente intervalo."
        );
    });

    it("for_time — cronómetro como resultado", () => {
        expect(
            buildTimedBlockExplanation({
                groupKind: "for_time",
                slotCount: 2,
            })
        ).toBe(
            "Haz los ejercicios en orden, lo más rápido que puedas sin perder técnica. El cronómetro mide tu tiempo."
        );
    });
});

describe("buildAthleteRunGroupContext", () => {
    it("lista ejercicios de la ronda con estado actual", () => {
        const flat = [
            step({ stepKey: "a1", name: "Press", slotLabel: "A1", restSeconds: null }),
            step({
                stepKey: "a2",
                name: "Remo",
                slotLabel: "A2",
                blockExerciseId: 2,
                exerciseId: 2,
            }),
        ];

        const ctx = buildAthleteRunGroupContext(flat, "a1");
        expect(ctx?.sectionLabel).toBe("Superset");
        expect(ctx?.slots).toHaveLength(2);
        expect(ctx?.slots[0]?.status).toBe("current");
        expect(ctx?.slots[1]?.status).toBe("upcoming");
        expect(ctx?.nextExerciseName).toBe("Remo");
        expect(ctx?.transitionHint).toContain("Siguiente sin descanso");
    });

    it("ajusta el copy al número de ejercicios del superset", () => {
        const two = buildAthleteRunGroupContext(
            [
                step({ stepKey: "a1", name: "Press", slotLabel: "A1", restSeconds: null }),
                step({
                    stepKey: "a2",
                    name: "Remo",
                    slotLabel: "A2",
                    blockExerciseId: 2,
                    exerciseId: 2,
                }),
            ],
            "a1"
        );
        expect(two?.explanation).toContain("dos ejercicios");

        const three = buildAthleteRunGroupContext(
            [
                step({ stepKey: "a1", name: "Press", slotLabel: "A1", restSeconds: null }),
                step({
                    stepKey: "a2",
                    name: "Remo",
                    slotLabel: "A2",
                    blockExerciseId: 2,
                    exerciseId: 2,
                }),
                step({
                    stepKey: "a3",
                    name: "Face pull",
                    slotLabel: "A3",
                    blockExerciseId: 3,
                    exerciseId: 3,
                }),
            ],
            "a1"
        );
        expect(three?.explanation).toContain("tres ejercicios");
        expect(three?.slots).toHaveLength(3);
    });
});
