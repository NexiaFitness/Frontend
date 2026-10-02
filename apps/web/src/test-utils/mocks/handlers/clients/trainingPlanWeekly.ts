/**
 * trainingPlanWeekly.ts — MSW handler GET /clients/:id/training-plan/weekly (D10 overview).
 */

import { http, HttpResponse } from "msw";

const emptyPlannedVsActual = {
    planned_volume: 0,
    actual_volume: 0,
    volume_status: "on_track" as const,
    planned_intensity: 0,
    actual_intensity: 0,
    intensity_status: "on_track" as const,
    qualities: [],
    qualities_comparison_available: false,
};

export const getClientTrainingPlanWeeklySummaryHandler = http.get(
    "*/clients/:clientId/training-plan/weekly",
    ({ params }) => {
        const clientId = Number(params.clientId);
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        const weekStart = monday.toISOString().split("T")[0];
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const weekEnd = sunday.toISOString().split("T")[0];

        return HttpResponse.json(
            {
                client_id: clientId,
                week_start: weekStart,
                week_end: weekEnd,
                has_active_plan: false,
                plan_name: null,
                plan_goal: null,
                distribution: [],
                physical_qualities: [],
                training_load: { volume_level: 0, intensity_level: 0 },
                plan_alignment: 0,
                daily_progression: [],
                planned_vs_actual: emptyPlannedVsActual,
                sessions: [],
                summary: {
                    total_sessions_planned: 0,
                    sessions_completed: 0,
                    sessions_extra_completed: 0,
                    adherence_rate: 0,
                },
            },
            { status: 200 },
        );
    },
);
