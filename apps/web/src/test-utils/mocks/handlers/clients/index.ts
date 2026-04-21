/**
 * Handlers de MSW para endpoints de clientes - Barrel Export
 *
 * Exporta todos los handlers de clientes organizados por funcionalidad.
 * Mantiene compatibilidad con el array clientsHandlers original.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { getClientsHandler, getClientHandler } from "./list"
import { createClientHandler } from "./create"
import { deleteClientHandler } from "./delete"
import { createClientPreviewHandler } from "./preview"
import { getClientTrainingSessionsHandler, getSessionCoherenceHandler } from "./sessions"

// ===== EXPORTAR HANDLERS INDIVIDUALES =====

export * from "./list"
export * from "./create"
export * from "./delete"
export * from "./preview"
export * from "./coherence"
export * from "./progress"
export * from "./fatigue"
export * from "./sessions"
export * from "./tests"

// ===== ARRAY DE HANDLERS BÁSICOS (COMPATIBILIDAD) =====

export const clientsHandlers = [
    getClientsHandler,
    getClientHandler,
    createClientHandler,
    deleteClientHandler,
    createClientPreviewHandler,
    getClientTrainingSessionsHandler,
    getSessionCoherenceHandler,
]

