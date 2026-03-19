/**
 * Handlers MSW para endpoints de lesiones (injuries).
 * Usados por ClientOverviewTab (useClientInjuries), formularios de lesiones, etc.
 *
 * Endpoints: joints, muscles, clients/:id, clients/:id?active_only=true
 *
 * @author Frontend Team
 * @since Fase 7.2 (estabilidad tests)
 */

import { http, HttpResponse } from "msw";

const now = new Date().toISOString().slice(0, 19).replace("T", " ");

// GET /injuries/joints
export const getJointsHandler = http.get("*/injuries/joints", async () => {
    return HttpResponse.json(
        [
            { id: 1, name: "Hombro", description: null, created_at: now, updated_at: now },
            { id: 2, name: "Rodilla", description: null, created_at: now, updated_at: now },
        ],
        { status: 200 }
    );
});

// GET /injuries/muscles (con o sin query joint_id)
export const getMusclesHandler = http.get("*/injuries/muscles", async () => {
    return HttpResponse.json(
        [
            { id: 1, name: "Deltoides", joint_id: 1, description: null, created_at: now, updated_at: now },
            { id: 2, name: "Cuádriceps", joint_id: 2, description: null, created_at: now, updated_at: now },
        ],
        { status: 200 }
    );
});

// GET /injuries/clients/:clientId y GET /injuries/clients/:clientId?active_only=true
export const getClientInjuriesHandler = http.get(
    "*/injuries/clients/:clientId",
    async ({ params }) => {
        const clientId = Number(params.clientId);
        if (!clientId || clientId <= 0) {
            return HttpResponse.json({ detail: "Invalid client ID" }, { status: 400 });
        }
        return HttpResponse.json([], { status: 200 });
    }
);

export const injuriesHandlers = [
    getJointsHandler,
    getMusclesHandler,
    getClientInjuriesHandler,
];
