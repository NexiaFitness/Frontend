import { describe, expect, it } from "vitest";
import { resolveLocalRunReference } from "./localRunReferenceUtils";
import type { LocalSetExecution } from "../../offline/athleteSessionTypes";

const localRow = (
    overrides: Partial<LocalSetExecution> & Pick<LocalSetExecution, "step_key" | "exercise_id">
): LocalSetExecution => ({
    weight_kg: 20,
    reps: 10,
    rpe: 7,
    performed_at: Date.now(),
    ...overrides,
});

describe("resolveLocalRunReference", () => {
    it("returns previous set in same offline session for single_set", () => {
        const ref = resolveLocalRunReference({
            exerciseId: 1,
            setIndex: 2,
            groupKind: "single_set",
            localExecutions: [
                localRow({ step_key: "S1", exercise_id: 1, set_index: 1, weight_kg: 22.5 }),
            ],
        });
        expect(ref?.weight_kg).toBe(22.5);
        expect(ref?.source).toBe("same_session_offline");
    });

    it("returns previous round slot for superset offline", () => {
        const ref = resolveLocalRunReference({
            exerciseId: 1,
            roundIndex: 2,
            slotLabel: "A1",
            groupKind: "superset",
            localExecutions: [
                localRow({
                    step_key: "r1-A1",
                    exercise_id: 1,
                    round_index: 1,
                    slot_label: "A1",
                    weight_kg: 30,
                }),
            ],
        });
        expect(ref?.weight_kg).toBe(30);
    });
});
