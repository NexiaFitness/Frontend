/**
 * Handlers de MSW para endpoints de registro
 *
 * Alineados con backend FastAPI real usando fixtures corregidas.
 * Incluye handlers básicos + específicos para testing avanzado.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"
import {
    registerSuccessResponse,
    errorResponses,
} from "../../../fixtures/auth"

// ===== HANDLERS BÁSICOS =====

export const registerHandler = http.post("*/auth/register", async ({ request }) => {
    await new Promise((res) => setTimeout(res, 50)) // Minimal delay for React state updates

    try {
        const body = (await request.json()) as { email?: string }

        if (body?.email === "existing@test.com") {
            return HttpResponse.json(errorResponses.emailAlreadyExists, { status: 409 })
        }

        return HttpResponse.json(registerSuccessResponse, { status: 201 })
    } catch {
        return HttpResponse.json(errorResponses.emailAlreadyExists, { status: 400 })
    }
})

export const verifyEmailHandler = http.post("*/auth/verify-email", async () => {
    await new Promise((res) => setTimeout(res, 50)) // Minimal delay for React state updates

    return HttpResponse.json(
        { message: "Email verified successfully.", email: "test@example.com" },
        { status: 200 }
    );
})

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

export const registerRetryHandler = (() => {
    let attempts = 0;
    return http.post("*/auth/register", async ({ request }) => {
        attempts++;
        
        // Reset counter after successful retry (cleanup for next test)
        if (attempts > 1) {
            setTimeout(() => { attempts = 0; }, 100);
        }
        
        if (attempts === 1) {
            return HttpResponse.json(
                { detail: "Service temporarily unavailable" }, 
                { status: 503 }
            );
        }
        
        // Second attempt: read body and return success
        try {
            await request.json(); // Consume body
            return HttpResponse.json(registerSuccessResponse, { status: 201 });
        } catch {
            return HttpResponse.json({ detail: "Invalid request" }, { status: 400 });
        }
    });
})();

export const registerRateLimitHandler = (() => {
    let requestCount = 0
    return http.post("*/auth/register", async () => {
        requestCount++
        return requestCount === 1
            ? HttpResponse.json(
                { detail: "Too many registration attempts. Please try again later." },
                { status: 429 }
            )
            : HttpResponse.json(registerSuccessResponse, { status: 201 })
    })
})()

export const registerTimeoutHandler = http.post("*/auth/register", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const passwordValidationHandler = http.post("*/auth/register", async () => {
    return HttpResponse.json(
        {
            detail:
                "Password must be at least 8 characters and contain uppercase, lowercase, and numbers",
        },
        { status: 422 }
    )
})

export const registerMalformedResponseHandler = http.post("*/auth/register", async () => {
    // Devolver una respuesta que no es JSON válido
    return new Response("malformed json{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
    })
})

