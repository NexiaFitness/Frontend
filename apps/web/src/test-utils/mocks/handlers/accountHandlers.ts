/**
 * Account API Handlers - MSW handlers para endpoints de cuenta
 *
 * Handlers para DELETE /auth/me siguiendo patrón establecido en authHandlers.
 * Separado de authHandlers para mantener separation of concerns.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { http, HttpResponse } from "msw";

// ===== HANDLERS BÁSICOS =====

export const accountHandlers = [
    // Delete account - Success by default
    http.delete("*/auth/me", async () => {
        await new Promise((res) => setTimeout(res, 300)); // Simular red
        return HttpResponse.json(
            { success: true, message: "Account deleted successfully" },
            { status: 200 }
        );
    }),
];

// ===== HANDLERS ESPECÍFICOS PARA TESTING AVANZADO =====

export const deleteAccountErrorHandler = http.delete("*/auth/me", async () => {
    return HttpResponse.json(
        { detail: "Failed to delete account" },
        { status: 500 }
    );
});

export const deleteAccountTimeoutHandler = http.delete("*/auth/me", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return new Response(null, { status: 408 });
});

export const deleteAccountNetworkErrorHandler = http.delete("*/auth/me", async () => {
    return HttpResponse.error();
});

export const deleteAccountRetryHandler = (() => {
    let attempts = 0;
    return http.delete("*/auth/me", async () => {
        attempts++;
        return attempts === 1
            ? HttpResponse.json({ detail: "Service temporarily unavailable" }, { status: 503 })
            : HttpResponse.json({ success: true, message: "Account deleted successfully" }, { status: 200 });
    });
})();