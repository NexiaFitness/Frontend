/**
 * React Router Mocks
 * 
 * Mock centralizado de react-router-dom en entorno de testing.
 * Permite controlar navegación, localización y parámetros sin router real.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { vi } from "vitest";
import type { Location } from "react-router-dom";

export const mockNavigate = vi.fn();
export let mockLocationPathname = "/";
export let mockLocationState: Location["state"] = null;
export let mockLocationSearch = "";
export let mockLocationHash = "";
export let mockParams: Record<string, string> = {};
export let mockSearchParams = new URLSearchParams();

// Helper para configurar la localización mockeada
export const setMockLocation = (
    pathname: string,
    state: Location["state"] = null,
    search = "",
    hash = ""
) => {
    mockLocationPathname = pathname;
    mockLocationState = state;
    mockLocationSearch = search;
    mockLocationHash = hash;
};

// Helper para configurar parámetros de ruta
export const setMockParams = (params: Record<string, string>) => {
    mockParams = params;
};

// Helper para configurar search params
export const setMockSearchParams = (params: Record<string, string>) => {
    mockSearchParams = new URLSearchParams(params);
};

// Interceptar react-router-dom
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: (): Location => ({
            pathname: mockLocationPathname,
            state: mockLocationState,
            search: mockLocationSearch,
            hash: mockLocationHash,
            key: "test-key",
        }),
        useParams: () => mockParams,
        useSearchParams: () => [mockSearchParams, vi.fn()],
        useNavigationType: () => "PUSH",
        Navigate: ({ to, state, replace }: { to: string; state?: any; replace?: boolean }) => {
            // Simular navegación automática en tests
            React.useEffect(() => {
                mockNavigate(to, { state, replace });
            }, [to, state, replace]);
            
            return React.createElement("div", {
                "data-testid": "navigate",
                "data-to": to,
                "data-state": JSON.stringify(state),
                "data-replace": replace,
            });
        },
    };
});

// Helpers para limpiar entre tests
export const clearRouterMocks = () => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockLocationPathname = "/";
    mockLocationState = null;
    mockLocationSearch = "";
    mockLocationHash = "";
    mockParams = {};
    mockSearchParams = new URLSearchParams();
};