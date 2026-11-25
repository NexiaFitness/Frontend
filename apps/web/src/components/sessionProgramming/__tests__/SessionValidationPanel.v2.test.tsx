/**
 * SessionValidationPanel.v2.test.tsx — Secciones Carga axial y Seguridad (Fase 4 engine).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { SessionValidationPanel } from "../SessionValidationPanel";
import type { SessionValidationOut } from "@nexia/shared/types/sessionValidation";

const useValidateSessionMutation = vi.fn();

vi.mock("@nexia/shared/api/sessionValidationApi", () => ({
    useValidateSessionMutation: () => useValidateSessionMutation(),
}));

const basePayload: SessionValidationOut = {
    training_session_id: 99,
    period_block_id: 1,
    overall_status: "aligned",
    version: "v1",
    disclaimers: [],
    patterns: {
        status: "aligned",
        expected: ["empuje"],
        actual: ["empuje"],
        missing: [],
        extra: [],
    },
    volume: {
        status: "aligned",
        muscle_groups: [
            {
                muscle_group_id: 1,
                name_es: "Pecho",
                weekly_target: 12,
                daily_expected: 4,
                actual_sets: 4,
                deviation_percent: 0,
            },
        ],
    },
    qualities: null,
    intensity: null,
    axial_score: {
        total_score: 40,
        threshold: 100,
        exceeds_threshold: false,
        exercises_count: 1,
        exercises_breakdown: [{ exercise_id: 10, exercise_name: "Press banca", axial_load: "moderada", score: 40, verifiable: true }], unverifiable_count: 0,
    },
    safety_summary: {
        total_checks: 2,
        blocking_count: 0,
        warning_count: 1,
        safe_count: 0, unverifiable_count: 0,
        details: [
            {
                is_safe: false,
                status: "exceeds_limit",
                blocking: false,
                severity: "warning",
                reason: "Supera el tope de carga axial (Media).",
                suggested_alternatives: [],
            },
            {
                is_safe: false,
                status: "unsafe",
                blocking: false,
                reason: "Precaución hombro",
                suggested_alternatives: [],
            },
        ],
    },
};

describe("SessionValidationPanel — axial y seguridad", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useValidateSessionMutation.mockReturnValue([
            vi.fn(),
            { isLoading: false, data: basePayload, error: undefined },
        ]);
    });

    it("muestra Carga axial al expandir y umbral coherente con axial_score", async () => {
        const user = userEvent.setup();
        render(
            <SessionValidationPanel trainingSessionId={42} isOpen={true} onClose={vi.fn()} />
        );

        await screen.findByText("Validación de sesión");
        const axialToggle = screen.getByRole("button", { name: /^Carga axial/i });
        await user.click(axialToggle);

        expect(await screen.findByText("Dentro del umbral")).toBeInTheDocument();
        expect(screen.getByText("40 / 100")).toBeInTheDocument();
        expect(screen.getByText("Press banca")).toBeInTheDocument();
    });

    it("H11: muestra Seguridad al expandir: sobre el tope + advertencia, sin bloqueos", async () => {
        const user = userEvent.setup();
        render(
            <SessionValidationPanel trainingSessionId={42} isOpen={true} onClose={vi.fn()} />
        );

        await screen.findByText("Validación de sesión");

        const safetyToggle = screen.getByRole("button", { name: "Seguridad2 con hallazgo" });
        await user.click(safetyToggle);

        expect(screen.queryByText(/bloque/i)).not.toBeInTheDocument();
        expect(screen.getByText("Sobre el tope")).toBeInTheDocument();
        expect(screen.getByText("Superan el tope de carga axial")).toBeInTheDocument();
        expect(screen.getByText("Supera el tope de carga axial (Media).")).toBeInTheDocument();
        expect(screen.getAllByText("Advertencias").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Precaución hombro")).toBeInTheDocument();
    });
});
