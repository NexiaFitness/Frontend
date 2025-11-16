/**
 * Handlers de MSW para endpoints de cuenta - Barrel Export
 *
 * Exporta todos los handlers de cuenta organizados por funcionalidad.
 * Mantiene compatibilidad con el array accountHandlers original.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { deleteAccountHandler } from "./delete";

// ===== EXPORTAR HANDLERS INDIVIDUALES =====

export * from "./delete";

// ===== ARRAY DE HANDLERS BÁSICOS (COMPATIBILIDAD) =====

export const accountHandlers = [
    deleteAccountHandler,
];

