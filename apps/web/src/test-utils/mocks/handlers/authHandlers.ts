/**
 * Handlers de MSW para endpoints de autenticación
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
    registerSuccessResponse,
    forgotPasswordSuccessResponse,
    errorResponses,
} from "../../fixtures/authFixtures"

// ===== HANDLERS BÁSICOS (ACTUALIZADOS) =====

export const authHandlers = [
    // Login - Handler dinámico que acepta JSON y form-data
    http.post("*/auth/login", async ({ request }) => {
        await new Promise((res) => setTimeout(res, 300)) // simular red lenta

        let body: { username?: string; password?: string } = {}
        const contentType = request.headers.get("Content-Type")

        try {
            if (contentType?.includes("application/json")) {
                body = (await request.json()) as { username?: string; password?: string }
            } else if (contentType?.includes("application/x-www-form-urlencoded")) {
                const text = await request.text()
                body = Object.fromEntries(new URLSearchParams(text))
            }
        } catch {
            return HttpResponse.json(errorResponses.invalidLogin, { status: 400 })
        }

        // Credenciales inválidas (fixture)
        if (body.username === "invalid@test.com" && body.password === "wrongpass") {
            return HttpResponse.json(errorResponses.invalidLogin, { status: 400 })
        }

        // Credenciales válidas (fixture)
        if (body.username === "test@example.com" && body.password === "testpass123") {
            return HttpResponse.json(loginSuccessResponse, {
                status: 200,
                headers: { "Content-Type": "application/json" },
            })
        }

        // Por defecto → error
        return HttpResponse.json(errorResponses.invalidLogin, { status: 400 })
    }),

    // Register - Handler dinámico con tipo seguro
    http.post("*/auth/register", async ({ request }) => {
        try {
            const body = (await request.json()) as { email?: string }

            if (body?.email === "existing@test.com") {
                return HttpResponse.json(errorResponses.emailAlreadyExists, { status: 409 })
            }

            return HttpResponse.json(registerSuccessResponse, { status: 201 })
        } catch {
            return HttpResponse.json(errorResponses.emailAlreadyExists, { status: 400 })
        }
    }),

    // Forgot password
    http.post("*/auth/forgot-password", async () => {
        return HttpResponse.json(forgotPasswordSuccessResponse, { status: 200 })
    }),

    // Reset password - Handler dinámico con tipo seguro
    http.post("*/auth/reset-password", async ({ request }) => {
        try {
            const body = (await request.json()) as { token?: string }

            if (body?.token === "invalid-token") {
                return HttpResponse.json(errorResponses.invalidResetToken, { status: 400 })
            }

            return HttpResponse.json(
                { message: "Password has been reset successfully." },
                { status: 200 }
            )
        } catch {
            return HttpResponse.json(errorResponses.invalidResetToken, { status: 400 })
        }
    }),
]

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

const createRetryHandler = (
    endpoint: string,
    successResponse: any,
    successStatus: number = 200
) => {
    let attempts = 0
    return http.post(`*${endpoint}`, async () => {
        attempts++
        return attempts === 1
            ? HttpResponse.json({ detail: "Service temporarily unavailable" }, { status: 503 })
            : HttpResponse.json(successResponse, { status: successStatus })
    })
}

export const loginRetryHandler = createRetryHandler("/auth/login", loginSuccessResponse)
export const registerRetryHandler = createRetryHandler(
    "/auth/register",
    registerSuccessResponse,
    201
)
export const forgotPasswordRetryHandler = createRetryHandler(
    "/auth/forgot-password",
    forgotPasswordSuccessResponse
)

export const loginRateLimitHandler = (() => {
    let requestCount = 0
    return http.post("*/auth/login", async () => {
        requestCount++
        return requestCount === 1
            ? HttpResponse.json(
                { detail: "Too many login attempts. Please try again later." },
                { status: 429 }
            )
            : HttpResponse.json(loginSuccessResponse, { status: 200 })
    })
})()

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

export const loginTimeoutHandler = http.post("*/auth/login", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const registerTimeoutHandler = http.post("*/auth/register", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const forgotPasswordTimeoutHandler = http.post("*/auth/forgot-password", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const forgotPasswordSlowHandler = http.post("*/auth/forgot-password", async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return HttpResponse.json(forgotPasswordSuccessResponse, { status: 200 })
})

export const forgotPasswordRetryFromErrorHandler = (() => {
    let requestCount = 0;
    return http.post("*/auth/forgot-password", async () => {
        requestCount++;
        return requestCount === 1
            ? HttpResponse.json({ detail: "Email format is invalid" }, { status: 422 })
            : HttpResponse.json(forgotPasswordSuccessResponse, { status: 200 });
    });
})();

export const passwordValidationHandler = http.post("*/auth/register", async () => {
    return HttpResponse.json(
        {
            detail:
                "Password must be at least 8 characters and contain uppercase, lowercase, and numbers",
        },
        { status: 422 }
    )
})

export const emailValidationHandler = http.post("*/auth/login", async () => {
    return HttpResponse.json({ detail: "Email format is invalid" }, { status: 422 })
})

export const forgotPasswordEmailValidationHandler = http.post("*/auth/forgot-password", async () => {
    return HttpResponse.json({ detail: "Email format is invalid" }, { status: 422 })
})

export const networkErrorHandler = http.post("*/auth/login", async () => {
    return HttpResponse.error()
})

export const malformedResponseHandler = http.post("*/auth/login", async () => {
    return new HttpResponse("malformed json{", { status: 200 })
})

export const registerMalformedResponseHandler = http.post("*/auth/register", async () => {
    return new HttpResponse("malformed json{", { status: 200 })
})

// ===== RESET PASSWORD SPECIFIC HANDLERS =====

export const resetPasswordRetryHandler = (() => {
    let attempts = 0
    return http.post("*/auth/reset-password", async () => {
        attempts++
        return attempts === 1
            ? HttpResponse.json({ detail: "Service temporarily unavailable" }, { status: 503 })
            : HttpResponse.json({ message: "Password has been reset successfully." }, { status: 200 })
    })
})()

export const resetPasswordTimeoutHandler = http.post("*/auth/reset-password", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    return new Response(null, { status: 408 })
})

export const resetPasswordInvalidTokenHandler = http.post("*/auth/reset-password", async () => {
    return HttpResponse.json({ detail: "Invalid or expired reset token" }, { status: 400 })
})

export const resetPasswordValidationHandler = http.post("*/auth/reset-password", async () => {
    return HttpResponse.json(
        {
            detail: "Password must be at least 8 characters and contain uppercase, lowercase, and numbers",
        },
        { status: 422 }
    )
})

export const resetPasswordNetworkErrorHandler = http.post("*/auth/reset-password", async () => {
    return HttpResponse.error()
})