import { describe, expect, it } from "vitest";

import type { ConstructorRow } from "../../constructorTypes";
import { SET_TYPE } from "@nexia/shared/types/sessionProgramming";

import { applyConstructorExerciseCatalogNames } from "./applyConstructorExerciseCatalogNames";

function rowWithExercise(exerciseId: number, exerciseName: string): ConstructorRow {
    return {
        id: "row-1",
        serverBlockId: 1,
        blockTypeId: 1,
        setType: SET_TYPE.SINGLE_SET,
        sets: 3,
        rounds: null,
        timeCap: null,
        intervalSeconds: null,
        rest: 60,
        repsTipo: "reps",
        exercises: [
            {
                id: "ex-1",
                serverExerciseId: 10,
                exerciseId,
                exerciseName,
                plannedReps: "10",
                plannedWeight: null,
                plannedAssistanceKg: null,
                plannedDuration: null,
                effortCharacter: null,
                effortValue: null,
                notes: null,
            },
        ],
    };
}

describe("applyConstructorExerciseCatalogNames", () => {
    it("sustituye nombres provisionales por el catálogo", () => {
        const map = new Map<number, string>([[14, "Press banca"]]);
        const rows = [rowWithExercise(14, "Ejercicio #14")];
        const next = applyConstructorExerciseCatalogNames(rows, map);
        expect(next[0].exercises[0].exerciseName).toBe("Press banca");
    });

    it("no muta si el catálogo está vacío", () => {
        const rows = [rowWithExercise(14, "Ejercicio #14")];
        const next = applyConstructorExerciseCatalogNames(rows, new Map());
        expect(next).toBe(rows);
    });

    it("resuelve nombres dentro de ventanas EMOM", () => {
        const map = new Map<number, string>([
            [16, "Press banca"],
            [18, "Press militar"],
        ]);
        const rows: ConstructorRow[] = [
            {
                ...rowWithExercise(14, "Ejercicio #14"),
                setType: SET_TYPE.EMOM,
                exercises: [],
                emomWindows: [
                    {
                        id: "w1",
                        exercises: [
                            {
                                ...rowWithExercise(16, "Ejercicio #16").exercises[0],
                                exerciseId: 16,
                                exerciseName: "Ejercicio #16",
                            },
                        ],
                    },
                    {
                        id: "w2",
                        exercises: [
                            {
                                ...rowWithExercise(18, "Ejercicio #18").exercises[0],
                                exerciseId: 18,
                                exerciseName: "Ejercicio #18",
                            },
                        ],
                    },
                ],
            },
        ];
        const next = applyConstructorExerciseCatalogNames(rows, map);
        expect(next[0].emomWindows?.[0].exercises[0].exerciseName).toBe("Press banca");
        expect(next[0].emomWindows?.[1].exercises[0].exerciseName).toBe("Press militar");
    });
});
