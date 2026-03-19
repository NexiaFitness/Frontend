/**
 * Handlers de MSW para GET /clients/:id/coherence (coherencia diaria)
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";
import { createMockCoherenceData } from "@/test-utils/fixtures/clients";

export const getClientCoherenceHandler = http.get("*/clients/:id/coherence", async ({ params }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const clientId = Number(params.id);
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    return HttpResponse.json(createMockCoherenceData({ client_id: clientId }), { status: 200 });
});

export const getClientCoherenceErrorHandler = http.get("*/clients/:id/coherence", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error fetching coherence data" },
        { status: 500 }
    );
});

export const getClientCoherenceEmptyHandler = http.get("*/clients/:id/coherence", async ({ params }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const clientId = Number(params.id);
    return HttpResponse.json(
        createMockCoherenceData({
            client_id: clientId,
            kpis: {
                adherence_percentage: 0,
                average_srpe: 0,
                monotony: 0,
                strain: 0,
            },
            adherence_data: [],
            srpe_scatter_data: [],
            monotony_strain_data: [],
            interpretive_summary: "",
            key_recommendations: [],
        }),
        { status: 200 }
    );
});

