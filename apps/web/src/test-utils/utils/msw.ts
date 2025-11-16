/**
 * MSW Server Configuration
 * 
 * Configuración global de Mock Service Worker para testing.
 * Incluye setup/teardown automático y manejo de errores.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { setupServer } from "msw/node";
import { authHandlers } from "../mocks/handlers/auth";
import { accountHandlers } from "../mocks/handlers/account";
import { clientsHandlers } from "../mocks/handlers/clients";

// Servidor MSW con handlers centralizados
export const server = setupServer(...authHandlers, ...accountHandlers, ...clientsHandlers);

// Setup global para tests
export const setupMSW = () => {
    // Establecer servidor antes de todos los tests
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' });
    });

    // Resetear handlers después de cada test
    afterEach(() => {
        server.resetHandlers();
    });

    // Cerrar servidor después de todos los tests
    afterAll(() => {
        server.close();
    });
};