/**
 * Handlers de MSW para endpoints de autenticación
 * 
 * Este archivo centraliza las respuestas simuladas (mocks) para los tests
 * relacionados con login, registro, forgot-password y reset-password.
 * 
 * Los payloads de respuesta se han alineado con los devueltos por el backend real,
 * para que las pruebas en local reproduzcan fielmente el comportamiento en producción.
 *
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"

export const authHandlers = [
    // Login exitoso
    http.post("*/auth/login", async () => {
        return HttpResponse.json(
            {
                access_token: "fake-token",
                token_type: "bearer",
                user: { id: 1, email: "test@example.com" },
            },
            { status: 200 }
        )
    }),

    // Registro exitoso
    http.post("*/auth/register", async () => {
        return HttpResponse.json(
            {
                message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales.",
            },
            { status: 201 }
        )
    }),

    // Recuperar contraseña (forgot password)
    http.post("*/auth/forgot-password", async () => {
        return HttpResponse.json(
            {
                message: "If the email exists, a reset link has been sent.",
            },
            { status: 200 }
        )
    }),

    // Resetear contraseña (reset password) - éxito
    http.post("*/auth/reset-password", async () => {
        return HttpResponse.json(
            {
                message: "Password reset successful",
            },
            { status: 200 }
        )
    }),

    // Resetear contraseña (reset password) - token inválido
    http.post("*/auth/reset-password-invalid", async () => {
        return HttpResponse.json(
            {
                detail: "Invalid or expired token",
                status_code: 401,
            },
            { status: 401 }
        )
    }),
]
