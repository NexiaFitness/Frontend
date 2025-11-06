/**
 * index.ts — Punto de entrada para utilidades de validación
 *
 * Contexto:
 * - Re-exporta validaciones por dominio (auth, clients, …).
 * - Permite imports cortos desde @shared/utils/validations.
 * - Mantener actualizado al añadir nuevos dominios (plans, sessions).
 *
 * @author Frontend Team
 * @since v2.2.0
 */

// Auth validations
export * from "./auth/validation";

// Client validations
export * from "./clients/clientValidation";

// En el futuro:
// export * from "./plans/planValidation";
// export * from "./sessions/sessionValidation";
