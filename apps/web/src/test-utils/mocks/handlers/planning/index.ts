/**
 * Handlers MSW para endpoints de planificación.
 * Legacy monthly/weekly/daily eliminados en Fase 9.
 *
 * @author Frontend Team
 * @since Fase 7.2
 * @updated v9.0.0 — Eliminados handlers legacy
 */

import { http, HttpResponse } from "msw";
import {
    createMockPlanCoherenceResponse,
    createMockTrainingPlanAlignmentResponse,
} from "@/test-utils/fixtures/planning";

// ----- training-plans/active-by-client/:clientId -----
export const getActivePlanByClientHandler = http.get(
    "*/training-plans/active-by-client/:clientId",
    async ({ params }) => {
        const clientId = Number(params.clientId);
        if (!clientId) return HttpResponse.json({ detail: "Invalid clientId" }, { status: 400 });
        return HttpResponse.json(
            { detail: "No active training plan found for this client" },
            { status: 404 }
        );
    }
);

/** Devuelve 200 con un plan activo (para tests que necesitan "tiene plan"). */
export const getActivePlanByClientWithPlanHandler = (plan: {
    id: number;
    name?: string;
    goal?: string;
    [key: string]: unknown;
}) =>
    http.get("*/training-plans/active-by-client/:clientId", async ({ params }) => {
        const clientId = Number(params.clientId);
        if (!clientId) return HttpResponse.json({ detail: "Invalid clientId" }, { status: 400 });
        return HttpResponse.json(
            {
                ...plan,
                id: plan.id,
                trainer_id: 1,
                client_id: clientId,
                name: plan.name ?? "Plan Test",
                description: null,
                start_date: "2026-01-01",
                end_date: "2026-12-31",
                goal: plan.goal ?? "Strength",
                status: "active",
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                instance_id: 1,
                display_name: plan.name ?? "Plan Test",
                display_goal: plan.goal ?? "Strength",
            },
            { status: 200 }
        );
    });

// ----- training-plans/:planId/coherence -----
export const getTrainingPlanCoherenceHandler = http.get(
    "*/training-plans/:planId/coherence",
    async ({ params }) => {
        const planId = Number(params.planId);
        if (!planId) return HttpResponse.json({ detail: "Invalid planId" }, { status: 400 });
        return HttpResponse.json(
            createMockPlanCoherenceResponse({ plan_id: planId }),
            { status: 200 }
        );
    }
);

// ----- training-plans/:planId/alignment -----
export const getTrainingPlanAlignmentHandler = http.get(
    "*/training-plans/:planId/alignment",
    async ({ params }) => {
        const planId = Number(params.planId);
        if (!planId) return HttpResponse.json({ detail: "Invalid planId" }, { status: 400 });
        return HttpResponse.json(
            createMockTrainingPlanAlignmentResponse({ plan_id: planId }),
            { status: 200 }
        );
    }
);

// ----- training-plans/:planId/period-blocks -----
export const getPeriodBlocksHandler = http.get(
    "*/training-plans/:planId/period-blocks",
    async () => {
        return HttpResponse.json([], { status: 200 });
    }
);

// ----- training-sessions/ (by plan) -----
export const getTrainingSessionsByPlanHandler = http.get(
    "*/training-sessions/",
    async () => {
        return HttpResponse.json([], { status: 200 });
    }
);

// ----- clients/:clientId/day-exceptions -----
export const getDayExceptionsHandler = http.get(
    "*/clients/:clientId/day-exceptions",
    async () => {
        return HttpResponse.json([], { status: 200 });
    }
);

export const planningHandlers = [
    getActivePlanByClientHandler,
    getTrainingPlanCoherenceHandler,
    getTrainingPlanAlignmentHandler,
    getPeriodBlocksHandler,
    getTrainingSessionsByPlanHandler,
    getDayExceptionsHandler,
];
