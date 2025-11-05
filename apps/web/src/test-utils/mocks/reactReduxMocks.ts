/**
 * React Redux Mocks
 * 
 * Mock de useDispatch y useSelector para tests aislados sin store real.
 * Intercepta el import de react-redux con estado completo del RootState.
 * Incluye todos los slices: auth, clients, api.
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import { vi } from "vitest";
import type { RootState, AppDispatch } from "@nexia/shared/store";
import type { AuthState } from "@nexia/shared/types/auth";
import type { ClientState } from "@nexia/shared/types/client";

// Mock de dispatch que devuelve objetos con unwrap para async thunks
export const mockDispatch = vi.fn((action) => {
    // Si es una función (thunk), ejecutarla y devolver el resultado
    if (typeof action === 'function') {
        const result = action(mockDispatch, () => mockRootState, undefined);
        // Si el resultado es una promesa (async thunk), devolver objeto con unwrap
        if (result && typeof result.then === 'function') {
            return {
                unwrap: async () => {
                    try {
                        return await result;
                    } catch (error) {
                        throw error;
                    }
                },
                ...result,
            };
        }
        return result;
    }
    // Si es una acción normal, devolverla directamente
    return action;
});

// Mock completo del AuthState
export let mockAuthState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Mock completo del ClientState  
export let mockClientState: ClientState = {
    clients: [],
    selectedClient: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    filters: {},
    pagination: {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0,
    },
};

// Mock del API state (RTK Query)
export let mockApiState = {
    queries: {},
    mutations: {},
    provided: {},
    subscriptions: {},
    config: {
        online: true,
        focused: true,
        middlewareRegistered: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: "api",
    },
};

// RootState mock completo
export let mockRootState: RootState = {
    auth: mockAuthState,
    clients: mockClientState,
    api: mockApiState,
} as RootState;

// Interceptar react-redux
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
    
    return {
        ...actual,
        useDispatch: (): AppDispatch => mockDispatch as unknown as AppDispatch,
        useSelector: <TSelected>(selector: (state: RootState) => TSelected): TSelected =>
            selector(mockRootState),
    };
});

// Helpers para configurar estados en tests
export const setMockAuthState = (state: Partial<AuthState>) => {
    mockAuthState = { ...mockAuthState, ...state };
    mockRootState = { ...mockRootState, auth: mockAuthState };
};

export const setMockClientState = (state: Partial<ClientState>) => {
    mockClientState = { ...mockClientState, ...state };
    mockRootState = { ...mockRootState, clients: mockClientState };
};

export const setMockRootState = (state: Partial<RootState>) => {
    mockRootState = { ...mockRootState, ...state };
};

// Helper para usuario autenticado rápido
export const setAuthenticatedUser = (user: AuthState['user'], token = "fake-token") => {
    setMockAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
    });
};

// Helper para limpiar entre tests
export const clearReduxMocks = () => {
    vi.clearAllMocks();
    
    // Reset auth state
    mockAuthState = {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    };
    
    // Reset client state
    mockClientState = {
        clients: [],
        selectedClient: null,
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        isDeleting: false,
        error: null,
        filters: {},
        pagination: {
            page: 1,
            per_page: 10,
            total: 0,
            total_pages: 0,
        },
    };
    
    // Reset api state
    mockApiState = {
        queries: {},
        mutations: {},
        provided: {},
        subscriptions: {},
        config: {
            online: true,
            focused: true,
            middlewareRegistered: false,
            refetchOnFocus: false,
            refetchOnReconnect: false,
            refetchOnMountOrArgChange: false,
            keepUnusedDataFor: 60,
            reducerPath: "api",
        },
    };
    
    // Reset root state
    mockRootState = {
        auth: mockAuthState,
        clients: mockClientState,
        api: mockApiState,
    } as RootState;
};