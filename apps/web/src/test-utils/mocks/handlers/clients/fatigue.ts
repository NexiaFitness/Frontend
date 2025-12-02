/**
 * Handlers de MSW para GET /fatigue/clients/:id/fatigue-analysis/
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";
import { createMockFatigueAnalysis } from "@/test-utils/fixtures/clients";

export const getClientFatigueAnalysisHandler = http.get("*/fatigue/clients/:id/fatigue-analysis/", async ({ params }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const clientId = Number(params.id);
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    // Retornar array de análisis de fatiga
    return HttpResponse.json([
        createMockFatigueAnalysis({ client_id: clientId, id: 1, analysis_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        createMockFatigueAnalysis({ client_id: clientId, id: 2 }),
    ], { status: 200 });
});

export const getClientFatigueAnalysisEmptyHandler = http.get("*/fatigue/clients/:id/fatigue-analysis/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json([], { status: 200 });
});

export const getClientFatigueAnalysisErrorHandler = http.get("*/fatigue/clients/:id/fatigue-analysis/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error fetching fatigue analysis" },
        { status: 500 }
    );
});

