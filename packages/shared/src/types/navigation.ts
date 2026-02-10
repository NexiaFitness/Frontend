/**
 * navigation.ts - Tipos para estado de navegación (return URL, contexto)
 *
 * Propósito: Tipar location.state en flujos que preservan "volver al origen".
 * Contexto: Usado por páginas que reciben state.from (ej. CreateSession, CreateTestResult).
 * Mantenimiento: Añadir aquí solo campos usados por React Router state.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

/** Estado opcional que puede llevar la ubicación para volver al origen. */
export interface LocationStateReturnTo {
    /** Ruta (pathname + search + hash) a la que volver. */
    from?: string;
}
