/**
 * Handlers de MSW para endpoints de autenticación - Barrel Export
 *
 * Exporta todos los handlers de autenticación organizados por funcionalidad.
 * Mantiene compatibilidad con el array authHandlers original.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { loginHandler } from "./login"
import { registerHandler, verifyEmailHandler } from "./register"
import { forgotPasswordHandler, resetPasswordHandler } from "./password"

// ===== EXPORTAR HANDLERS INDIVIDUALES =====

export * from "./login"
export * from "./register"
export * from "./password"
export * from "./logout"

// ===== ARRAY DE HANDLERS BÁSICOS (COMPATIBILIDAD) =====

export const authHandlers = [
    loginHandler,
    registerHandler,
    verifyEmailHandler,
    forgotPasswordHandler,
    resetPasswordHandler,
]

