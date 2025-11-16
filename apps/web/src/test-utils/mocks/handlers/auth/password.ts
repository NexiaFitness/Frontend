/**
 * Handlers de MSW para endpoints de forgot/reset password
 *
 * Alineados con backend FastAPI real usando fixtures corregidas.
 * Incluye handlers básicos + específicos para testing avanzado.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw"
import {
    forgotPasswordSuccessResponse,
    errorResponses,
} from "../../../fixtures/auth"

// ===== HANDLERS BÁSICOS =====

export const forgotPasswordHandler = http.post("*/auth/forgot-password", async () => {
    return HttpResponse.json(forgotPasswordSuccessResponse, { status: 200 })
})

export const resetPasswordHandler = http.post("*/auth/reset-password", async ({ request }) => {
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
})

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

const createRetryHandler = <T extends object>(
    endpoint: string,
    successResponse: T,
    successStatus: number = 200
) => {
    let attempts = 0;
    return http.post(`*${endpoint}`, async () => {
        attempts++;
        return attempts === 1
            ? HttpResponse.json({ detail: "Service temporarily unavailable" }, { status: 503 })
            : HttpResponse.json(successResponse, { status: successStatus });
    });
};

export const forgotPasswordRetryHandler = createRetryHandler(
    "/auth/forgot-password",
    forgotPasswordSuccessResponse
)

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

export const forgotPasswordEmailValidationHandler = http.post("*/auth/forgot-password", async () => {
    return HttpResponse.json({ detail: "Email format is invalid" }, { status: 422 })
})

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

