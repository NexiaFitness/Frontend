/**
 * runReferenceUtils.spec.ts — SIG-06 snapshot en payload execution.
 */

import { describe, expect, it } from "vitest";
import type { AthleteRunSuggestion } from "../../types/athleteRunSuggestion";
import {
    attachSuggestionSnapshotToExecutionPayload,
    buildAthleteRunExecutionPayload,
    buildSuggestionSnapshotFromRunSuggestion,
} from "./runReferenceUtils";

const visibleWeightSuggestion: AthleteRunSuggestion = {
    metric: "weight_kg",
    suggested_value: 42.5,
    reference_value: 40,
    delta: 2.5,
    action: "increase",
    confidence: "high",
    exposure_count: 6,
    explanation: "Sube carga",
    basis_label: "40 kg",
    show_card: true,
};

describe("buildSuggestionSnapshotFromRunSuggestion", () => {
    it("returns undefined when show_card is false", () => {
        expect(
            buildSuggestionSnapshotFromRunSuggestion({
                ...visibleWeightSuggestion,
                show_card: false,
            })
        ).toBeUndefined();
    });

    it("maps visible weight suggestion to SIG-06 snapshot", () => {
        expect(buildSuggestionSnapshotFromRunSuggestion(visibleWeightSuggestion)).toEqual({
            suggestion_shown: true,
            suggested_weight_kg: 42.5,
            reference_weight_kg: 40,
            suggestion_action: "increase",
            load_step_kg: 2.5,
            confidence: "high",
        });
    });

    it("ignores non-weight metrics", () => {
        expect(
            buildSuggestionSnapshotFromRunSuggestion({
                ...visibleWeightSuggestion,
                metric: "rounds",
            })
        ).toBeUndefined();
    });
});

describe("buildAthleteRunExecutionPayload", () => {
    it("omits suggestion_snapshot when suggestion not shown", () => {
        const payload = buildAthleteRunExecutionPayload(
            99,
            {
                stepKey: "SBE:1:S1",
                blockExerciseId: 1,
                exerciseId: 2,
                name: "Curl",
                blockName: "Bloque",
                groupKind: "single_set",
                setLabel: "S1",
                setIndex: 1,
                totalSetsInSlot: 4,
                plannedLabel: "4×10",
                plannedWeight: 20,
                defaultWeight: 20,
                defaultReps: 10,
                restSeconds: 90,
                defaultRpe: 8,
                videoUrl: null,
                loggedSets: 0,
            },
            { weight: 40, reps: 10, rpe: 8 }
        );
        expect(payload.suggestion_snapshot).toBeUndefined();
    });

    it("embeds suggestion_snapshot when card was visible", () => {
        const payload = buildAthleteRunExecutionPayload(
            99,
            {
                stepKey: "SBE:1:S1",
                blockExerciseId: 1,
                exerciseId: 2,
                name: "Curl",
                blockName: "Bloque",
                groupKind: "single_set",
                setLabel: "S1",
                setIndex: 1,
                totalSetsInSlot: 4,
                plannedLabel: "4×10",
                plannedWeight: 20,
                defaultWeight: 20,
                defaultReps: 10,
                restSeconds: 90,
                defaultRpe: 8,
                videoUrl: null,
                loggedSets: 0,
            },
            { weight: 42.5, reps: 10, rpe: 8 },
            visibleWeightSuggestion
        );
        expect(payload.suggestion_snapshot?.suggested_weight_kg).toBe(42.5);
        expect(payload.source).toBe("run_live");
    });
});

describe("attachSuggestionSnapshotToExecutionPayload", () => {
    it("preserves existing fields when attaching snapshot", () => {
        const base = {
            training_session_id: 1,
            step_key: "SBE:1:S1",
            exercise_id: 2,
            weight_kg: 40,
        };
        const next = attachSuggestionSnapshotToExecutionPayload(
            base,
            visibleWeightSuggestion
        );
        expect(next.weight_kg).toBe(40);
        expect(next.suggestion_snapshot?.suggestion_shown).toBe(true);
    });
});
