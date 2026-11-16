import { describe, expect, it } from "vitest";
import { isSessionPrescriptionLocked } from "./sessionPrescriptionLock";

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
});
