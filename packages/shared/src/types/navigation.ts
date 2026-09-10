/**
 * navigation.ts - Tipos para estado de navegación (return URL, contexto)
 *
 * Propósito: Tipar location.state en flujos que preservan "volver al origen".
 * Contexto: Usado por páginas que reciben state.from (ej. CreateSession, CreateTestResult).
 * Mantenimiento: Añadir aqui solo campos usados por React Router state.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import type { SessionCoherence } from "./trainingSessions";

/** Estado opcional que puede llevar la ubicación para volver al origen. */
export interface LocationStateReturnTo {
    /** Ruta (pathname + search + hash) a la que volver. */
    from?: string;
}

/**
 * Estado de navegacion hacia SessionReviewPage (F4.3b FE-2).
 * Incluye coherencia de POST/PUT para pintar conclusiones sin GET extra.
 */
export interface SessionReviewLocationState extends LocationStateReturnTo {
    coherence?: SessionCoherence | null;
}
