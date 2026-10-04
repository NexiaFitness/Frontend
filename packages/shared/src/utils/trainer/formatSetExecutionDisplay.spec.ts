import { describe, expect, it } from "vitest";
import { formatSetExecutionLine } from "./formatSetExecutionDisplay";
import type { ClientSetExecutionRow } from "../../types/trainerSetExecutions";

function row(partial: Partial<ClientSetExecutionRow>): ClientSetExecutionRow {
    return {
        id: 1,
        training_session_id: 1,
        session_date: null,
        session_name: null,
        exercise_id: 1,
        exercise_name: "Test",
        step_key: "k",
        set_index: 1,
        round_index: 1,
        slot_label: "S1",
        group_kind: "single_set",
        weight_kg: null,
        assistance_kg: null,
        reps: null,
        rpe: null,
        prescribed_rpe: null,
        performed_at: null,
        ...partial,
    };
}

describe("formatSetExecutionLine", () => {
    it("distingue pendiente, no realizado y registrado", () => {
        expect(formatSetExecutionLine(row({ record_status: "pending" }))).toBe(
            "Pendiente"
        );
        expect(
            formatSetExecutionLine(row({ record_status: "not_performed" }))
        ).toBe("No realizado");
        expect(
            formatSetExecutionLine(
                row({ weight_kg: 50, reps: 8, record_status: "registered" })
            )
        ).toBe("50 kg  × 8"); // kg + reps
    });

    it("muestra reps sin kg (4452 plancha)", () => {
        expect(
            formatSetExecutionLine(row({ reps: 10, record_status: "registered" }))
        ).toBe("10 reps");
    });
});
