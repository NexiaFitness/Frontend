/**
 * parallelConstructorHydration.spec.ts — Agrupación slot × ronda para hidratación del constructor.
 */

import { describe, expect, it } from "vitest";
import {
    groupParallelConstructorApiLines,
    isParallelConstructorExpandedLines,
    type ParallelConstructorApiLine,
} from "./parallelConstructorHydration";

function line(
    id: number,
    exerciseId: number,
    order: number,
    plannedSets: number | null = 1,
    reps = "10"
): ParallelConstructorApiLine & { planned_reps: string } {
    return {
        id,
        exercise_id: exerciseId,
        order_in_block: order,
        planned_sets: plannedSets,
        planned_reps: reps,
    };
}

describe("groupParallelConstructorApiLines superset", () => {
    it("separa A1/A2 aunque compartan exercise_id (sesión 4133 legacy)", () => {
        const lines = [
            line(330, 75, 1, 3, "10"),
            line(331, 75, 2, 3, "10"),
            line(332, 75, 3, 3, "10"),
            line(333, 75, 4, 3, "12"),
            line(334, 75, 5, 3, "12"),
            line(335, 75, 6, 3, "12"),
        ];
        const { rounds, slotLines } = groupParallelConstructorApiLines(lines, null, 2);
        expect(rounds).toBe(3);
        expect(slotLines).toHaveLength(2);
        expect(slotLines[0]).toHaveLength(3);
        expect(slotLines[1]).toHaveLength(3);
        expect(slotLines[0].map((l) => l.planned_reps)).toEqual(["10", "10", "10"]);
        expect(slotLines[1].map((l) => l.planned_reps)).toEqual(["12", "12", "12"]);
    });

    it("no fusiona slots distintos con el mismo exercise_id expandido", () => {
        const lines = [
            line(1, 75, 1, 1, "10"),
            line(2, 75, 2, 1, "10"),
            line(3, 75, 3, 1, "10"),
            line(4, 19, 4, 1, "12"),
            line(5, 19, 5, 1, "12"),
            line(6, 19, 6, 1, "12"),
        ];
        const { slotLines } = groupParallelConstructorApiLines(lines, 3, 2);
        expect(slotLines[0][0].exercise_id).toBe(75);
        expect(slotLines[1][0].exercise_id).toBe(19);
    });
});

describe("isParallelConstructorExpandedLines", () => {
    it("detecta legacy 6 filas superset", () => {
        const lines = Array.from({ length: 6 }, (_, i) => line(i + 1, 75, i + 1, 3));
        expect(isParallelConstructorExpandedLines(lines, 2)).toBe(true);
    });

    it("no marca colapsado canónico 2 filas", () => {
        const lines = [line(1, 8, 1, 3), line(2, 12, 2, 3)];
        expect(isParallelConstructorExpandedLines(lines, 2)).toBe(false);
    });
});
