/**
 * Handlers de MSW para endpoints de login
 *
 * Alineados con backend FastAPI real usando fixtures corregidas.
 * Incluye handlers básicos + específicos para testing avanzado.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"
import {
    loginSuccessResponse,
    errorResponses,
} from "../../../fixtures/auth"

// ===== HANDLER BÁSICO =====

export const loginHandler = http.post("*/auth/login", async ({ request }) => {
    await new Promise((res) => setTimeout(res, 300)) // simular red lenta

    let body: { username?: string; password?: string } = {}
    const contentType = request.headers.get("Content-Type")

    try {
        if (contentType?.includes("application/json")) {
            body = (await request.json()) as { username?: string; password?: string }
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
            // MSW necesita que el body se lea como string primero
            const text = await request.text()
            const params = new URLSearchParams(text)
            body = {
                username: params.get("username") || undefined,
                password: params.get("password") || undefined,
            }
        }
    } catch {
        return HttpResponse.json(errorResponses.invalidLogin, { status: 400 })
    }

    // Validación de email format (para test "displays server validation errors")
    if (body.username === "valid@email.com") {
        return HttpResponse.json({ detail: "Email format is invalid" }, { status: 422 })
    }

    // Credenciales inválidas (fixture)
    if (body.username === "invalid@test.com" && body.password === "wrongpass") {
        return HttpResponse.json(errorResponses.invalidLogin, { status: 401 })
    }

    // Credenciales válidas (fixture)
    if (body.username === "test@example.com" && body.password === "testpass123") {
        return HttpResponse.json(loginSuccessResponse, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    }

    // Por defecto → error
    return HttpResponse.json(errorResponses.invalidLogin, { status: 401 })
})

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

export const loginRetryHandler = (() => {
    let attempts = 0;
    return http.post("*/auth/login", async ({ request }) => {
        attempts++;
        if (attempts === 1) {
            return HttpResponse.json({ detail: "Service temporarily unavailable" }, { status: 503 });
        }
        
        // Reset after successful retry (cleanup for next test)
        if (attempts > 1) {
            setTimeout(() => { attempts = 0; }, 100);
        }
        
        // En el segundo intento, verificar credenciales y devolver éxito
        let body: { username?: string; password?: string } = {};
        const contentType = request.headers.get("Content-Type");
        
        try {
            if (contentType?.includes("application/json")) {
                body = (await request.json()) as { username?: string; password?: string };
            } else if (contentType?.includes("application/x-www-form-urlencoded")) {
                const text = await request.text();
                const params = new URLSearchParams(text);
                body = {
                    username: params.get("username") || undefined,
                    password: params.get("password") || undefined,
                };
            }
        } catch {
            return HttpResponse.json(errorResponses.invalidLogin, { status: 400 });
        }
        
        if (body.username === "test@example.com" && body.password === "testpass123") {
            return HttpResponse.json(loginSuccessResponse, { status: 200 });
        }
        
        return HttpResponse.json(errorResponses.invalidLogin, { status: 401 });
    });
})();

export const loginRateLimitHandler = (() => {
    let requestCount = 0
    return http.post("*/auth/login", async ({ request }) => {
        requestCount++
        if (requestCount === 1) {
            return HttpResponse.json(
                { detail: "Too many login attempts. Please try again later." },
                { status: 429 }
            )
        }
        
        // En el segundo intento, verificar credenciales y devolver éxito
        let body: { username?: string; password?: string } = {};
        const contentType = request.headers.get("Content-Type");
        
        try {
            if (contentType?.includes("application/json")) {
                body = (await request.json()) as { username?: string; password?: string };
            } else if (contentType?.includes("application/x-www-form-urlencoded")) {
                const text = await request.text();
                const params = new URLSearchParams(text);
                body = {
                    username: params.get("username") || undefined,
                    password: params.get("password") || undefined,
                };
            }
        } catch {
            return HttpResponse.json(errorResponses.invalidLogin, { status: 400 });
        }
        
        if (body.username === "test@example.com" && body.password === "testpass123") {
            return HttpResponse.json(loginSuccessResponse, { status: 200 });
        }
        
        return HttpResponse.json(errorResponses.invalidLogin, { status: 401 });
    })
})()

export const loginTimeoutHandler = http.post("*/auth/login", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const emailValidationHandler = http.post("*/auth/login", async () => {
    // Este handler sobrescribe el comportamiento para cualquier request
    // Devuelve error de validación de email
    return HttpResponse.json({ detail: "Email format is invalid" }, { status: 422 })
})

export const networkErrorHandler = http.post("*/auth/login", async () => {
    return HttpResponse.error()
})

export const malformedResponseHandler = http.post("*/auth/login", async () => {
    // Devolver una respuesta que no es JSON válido
    return new Response("malformed json{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
})

