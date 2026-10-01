import { describe, expect, it } from "vitest";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";
import type { ConstructorRow } from "@/components/sessionProgramming/constructorTypes";
import { buildExercisePayloadFromLine } from "./buildExercisePayload";

/** Contrato constructor → API: línea expandida FOR TIME guarda planned_sets ≥ 1. */
describe("buildExercisePayloadFromLine FOR TIME (C)", () => {
    it("persiste planned_sets 1 por línea expandida (ronda)", () => {
        const row = {
            setType: SET_TYPE.FOR_TIME,
            sets: null,
            rounds: 4,
            rest: 60,
            blockTypeId: 1,
            exercises: [],
        } as unknown as ConstructorRow;

        const line = {
            orderInBlock: 1,
            exercise: {
                exerciseId: 10,
                plannedWeight: null,
                plannedReps: "12",
                notes: null,
            },
            setDataEntry: { plannedReps: "12", plannedWeight: 40 },
        };

        const payload = buildExercisePayloadFromLine(row, line);
        expect(payload.planned_sets).toBe(1);
        expect(payload.set_type).toBe(SET_TYPE.FOR_TIME);
    });
});
