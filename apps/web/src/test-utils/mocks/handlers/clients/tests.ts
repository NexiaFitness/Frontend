/**
 * Handlers de MSW para GET /physical-tests/results?client_id=:id
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";
import { createMockTestResult } from "@/test-utils/fixtures/clients";

export const getClientTestResultsHandler = http.get("*/physical-tests/results", async ({ request }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const url = new URL(request.url);
    const clientId = Number(url.searchParams.get("client_id"));
    
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    // Retornar array de resultados de tests
    return HttpResponse.json([
        createMockTestResult({ client_id: clientId, id: 1, test_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        createMockTestResult({ client_id: clientId, id: 2 }),
    ], { status: 200 });
});

export const getClientTestResultsEmptyHandler = http.get("*/physical-tests/results", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json([], { status: 200 });
});

export const getClientTestResultsErrorHandler = http.get("*/physical-tests/results", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error fetching test results" },
        { status: 500 }
    );
});

