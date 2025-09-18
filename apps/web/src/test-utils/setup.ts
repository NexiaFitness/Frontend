/**
 * Test Setup - Configuración global para el entorno de testing
 *
 * Configura jest-dom matchers, mocks globales y Mock Service Worker (MSW).
 * Se ejecuta antes de cada archivo de test para garantizar un entorno limpio.
 *
 * @since v1.0.0
 */

import "@testing-library/jest-dom"
import { afterEach, beforeAll, afterAll, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import { server } from "./utils/msw"
import "@/test-utils/mocks/reactRouterMocks"
import "@/test-utils/mocks/reactReduxMocks"

// Arranca el server MSW antes de los tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }))

// Resetear handlers + limpiar DOM entre tests
afterEach(() => {
    cleanup()
    server.resetHandlers()
})

// Apaga el server MSW después de todos los tests
afterAll(() => {
    server.close()
})

// Mock window.matchMedia (para componentes responsivos)
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock ResizeObserver (para layout components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Mock IntersectionObserver (para lazy loading)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Silenciar warnings de React específicos
const originalError = console.error
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === "string" &&
            args[0].includes("Warning: ReactDOM.render is deprecated")
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})
