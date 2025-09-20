/**
 * Test Setup - Configuración global para el entorno de testing
 *
 * Configura jest-dom matchers, mocks globales y Mock Service Worker.
 * Se ejecuta automáticamente antes de cada archivo de test.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import "@testing-library/jest-dom";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./utils/msw";
import "@/test-utils/mocks/reactRouterMocks";
import "@/test-utils/mocks/reactReduxMocks";
// REMOVIDO: authApiMocks causa conflicto con MSW
// import "@/test-utils/mocks/authApiMocks";

// MSW Server Setup
beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllTimers();
});

afterAll(() => {
    server.close();
    vi.restoreAllMocks();
});

// Browser API Mocks
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Console cleanup
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (typeof args[0] === "string" && 
            args[0].includes("Warning: ReactDOM.render is deprecated")) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});