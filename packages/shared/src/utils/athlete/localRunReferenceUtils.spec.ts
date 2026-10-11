/**
 * localRunReferenceUtils.spec.ts — Referencia y RPE offline intra-sesión (D-LOG-INTEGRITY).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { describe, expect, it } from "vitest";

import type { LocalSetExecution } from "../../offline/athleteSessionTypes";
import {
    resolveLocalRoundRpeFromExecutions,
    stepKeyBelongsToGroup,
} from "./localRunReferenceUtils";

/** step_key real (buildAthleteRunSteps.makeStepKey): `${groupId}-r${round}-${slot}-${set}-${index}`. */
const slotStepKey = (groupId: string, round: number, slot = "A1") =>
    `${groupId}-r${round}-${slot}-R${round}-1`;

describe("stepKeyBelongsToGroup", () => {
    it("reconoce el step_key real, que empieza por el groupId", () => {
        expect(stepKeyBelongsToGroup(slotStepKey("block-579-superset-1", 1), "block-579-superset-1")).toBe(true);
        expect(stepKeyBelongsToGroup("block-579-superset-1-round-1", "block-579-superset-1")).toBe(true);
    });

    it("no confunde grupo 1 con grupo 10 ni con otro bloque", () => {
        expect(stepKeyBelongsToGroup(slotStepKey("block-579-superset-10", 1), "block-579-superset-1")).toBe(false);
        expect(stepKeyBelongsToGroup(slotStepKey("block-5791-superset-1", 1), "block-579-superset-1")).toBe(false);
        expect(stepKeyBelongsToGroup(slotStepKey("block-579-superset-1", 1), "")).toBe(false);
    });
});

describe("resolveLocalRoundRpeFromExecutions", () => {
    const base = (row: Partial<LocalSetExecution>): LocalSetExecution => ({
        step_key: row.step_key ?? slotStepKey("block-5-superset-1", 1),
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

    it("no confunde el grupo 1 con el grupo 10 (step_key real)", () => {
        const executions: LocalSetExecution[] = [
            base({
                step_key: slotStepKey("block-5-superset-10", 1),
                round_index: 1,
                rpe: 10,
            }),
            base({
                step_key: slotStepKey("block-5-superset-1", 1),
                round_index: 1,
                rpe: 7,
            }),
        ];
        expect(
            resolveLocalRoundRpeFromExecutions(
                executions,
                2,
                "superset",
                "block-5-superset-1",
            ),
        ).toBe(7);
        expect(
            resolveLocalRoundRpeFromExecutions(
                executions,
                2,
                "superset",
                "block-5-superset-10",
            ),
        ).toBe(10);
    });

    it("R2 hereda RPE de R1 del mismo groupId, no de otro superset", () => {
        const executions: LocalSetExecution[] = [
            base({
                step_key: slotStepKey("block-5-superset-1", 1),
                round_index: 1,
                rpe: 8,
            }),
            base({
                step_key: slotStepKey("block-5-superset-2", 1),
                round_index: 1,
                rpe: 9,
            }),
        ];
        expect(
            resolveLocalRoundRpeFromExecutions(
                executions,
                2,
                "superset",
                "block-5-superset-1"
            )
        ).toBe(8);
        expect(
            resolveLocalRoundRpeFromExecutions(
                executions,
                2,
                "superset",
                "block-5-superset-2"
            )
        ).toBe(9);
    });
});
