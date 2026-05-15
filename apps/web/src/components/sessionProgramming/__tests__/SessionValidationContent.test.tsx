/**
 * SessionValidationContent.test.tsx — Test mínimo de presentación pura
 *
 * @author Frontend Team
 * @since v6.5.0 — Fase A review page
 */

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { SessionValidationContent } from "../SessionValidationContent";
import type { SessionValidationOut } from "@nexia/shared/types/sessionValidation";

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
        exercises_breakdown: [{ exercise_id: 10, exercise_name: "Press banca", axial_load: "moderada", score: 40 }],
    },
    safety_summary: {
        total_checks: 2,
        blocking_count: 1,
        warning_count: 1,
        safe_count: 0,
        details: [
            { is_safe: false, blocking: true, reason: "Contraindicación rodilla", suggested_alternatives: [] },
            { is_safe: false, blocking: false, reason: "Precaución hombro", suggested_alternatives: [] },
        ],
    },
};

describe("SessionValidationContent", () => {
    it("muestra spinner durante carga", () => {
        render(<SessionValidationContent data={null} isLoading error={null} />);
        expect(screen.getByRole("status", { name: /cargando/i })).toBeInTheDocument();
    });

    it("renderiza secciones cuando hay datos", () => {
        render(<SessionValidationContent data={basePayload} isLoading={false} error={null} />);
        expect(screen.getByText("Patrones de movimiento")).toBeInTheDocument();
        expect(screen.getByText("Volumen")).toBeInTheDocument();
        expect(screen.getByText("Carga axial")).toBeInTheDocument();
        expect(screen.getByText("Seguridad")).toBeInTheDocument();
    });
});
