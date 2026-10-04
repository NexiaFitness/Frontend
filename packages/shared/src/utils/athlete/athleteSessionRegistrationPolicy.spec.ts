import { describe, expect, it } from "vitest";
import {
    ATHLETE_REGISTRATION_EDIT_DAYS,
    daysAfterSessionDate,
    isAthleteSessionRegistrationEditable,
    resolveAthleteSessionListRegistrationCue,
} from "./athleteSessionRegistrationPolicy";
import type { TrainingSession } from "../../types/trainingSessions";
import type { AthleteRunSessionRegistrationMetaRow } from "../../types/athleteRunProgress";

function session(partial: Partial<TrainingSession>): TrainingSession {
    return {
        id: 1,
        training_plan_id: 1,
        period_block_id: null,
        microcycle_id: null,
        client_id: 1,
        trainer_id: 1,
        session_date: "2026-10-01",
        session_name: "Test",
        session_type: "strength",
        is_generic_session: false,
        planned_duration: 60,
        actual_duration: null,
        planned_intensity: null,
        planned_volume: null,
        actual_intensity: null,
        actual_volume: null,
        status: "planned",
        notes: null,
        created_at: "",
        updated_at: "",
        is_active: true,
        ...partial,
    };
}

describe("athleteSessionRegistrationPolicy", () => {
    const today = new Date(2026, 9, 4); // 4 oct 2026 local

    it("ventana de 7 días inclusive", () => {
        expect(daysAfterSessionDate("2026-09-27", today)).toBe(7);
        expect(isAthleteSessionRegistrationEditable("2026-09-27", today)).toBe(true);
        expect(isAthleteSessionRegistrationEditable("2026-09-26", today)).toBe(false);
        expect(ATHLETE_REGISTRATION_EDIT_DAYS).toBe(7);
    });

    it("cue register_now vs complete vs closed", () => {
        const meta: AthleteRunSessionRegistrationMetaRow = {
            training_session_id: 1,
            session_status: "planned",
            pending_count: 3,
            expected_count: 3,
            registered_count: 0,
            registration_editable: true,
            registration_edit_days: 7,
        };
        expect(
            resolveAthleteSessionListRegistrationCue(
                session({ session_date: "2026-10-01", status: "planned" }),
                meta,
                today
            )
        ).toBe("register_now");

        expect(
            resolveAthleteSessionListRegistrationCue(
                session({ session_date: "2026-10-01", status: "planned" }),
                { ...meta, registered_count: 1, pending_count: 2 },
                today
            )
        ).toBe("complete_registration");

        expect(
            resolveAthleteSessionListRegistrationCue(
                session({ session_date: "2026-09-01", status: "planned" }),
                { ...meta, registration_editable: false },
                today
            )
        ).toBe("registration_closed");
    });
});
