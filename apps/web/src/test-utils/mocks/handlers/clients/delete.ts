/**
 * Handlers de MSW para DELETE /clients/:id (eliminar cliente)
 *
 * Alineados con backend FastAPI real.
 * Incluye handlers básicos + específicos para testing avanzado.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"

// ===== HANDLER BÁSICO =====

export const deleteClientHandler = http.delete("https://nexiaapp.com/api/v1/clients/1", async () => {
    await new Promise((res) => setTimeout(res, 100)) // Simular delay de eliminación
    
    // Simular eliminación exitosa
    return HttpResponse.json(
        { message: "Client deleted successfully" }, 
        { status: 200 }
    )
})

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

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

