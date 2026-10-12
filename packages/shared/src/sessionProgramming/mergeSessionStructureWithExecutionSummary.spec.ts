import { describe, expect, it } from "vitest";
import type { SessionExecutionSummary } from "../types/trainerSetExecutions";
import type { SessionStructureView } from "./sessionBlockView";
import { mergeSessionStructureWithExecutionSummary } from "./mergeSessionStructureWithExecutionSummary";

describe("mergeSessionStructureWithExecutionSummary", () => {
    it("asigna peso distinto por set_index (legacy planned_sets=N)", () => {
        const view: SessionStructureView = {
            totalExercises: 1,
            totalSets: 2,
            blocks: [
                {
                    blockId: 164,
                    blockTypeName: "Hipertrofia",
                    groups: [
                        {
                            groupId: "block-164-single-0",
                            kind: "single_set",
                            badgeLabel: "SINGLE SET",
                            rounds: 2,
                            timeCapMinutes: null,
                            intervalSeconds: null,
                            restBetweenSeconds: null,
                            slots: [
                                {
                                    slotLabel: "S2",
                                    exerciseId: 16,
                                    exerciseName: "Press banca",
                                    sets: [
                                        {
                                            label: "S1",
                                            index: 1,
                                            plannedReps: "8",
                                            plannedWeight: 40,
                                            plannedDuration: null,
                                            plannedRest: 60,
                                            effortCharacter: null,
                                            effortValue: null,
                                            actualReps: "8",
                                            actualWeight: 35,
                                            actualEffortValue: null,
                                            rowLoggedSets: 1,
                                            sourceLineId: 999,
                                        },
                                        {
                                            label: "S2",
                                            index: 2,
                                            plannedReps: "8",
                                            plannedWeight: 40,
                                            plannedDuration: null,
                                            plannedRest: 60,
                                            effortCharacter: null,
                                            effortValue: null,
                                            actualReps: "8",
                                            actualWeight: 35,
                                            actualEffortValue: null,
                                            rowLoggedSets: 1,
                                            sourceLineId: 999,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const summary: SessionExecutionSummary = {
            training_session_id: 1883,
            client_id: 55,
            session_date: "2026-10-22",
            session_name: "Test",
            session_status: "planned",
            tonnage_kg: 544,
            executions_count: 2,
            rpe_adherence_pct: null,
            has_executions: true,
            exercises: [
                {
                    step_key: "block-164-single-0-r1-S2-S1-1",
                    exercise_id: 16,
                    exercise_name: "Press banca",
                    group_kind: "single_set",
                    prescribed_rpe: null,
                    executions: [
                        {
                            id: 25,
                            training_session_id: 1883,
                            session_date: null,
                            session_name: null,
                            exercise_id: 16,
                            exercise_name: "Press banca",
                            step_key: "block-164-single-0-r1-S2-S1-1",
                            set_index: 1,
                            round_index: 1,
                            slot_label: "S2",
                            group_kind: "single_set",
                            weight_kg: 33,
                            assistance_kg: null,
                            reps: 8,
                            rpe: 8,
                            prescribed_rpe: null,
                            record_status: "registered",
                            performed_at: null,
                        },
                        {
                            id: 26,
                            training_session_id: 1883,
                            session_date: null,
                            session_name: null,
                            exercise_id: 16,
                            exercise_name: "Press banca",
                            step_key: "block-164-single-0-r2-S2-S2-2",
                            set_index: 2,
                            round_index: 2,
                            slot_label: "S2",
                            group_kind: "single_set",
                            weight_kg: 35,
                            assistance_kg: null,
                            reps: 8,
                            rpe: null,
                            prescribed_rpe: null,
                            record_status: "registered",
                            performed_at: null,
                        },
                    ],
                },
            ],
        };

        const merged = mergeSessionStructureWithExecutionSummary(view, summary);
        const weights = merged.blocks[0].groups[0].slots[0].sets.map((s) => s.actualWeight);
        expect(weights).toEqual([33, 35]);
    });

    it("no colisiona mismo exercise_id en bloques distintos (step_key)", () => {
        const slot = (blockId: number, groupId: string, weightPrescription: number) => ({
            blockId,
            blockTypeName: "B",
            groups: [
                {
                    groupId,
                    kind: "single_set" as const,
                    badgeLabel: "SINGLE SET",
                    rounds: 1,
                    timeCapMinutes: null,
                    intervalSeconds: null,
                    restBetweenSeconds: null,
                    slots: [
                        {
                            slotLabel: "S1",
                            exerciseId: 16,
                            exerciseName: "Press banca",
                            sets: [
                                {
                                    label: "S1",
                                    index: 1,
                                    plannedReps: "8",
                                    plannedWeight: 40,
                                    plannedDuration: null,
                                    plannedRest: 60,
                                    effortCharacter: null,
                                    effortValue: null,
                                    actualReps: null,
                                    actualWeight: weightPrescription,
                                    actualEffortValue: null,
                                    rowLoggedSets: 0,
                                    sourceLineId: blockId,
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const view: SessionStructureView = {
            totalExercises: 2,
            totalSets: 2,
            blocks: [slot(10, "block-10-single-0", 99), slot(20, "block-20-single-0", 99)],
        };

        const summary: SessionExecutionSummary = {
            training_session_id: 1,
            client_id: 1,
            session_date: "2026-10-12",
            session_name: "T",
            session_status: "planned",
            tonnage_kg: 0,
            executions_count: 2,
            rpe_adherence_pct: null,
            has_executions: true,
            exercises: [
                {
                    step_key: "block-10-single-0-r1-S1-S1-1",
                    exercise_id: 16,
                    exercise_name: "Press banca",
                    group_kind: "single_set",
                    prescribed_rpe: null,
                    executions: [
                        {
                            id: 1,
                            training_session_id: 1,
                            session_date: null,
                            session_name: null,
                            exercise_id: 16,
                            exercise_name: "Press banca",
                            step_key: "block-10-single-0-r1-S1-S1-1",
                            set_index: 1,
                            round_index: 1,
                            slot_label: "S1",
                            group_kind: "single_set",
                            weight_kg: 50,
                            assistance_kg: null,
                            reps: 8,
                            rpe: null,
                            prescribed_rpe: null,
                            record_status: "registered",
                            performed_at: null,
                        },
                    ],
                },
                {
                    step_key: "block-20-single-0-r1-S1-S1-1",
                    exercise_id: 16,
                    exercise_name: "Press banca",
                    group_kind: "single_set",
                    prescribed_rpe: null,
                    executions: [
                        {
                            id: 2,
                            training_session_id: 1,
                            session_date: null,
                            session_name: null,
                            exercise_id: 16,
                            exercise_name: "Press banca",
                            step_key: "block-20-single-0-r1-S1-S1-1",
                            set_index: 1,
                            round_index: 1,
                            slot_label: "S1",
                            group_kind: "single_set",
                            weight_kg: 61,
                            assistance_kg: null,
                            reps: 6,
                            rpe: null,
                            prescribed_rpe: null,
                            record_status: "registered",
                            performed_at: null,
                        },
                    ],
                },
            ],
        };

        const merged = mergeSessionStructureWithExecutionSummary(view, summary);
        expect(merged.blocks[0].groups[0].slots[0].sets[0].actualWeight).toBe(50);
        expect(merged.blocks[1].groups[0].slots[0].sets[0].actualWeight).toBe(61);
    });

    it("weight_kg null en ejecución no conserva actualWeight de prescripción", () => {
        const view: SessionStructureView = {
            totalExercises: 1,
            totalSets: 1,
            blocks: [
                {
                    blockId: 1,
                    blockTypeName: "B",
                    groups: [
                        {
                            groupId: "block-1-single-0",
                            kind: "single_set",
                            badgeLabel: "SINGLE SET",
                            rounds: 1,
                            timeCapMinutes: null,
                            intervalSeconds: null,
                            restBetweenSeconds: null,
                            slots: [
                                {
                                    slotLabel: "S1",
                                    exerciseId: 16,
                                    exerciseName: "Press banca",
                                    sets: [
                                        {
                                            label: "S1",
                                            index: 1,
                                            plannedReps: "10",
                                            plannedWeight: 40,
                                            plannedDuration: null,
                                            plannedRest: 60,
                                            effortCharacter: null,
                                            effortValue: null,
                                            actualReps: "10",
                                            actualWeight: 40,
                                            actualEffortValue: null,
                                            rowLoggedSets: 1,
                                            sourceLineId: 1,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const summary: SessionExecutionSummary = {
            training_session_id: 1,
            client_id: 1,
            session_date: null,
            session_name: null,
            session_status: "planned",
            tonnage_kg: 0,
            executions_count: 1,
            rpe_adherence_pct: null,
            has_executions: true,
            exercises: [
                {
                    step_key: "block-1-single-0-r1-S1-S1-1",
                    exercise_id: 16,
                    exercise_name: "Press banca",
                    group_kind: "single_set",
                    prescribed_rpe: null,
                    executions: [
                        {
                            id: 1,
                            training_session_id: 1,
                            session_date: null,
                            session_name: null,
                            exercise_id: 16,
                            exercise_name: "Press banca",
                            step_key: "block-1-single-0-r1-S1-S1-1",
                            set_index: 1,
                            round_index: 1,
                            slot_label: "S1",
                            group_kind: "single_set",
                            weight_kg: null,
                            assistance_kg: null,
                            reps: 10,
                            rpe: null,
                            prescribed_rpe: null,
                            record_status: "registered",
                            performed_at: null,
                        },
                    ],
                },
            ],
        };

        const merged = mergeSessionStructureWithExecutionSummary(view, summary);
        expect(merged.blocks[0].groups[0].slots[0].sets[0].actualWeight).toBeNull();
    });
});
