import { describe, expect, it } from "vitest";
import { buildPostSessionSharePayload } from "./athleteSessionShareCopy";
import type { PostSessionReport } from "../../types/trainingSessions";

function baseReport(overrides: Partial<PostSessionReport> = {}): PostSessionReport {
    return {
        session_id: 1,
        session_name: "Pierna A",
        status: "completed",
        session_date: "2026-06-17",
        planned_duration: 60,
        actual_duration: 52,
        total_planned_sets: 20,
        total_actual_sets: 18,
        completion_percentage: 85,
        planned_volume: null,
        actual_volume: null,
        planned_intensity: null,
        actual_intensity: null,
        exercises: [],
        has_feedback: false,
        highlights: ["Superaste press banca +2.5 kg"],
        ...overrides,
    };
}

describe("buildPostSessionSharePayload", () => {
    it("includes session name, compliance and series", () => {
        const { title, text } = buildPostSessionSharePayload(baseReport());

        expect(title).toBe("Mi entrenamiento — Pierna A");
        expect(text).toContain("Sesión completada — Pierna A");
        expect(text).toContain("Cumplimiento: 85%");
        expect(text).toContain("18/20 series");
    });

    it("uses blocks label and timed result lines (B-26)", () => {
        const { text } = buildPostSessionSharePayload(
            baseReport({
                completion_units_label: "blocks",
                total_actual_sets: 3,
                total_planned_sets: 3,
                timed_blocks: [
                    {
                        session_block_id: 10,
                        timed_mode: "amrap",
                        mode_label: "AMRAP",
                        result_label: "5 rondas + 12 repeticiones",
                        objective_label: "Objetivo: 5 rondas",
                        exercise_names: ["Curl A"],
                    },
                ],
            })
        );

        expect(text).toContain("3/3 bloques");
        expect(text).toContain("AMRAP: 5 rondas + 12 repeticiones (Objetivo: 5 rondas)");
    });

    it("includes date, duration and highlights when present", () => {
        const { text } = buildPostSessionSharePayload(baseReport());

        expect(text).toContain("📅");
        expect(text).toContain("⏱ 52 min");
        expect(text).toContain("• Superaste press banca +2.5 kg");
        expect(text).toContain("— NEXIA Fitness");
    });

    it("omits optional lines when data missing", () => {
        const { text } = buildPostSessionSharePayload(
            baseReport({
                session_date: null,
                actual_duration: null,
                highlights: [],
                timed_blocks: [],
            })
        );

        expect(text).not.toContain("📅");
        expect(text).not.toContain("⏱");
        expect(text).not.toContain("•");
    });

    it("caps highlights at three", () => {
        const { text } = buildPostSessionSharePayload(
            baseReport({
                highlights: ["A", "B", "C", "D"],
            })
        );

        expect(text).toContain("• A");
        expect(text).toContain("• C");
        expect(text).not.toContain("• D");
    });
});
