/**
 * Handlers de MSW para POST /clients (crear cliente)
 *
 * Alineados con backend FastAPI real.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"

export const createClientHandler = http.post("*/clients", async ({ request }) => {
    await new Promise((res) => setTimeout(res, 100))
    
    try {
        const body = await request.json()
        
        return HttpResponse.json({
            id: 2,
            ...(body as Record<string, unknown>),
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { status: 201 })
    } catch {
        return HttpResponse.json(
            { detail: "Invalid request body" }, 
            { status: 400 }
        )
    }
})

