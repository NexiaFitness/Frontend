/**
 * Handlers de MSW para GET /training-sessions/?client_id=:id
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";
import { createMockTrainingSession } from "@/test-utils/fixtures/clients";

export const getClientTrainingSessionsHandler = http.get("*/training-sessions/", async ({ request }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const url = new URL(request.url);
    const clientId = Number(url.searchParams.get("client_id"));
    
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    // Crear sesiones: una pasada (completed) y una futura (scheduled)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const s1 = createMockTrainingSession({
        id: 1,
        client_id: clientId,
        session_date: yesterday.toISOString().split('T')[0],
        status: "completed",
        actual_duration: 60,
        actual_intensity: 7.5,
        actual_volume: 8,
    });
    const s2 = createMockTrainingSession({
        id: 2,
        client_id: clientId,
        session_date: tomorrow.toISOString().split('T')[0],
        status: "scheduled",
    });
    return HttpResponse.json([
        { ...s1, training_plan_id: 1 },
        { ...s2, training_plan_id: 1 },
    ], { status: 200 });
});

export const getClientTrainingSessionsEmptyHandler = http.get("*/training-sessions/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json([], { status: 200 });
});

export const getClientTrainingSessionsErrorHandler = http.get("*/training-sessions/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error fetching training sessions" },
        { status: 500 }
    );
});

/** GET /training-sessions/:id/coherence — usado por WeekViewGrid CoherenceBadge */
export const getSessionCoherenceHandler = http.get(
    "*/training-sessions/:id/coherence",
    async ({ params }) => {
        const id = Number(params.id);
        if (!id) return HttpResponse.json({ detail: "Invalid session id" }, { status: 400 });
        return HttpResponse.json(
            {
                session_id: id,
                has_planned_values: true,
                session_has_values: true,
                planned_volume: 8,
                planned_intensity: 7,
                session_volume: 8,
                session_intensity: 7,
                volume_deviation: 0,
                intensity_deviation: 0,
                coherence_percentage: 85,
                coherence_warnings: [],
            },
            { status: 200 }
        );
    }
);
