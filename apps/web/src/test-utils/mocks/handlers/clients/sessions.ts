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

    return HttpResponse.json([
        createMockTrainingSession({
            id: 1,
            client_id: clientId,
            session_date: yesterday.toISOString().split('T')[0],
            status: "completed",
            actual_duration: 60,
            actual_intensity: 7.5,
            actual_volume: 8,
        }),
        createMockTrainingSession({
            id: 2,
            client_id: clientId,
            session_date: tomorrow.toISOString().split('T')[0],
            status: "scheduled",
        }),
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

