/**
 * Handlers de MSW para endpoints de progreso
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";
import { createMockProgress, createMockProgressAnalytics } from "@/test-utils/fixtures/clients";

// GET /progress/?client_id=:id
export const getClientProgressHistoryHandler = http.get("*/progress/", async ({ request }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const url = new URL(request.url);
    const clientId = Number(url.searchParams.get("client_id"));
    
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    // Retornar array de progreso
    return HttpResponse.json([
        createMockProgress({ client_id: clientId, fecha_registro: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        createMockProgress({ client_id: clientId, id: 2 }),
    ], { status: 200 });
});

export const getClientProgressHistoryEmptyHandler = http.get("*/progress/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json([], { status: 200 });
});

export const getClientProgressHistoryErrorHandler = http.get("*/progress/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error fetching progress history" },
        { status: 500 }
    );
});

// GET /progress/analytics/:id
export const getProgressAnalyticsHandler = http.get("*/progress/analytics/:id", async ({ params }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const clientId = Number(params.id);
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    return HttpResponse.json(createMockProgressAnalytics({ client_id: clientId }), { status: 200 });
});

export const getProgressAnalyticsErrorHandler = http.get("*/progress/analytics/:id", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error fetching progress analytics" },
        { status: 500 }
    );
});

// Helper function para crear un registro de progreso (reutilizable en tests)
export const createProgressRecordFromRequest = async (request: Request) => {
    await new Promise((res) => setTimeout(res, 100));
    
    try {
        const body = await request.json() as { client_id: number; fecha_registro: string; peso?: number; altura?: number; unidad?: string; notas?: string | null };
        
        return HttpResponse.json(
            createMockProgress({
                client_id: body.client_id,
                fecha_registro: body.fecha_registro,
                peso: body.peso ?? null,
                altura: body.altura ?? null,
                unidad: body.unidad ?? "metric",
                notas: body.notas ?? null,
            }),
            { status: 201 }
        );
    } catch {
        return HttpResponse.json(
            { detail: "Invalid request body" },
            { status: 400 }
        );
    }
};

// POST /progress/
export const createProgressRecordHandler = http.post("*/progress/", async ({ request }) => {
    return createProgressRecordFromRequest(request);
});

export const createProgressRecordErrorHandler = http.post("*/progress/", async () => {
    await new Promise((res) => setTimeout(res, 100));
    return HttpResponse.json(
        { detail: "Error creating progress record" },
        { status: 500 }
    );
});

