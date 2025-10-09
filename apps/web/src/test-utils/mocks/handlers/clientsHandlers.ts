/**
 * Handlers de MSW para endpoints de clientes
 *
 * Alineados con backend FastAPI real.
 * Incluye handlers para CRUD de clientes.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"

// ===== CLIENTS HANDLERS =====

export const deleteClientHandler = http.delete("https://nexiaapp.com/api/v1/clients/1", async () => {
    await new Promise((res) => setTimeout(res, 100)) // Simular delay de eliminación
    
    // Simular eliminación exitosa
    return HttpResponse.json(
        { message: "Client deleted successfully" }, 
        { status: 200 }
    )
})

export const deleteClientErrorHandler = http.delete("*/clients/:id", async () => {
    return HttpResponse.json(
        { detail: "Client not found" }, 
        { status: 404 }
    )
})

export const deleteClientTimeoutHandler = http.delete("*/clients/:id", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const getClientsHandler = http.get("*/clients", async () => {
    await new Promise((res) => setTimeout(res, 50))
    
    return HttpResponse.json({
        clients: [
            {
                id: 1,
                email: "client@test.com",
                nombre: "Test Client",
                objetivo: "muscle_gain",
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
