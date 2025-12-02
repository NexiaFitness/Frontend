/**
 * Handlers de MSW para GET /clients (lista de clientes)
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"
import { createMockClient } from "@/test-utils/fixtures/clients"

export const getClientsHandler = http.get("*/clients", async () => {
    await new Promise((res) => setTimeout(res, 50))
    
    return HttpResponse.json({
        clients: [
            {
                id: 1,
                mail: "client@test.com",
                nombre: "Test Client",
                objetivo_entrenamiento: "muscle_gain",
                is_active: true,
                created_at: "2023-01-01",
                updated_at: "2023-01-01"
            }
        ],
        total: 1,
        page: 1,
        limit: 10
    }, { status: 200 })
})

// GET /clients/:id
export const getClientHandler = http.get("*/clients/:id", async ({ params }) => {
    await new Promise((res) => setTimeout(res, 100));
    
    const clientId = Number(params.id);
    if (!clientId || clientId <= 0) {
        return HttpResponse.json(
            { detail: "Invalid client ID" },
            { status: 400 }
        );
    }

    return HttpResponse.json(createMockClient({ id: clientId }), { status: 200 });
});

