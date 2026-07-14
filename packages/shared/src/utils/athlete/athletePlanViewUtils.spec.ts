import { describe, expect, it } from "vitest";
import {
    athleteLoadBarPercent,
    buildAthletePlanActiveBlockCopy,
    buildAthletePlanMonthTimeline,
    cleanAthletePlanDisplayName,
    formatAthleteLoadLevel,
} from "./athletePlanViewUtils";
import type {
    ClientTrainingPlanSummary,
    TrainingPlanMonthlySummary,
} from "../../types/trainingAnalytics";

function baseSummary(): ClientTrainingPlanSummary {
    return {
        client_id: 1,
        year: 2026,
        has_active_plan: true,
        plan_name: "QA Semana actual — Diana",
        plan_goal: "strength",
        distribution: [{ name: "General", percentage: 100 }],
        physical_qualities: [{ name: "General", percentage: 100 }],
        training_load: { volume_level: 0, intensity_level: 0 },
        yearly_progression: [
            { month: 6, qualities: [], volume_level: 5, intensity_level: 6 },
        ],
        summary: {
            total_sessions_planned: 27,
            sessions_completed: 27,
            adherence_rate: 100,
        },
        milestones: [],
    };
}

describe("athletePlanViewUtils", () => {
    it("limpia sufijo del nombre de plan", () => {
        expect(cleanAthletePlanDisplayName("QA Semana actual — Diana")).toBe(
            "QA Semana actual"
        );
    });

    it("formatea carga sin dato cuando es 0", () => {
        expect(formatAthleteLoadLevel(0)).toBe("Sin dato");
        expect(formatAthleteLoadLevel(7.2)).toBe("7/10");
    });

    it("construye copy del bloque activo con coherencia mensual", () => {
        const monthly: TrainingPlanMonthlySummary = {
            client_id: 1,
            year: 2026,
            month: 6,
            has_active_plan: true,
            plan_name: "QA",
            plan_goal: "strength",
            distribution: [],
            physical_qualities: [],
            training_load: { volume_level: 7, intensity_level: 6 },
            plan_alignment: 82,
            planned_vs_actual: {
                planned_volume: 7,
                actual_volume: 6,
                volume_status: "on_track",
                planned_intensity: 6,
                actual_intensity: 6,
                intensity_status: "on_track",
                qualities: [],
            },
            weeks: [{ week: 1, qualities: [], volume_level: 7, intensity_level: 6 }],
            summary: {
                total_sessions_planned: 4,
                sessions_completed: 3,
                adherence_rate: 75,
            },
        };

        const copy = buildAthletePlanActiveBlockCopy(
            baseSummary(),
            monthly,
            new Date(2026, 5, 18)
        );

        expect(copy.planTitle).toBe("QA Semana actual");
        expect(copy.coherencePercent).toBe(82);
        expect(copy.volumeLevel).toBe(7);
        expect(copy.weekLabel).toBe("Semana 1 de 1");
    });

    it("marca mes actual en timeline anual", () => {
        const timeline = buildAthletePlanMonthTimeline(
            [
                { month: 5, qualities: [], volume_level: 4, intensity_level: 5 },
                { month: 6, qualities: [], volume_level: 6, intensity_level: 7 },
            ],
            new Date(2026, 5, 1)
        );

        expect(timeline[1]?.isCurrent).toBe(true);
        expect(timeline[1]?.label).toBe("jun");
    });

    it("calcula porcentaje de barra de carga", () => {
        expect(athleteLoadBarPercent(0)).toBe(0);
        expect(athleteLoadBarPercent(7)).toBe(70);
    });
});
