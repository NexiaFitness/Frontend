/**
 * localRunReferenceUtils.spec.ts — Referencia y RPE offline intra-sesión (D-LOG-INTEGRITY).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { describe, expect, it } from "vitest";

import type { LocalSetExecution } from "../../offline/athleteSessionTypes";
import { resolveLocalRoundRpeFromExecutions } from "./localRunReferenceUtils";

describe("resolveLocalRoundRpeFromExecutions", () => {
    const base = (row: Partial<LocalSetExecution>): LocalSetExecution => ({
        step_key: row.step_key ?? "slot-a-r1",
        exercise_id: row.exercise_id ?? 1,
        weight_kg: row.weight_kg ?? 30,
        reps: row.reps ?? 10,
        rpe: row.rpe ?? null,
        set_index: row.set_index ?? null,
        round_index: row.round_index ?? 1,
        slot_label: row.slot_label ?? "A1",
        group_kind: row.group_kind ?? "superset",
        performed_at: row.performed_at ?? 1,
    });

    it("R2 hereda RPE de R1 del mismo groupId, no de otro superset", () => {
        const executions: LocalSetExecution[] = [
            base({
                step_key: "superset-g1-round-1-slot-a",
                round_index: 1,
                rpe: 8,
            }),
            base({
                step_key: "superset-g2-round-1-slot-a",
                round_index: 1,
                rpe: 9,
            }),
        ];
        expect(
            resolveLocalRoundRpeFromExecutions(
                executions,
                2,
                "superset",
                "g1"
            )
        ).toBe(8);
        expect(
            resolveLocalRoundRpeFromExecutions(
                executions,
                2,
                "superset",
                "g2"
            )
        ).toBe(9);
    });
});
