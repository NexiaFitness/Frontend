/**
 * Handlers de MSW para endpoints de autenticación
 * Centraliza respuestas de éxito y error para los tests
 *
 * @since v1.0.0
 */
import { http, HttpResponse } from "msw"

export const authHandlers = [
    // Login exitoso (por defecto)
    http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
        return HttpResponse.json({
            access_token: "fake-token",
            user: { id: 1, email: "test@example.com" },
        })
    }),

    // Registro exitoso
    http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
        return HttpResponse.json(
            { message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales." },
            { status: 201 }
        )
    }),

    // Recuperar contraseña
    http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
        return HttpResponse.json(
            { message: "Se ha enviado un correo para restablecer tu contraseña." },
            { status: 200 }
        )
    }),
]
