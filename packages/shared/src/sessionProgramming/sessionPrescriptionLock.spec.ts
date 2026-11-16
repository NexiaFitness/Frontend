import { describe, expect, it } from "vitest";
import {
    isSessionPrescriptionLocked,
    standaloneExercisesHaveExecutions,
} from "./sessionPrescriptionLock";

describe("isSessionPrescriptionLocked", () => {
    it("deja editable una sesión planned sin registros", () => {
        expect(
            isSessionPrescriptionLocked({
                status: "planned",
                actual_duration: null,
                actual_volume: null,
                actual_intensity: null,
            }),
        ).toBe(false);
    });

    it("bloquea completed e in_progress", () => {
        expect(isSessionPrescriptionLocked({ status: "completed" })).toBe(true);
        expect(isSessionPrescriptionLocked({ status: "in_progress" })).toBe(true);
    });

    it("no bloquea cancelled sin actual_* ni series", () => {
        expect(isSessionPrescriptionLocked({ status: "cancelled" })).toBe(false);
    });

    it("bloquea planned con hasExecutions", () => {
        expect(
            isSessionPrescriptionLocked({
                status: "planned",
                hasExecutions: true,
            }),
        ).toBe(true);
    });

    it("bloquea una suelta completed con el mismo helper", () => {
        expect(
            isSessionPrescriptionLocked({
                status: "completed",
                actual_duration: 40,
            }),
        ).toBe(true);
    });
});

describe("standaloneExercisesHaveExecutions", () => {
    it("es falso sin actual_*", () => {
        expect(
            standaloneExercisesHaveExecutions([
                { actual_sets: null, actual_reps: null },
            ]),
        ).toBe(false);
    });

    it("es verdadero si hay series hechas", () => {
        expect(
            standaloneExercisesHaveExecutions([{ actual_sets: 3 }]),
        ).toBe(true);
    });
});
