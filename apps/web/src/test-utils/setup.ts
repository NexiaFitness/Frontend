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
import { initStorage } from '@nexia/shared/storage/IStorage';
import type { IStorage } from '@nexia/shared/storage/IStorage';

// REMOVIDO: authApiMocks causa conflicto con MSW
// import "@/test-utils/mocks/authApiMocks";

// Mock de storage para tests (usa localStorage real pero con manejo de errores)
const testStorage: IStorage = {
    async getItem(key: string): Promise<string | null> {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    async setItem(key: string, value: string): Promise<void> {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Ignorar errores en tests (puede fallar si localStorage está deshabilitado)
        }
    },
    async removeItem(key: string): Promise<void> {
        try {
            localStorage.removeItem(key);
        } catch {
            // Ignorar errores en tests
        }
    },
};

// Inicializar storage antes de todos los tests
initStorage(testStorage);

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