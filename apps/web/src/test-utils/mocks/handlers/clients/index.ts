/**
 * Handlers de MSW para endpoints de clientes - Barrel Export
 *
 * Exporta todos los handlers de clientes organizados por funcionalidad.
 * Mantiene compatibilidad con el array clientsHandlers original.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { getClientsHandler } from "./list"
import { createClientHandler } from "./create"
import { deleteClientHandler } from "./delete"

// ===== EXPORTAR HANDLERS INDIVIDUALES =====

export * from "./list"
export * from "./create"
export * from "./delete"

// ===== ARRAY DE HANDLERS BÁSICOS (COMPATIBILIDAD) =====

export const clientsHandlers = [
    getClientsHandler,
    createClientHandler,
    deleteClientHandler,
]

