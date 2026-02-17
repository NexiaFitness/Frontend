/**
 * Handlers MSW para endpoints de planificación (planning + training-plans coherence/alignment).
 * Usados por PlanningTab, hooks useMonthlyPlan, usePlanningCalendar, useResolvedDay, etc.
 *
 * @author Frontend Team
 * @since Fase 7.2
 */

import { http, HttpResponse } from "msw";
import {
    createMockMonthlyPlan,
    createMockResolvedDayPlan,
    createMockWeeklyOverride,
    createMockDailyOverride,
    createMockPlanCoherenceResponse,
    createMockTrainingPlanAlignmentResponse,
} from "@/test-utils/fixtures/planning";

// ----- planning/monthly -----
export const getMonthlyPlansHandler = http.get("*/planning/monthly", async ({ request }) => {
    const url = new URL(request.url);
    const training_plan_id = url.searchParams.get("training_plan_id");
    const client_id = url.searchParams.get("client_id");
    if (!training_plan_id && !client_id) {
        return HttpResponse.json(
            { detail: "Either training_plan_id or client_id must be provided" },
            { status: 400 }
        );
    }
    const month = url.searchParams.get("month");
    const planId = training_plan_id ? Number(training_plan_id) : null;
    const clientId = client_id ? Number(client_id) : null;
    const list = month
        ? [createMockMonthlyPlan({ id: 1, training_plan_id: planId, client_id: clientId, month })]
        : [createMockMonthlyPlan({ id: 1, training_plan_id: planId, client_id: clientId })];
    return HttpResponse.json(list, { status: 200 });
});

export const getMonthlyPlanHandler = http.get(
    "*/planning/monthly/:id",
    async ({ params }) => {
        const id = Number(params.id);
        if (!id) return HttpResponse.json({ detail: "Invalid id" }, { status: 400 });
        return HttpResponse.json(createMockMonthlyPlan({ id }), { status: 200 });
    }
);

export const createMonthlyPlanHandler = http.post("*/planning/monthly", async ({ request }) => {
    const body = (await request.json()) as {
        training_plan_id?: number | null;
        client_id?: number | null;
        month: string;
    };
    return HttpResponse.json(
        createMockMonthlyPlan({
            id: 2,
            training_plan_id: body.training_plan_id ?? null,
            client_id: body.client_id ?? null,
            month: body.month,
        }),
        { status: 201 }
    );
});

export const updateMonthlyPlanHandler = http.put(
    "*/planning/monthly/:id",
    async ({ params }) => {
        const id = Number(params.id);
        if (!id) return HttpResponse.json({ detail: "Invalid id" }, { status: 400 });
        return HttpResponse.json(createMockMonthlyPlan({ id }), { status: 200 });
    }
);

export const deleteMonthlyPlanHandler = http.delete(
    "*/planning/monthly/:id",
    async ({ params }) => {
        const id = Number(params.id);
        if (!id) return HttpResponse.json({ detail: "Invalid id" }, { status: 400 });
        return new HttpResponse(null, { status: 204 });
    }
);

// ----- planning/resolve-day -----
export const getResolvedDayHandler = http.get(
    "*/planning/resolve-day/:client_id/:date",
    async ({ params }) => {
        const client_id = Number(params.client_id);
        const date = String(params.date);
        if (!client_id || !date) {
            return HttpResponse.json({ detail: "client_id and date required" }, { status: 400 });
        }
        return HttpResponse.json(
            createMockResolvedDayPlan({ date, source: "month" }),
            { status: 200 }
        );
    }
);

// ----- planning/calendar -----
export const getPlanningCalendarHandler = http.get(
    "*/planning/calendar/:client_id/:month",
    async ({ params }) => {
        const client_id = Number(params.client_id);
        const month = String(params.month);
        if (!client_id || !month) {
            return HttpResponse.json({ detail: "client_id and month required" }, { status: 400 });
        }
        const days: ReturnType<typeof createMockResolvedDayPlan>[] = [];
        const [y, m] = month.split("-").map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const date = `${month}-${String(d).padStart(2, "0")}`;
            days.push(createMockResolvedDayPlan({ date, source: "month" }));
        }
        return HttpResponse.json(days, { status: 200 });
    }
);

// ----- planning/weekly -----
export const getWeeklyOverridesHandler = http.get("*/planning/weekly", async ({ request }) => {
    const url = new URL(request.url);
    const monthly_plan_id = url.searchParams.get("monthly_plan_id");
    if (!monthly_plan_id) {
        return HttpResponse.json({ detail: "monthly_plan_id required" }, { status: 400 });
    }
    return HttpResponse.json(
        [createMockWeeklyOverride({ monthly_plan_id: Number(monthly_plan_id) })],
        { status: 200 }
    );
});

export const createWeeklyOverrideHandler = http.post("*/planning/weekly", async () => {
    return HttpResponse.json(createMockWeeklyOverride({ id: 2 }), { status: 201 });
});

export const deleteWeeklyOverrideHandler = http.delete(
    "*/planning/weekly/:id",
    async ({ params }) => {
        const id = Number(params.id);
        if (!id) return HttpResponse.json({ detail: "Invalid id" }, { status: 400 });
        return new HttpResponse(null, { status: 204 });
    }
);

// ----- planning/daily -----
export const getDailyOverridesHandler = http.get("*/planning/daily", async ({ request }) => {
    const url = new URL(request.url);
    const client_id = url.searchParams.get("client_id");
    if (!client_id) {
        return HttpResponse.json({ detail: "client_id required" }, { status: 400 });
    }
    return HttpResponse.json(
        [createMockDailyOverride({ client_id: Number(client_id) })],
        { status: 200 }
    );
});

export const createDailyOverrideHandler = http.post("*/planning/daily", async () => {
    return HttpResponse.json(createMockDailyOverride({ id: 2 }), { status: 201 });
});

export const deleteDailyOverrideHandler = http.delete(
    "*/planning/daily/:id",
    async ({ params }) => {
        const id = Number(params.id);
        if (!id) return HttpResponse.json({ detail: "Invalid id" }, { status: 400 });
        return new HttpResponse(null, { status: 204 });
    }
);

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

export const planningHandlers = [
    getMonthlyPlansHandler,
    getMonthlyPlanHandler,
    createMonthlyPlanHandler,
    updateMonthlyPlanHandler,
    deleteMonthlyPlanHandler,
    getResolvedDayHandler,
    getPlanningCalendarHandler,
    getWeeklyOverridesHandler,
    createWeeklyOverrideHandler,
    deleteWeeklyOverrideHandler,
    getDailyOverridesHandler,
    createDailyOverrideHandler,
    deleteDailyOverrideHandler,
    getTrainingPlanCoherenceHandler,
    getTrainingPlanAlignmentHandler,
];
