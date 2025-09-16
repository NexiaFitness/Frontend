/**
 * MSW Setup
 *
 * Configuración global de Mock Service Worker para tests
 *
 * @since v1.0.0
 */
import { setupServer } from "msw/node"
import { authHandlers } from "../mocks/handlers/authHandlers"

// Configuramos el servidor MSW con los handlers centralizados
export const server = setupServer(...authHandlers)
