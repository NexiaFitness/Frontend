/**
 * Handlers de MSW para endpoints de logout
 *
 * Alineados con backend FastAPI real usando fixtures corregidas.
 * Incluye handlers básicos + específicos para testing avanzado.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"

// ===== HANDLERS BÁSICOS =====

export const logoutHandler = http.post("*/auth/logout", async () => {
    await new Promise((res) => setTimeout(res, 100)) // Simular delay de logout
    return HttpResponse.json({ message: "Logged out successfully" }, { status: 200 })
})

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

export const logoutErrorHandler = http.post("*/auth/logout", async () => {
    return HttpResponse.json({ detail: "Logout failed" }, { status: 500 })
})

export const logoutTimeoutHandler = http.post("*/auth/logout", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

// ===== LOGOUT HANDLERS PARA REDUX THUNK =====

export const logoutThunkHandler = http.post("*/auth/logout", async () => {
    await new Promise((res) => setTimeout(res, 100))
    return HttpResponse.json({ success: true }, { status: 200 })
})

