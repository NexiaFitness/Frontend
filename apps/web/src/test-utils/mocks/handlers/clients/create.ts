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

/**
 * Handler para error 500 al crear cliente
 */
export const createClientErrorHandler = http.post("*/clients", async () => {
    await new Promise((res) => setTimeout(res, 100))
    
    return HttpResponse.json(
        { detail: "Error creating client" },
        { status: 500 }
    )
})

/**
 * Handler para error de validación 422 al crear cliente
 */
export const createClientValidationErrorHandler = http.post("*/clients", async () => {
    await new Promise((res) => setTimeout(res, 100))
    
    return HttpResponse.json(
        {
            detail: [
                {
                    loc: ["body", "mail"],
                    msg: "value is not a valid email address",
                    type: "value_error.email"
                }
            ]
        },
        { status: 422 }
    )
})

/**
 * Handler para timeout al crear cliente
 */
export const createClientTimeoutHandler = http.post("*/clients", async () => {
    await new Promise((res) => setTimeout(res, 150))
    return new Response(null, { status: 408 })
})

/**
 * Handler para error de red al crear cliente
 */
export const createClientNetworkErrorHandler = http.post("*/clients", async () => {
    return HttpResponse.error()
})

