/**
 * Handlers de MSW para endpoints de autenticación
 * 
 * Alineados con backend FastAPI real usando fixtures corregidas.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";
import {
    loginSuccessResponse,
    registerSuccessResponse,
    forgotPasswordSuccessResponse,
    errorResponses
} from "../../fixtures/authFixtures";

export const authHandlers = [
    // Login - Handler dinámico con tipo seguro
    http.post("*/auth/login", async ({ request }) => {
        try {
            const body = await request.text();
            
            // Simular error para credenciales específicas de test
            if (body.includes("invalid@test.com") || body.includes("wrongpass")) {
                return HttpResponse.json(errorResponses.invalidLogin, { status: 400 });
            }
            
            // Por defecto, respuesta exitosa
            return HttpResponse.json(loginSuccessResponse, { status: 200 });
        } catch (error) {
            return HttpResponse.json(errorResponses.invalidLogin, { status: 400 });
        }
    }),

    // Register - Handler dinámico con tipo seguro
    http.post("*/auth/register", async ({ request }) => {
        try {
            const body = await request.json() as { email?: string };
            
            // Simular email ya registrado para emails específicos de test
            if (body?.email === "existing@test.com") {
                return HttpResponse.json(errorResponses.emailAlreadyExists, { status: 409 });
            }
            
            // Por defecto, respuesta exitosa
            return HttpResponse.json(registerSuccessResponse, { status: 201 });
        } catch (error) {
            return HttpResponse.json(errorResponses.emailAlreadyExists, { status: 400 });
        }
    }),

    // Forgot password
    http.post("*/auth/forgot-password", async () => {
        return HttpResponse.json(forgotPasswordSuccessResponse, { status: 200 });
    }),

    // Reset password - Handler dinámico con tipo seguro
    http.post("*/auth/reset-password", async ({ request }) => {
        try {
            const body = await request.json() as { token?: string };
            
            // Simular token inválido para tokens específicos de test
            if (body?.token === "invalid-token") {
                return HttpResponse.json(errorResponses.invalidResetToken, { status: 400 });
            }
            
            // Por defecto, respuesta exitosa
            return HttpResponse.json({
                message: "Password has been reset successfully."
            }, { status: 200 });
        } catch (error) {
            return HttpResponse.json(errorResponses.invalidResetToken, { status: 400 });
        }
    }),
];