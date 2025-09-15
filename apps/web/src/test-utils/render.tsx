/**
 * Custom Render Utils - Testing utilities con providers necesarios
 * 
 * Proporciona render customizado que incluye Redux store, React Router,
 * y otros providers necesarios para testing de componentes. Permite
 * testing realista de componentes que dependen de context providers.
 * 
 * Enterprise-grade solution que evita type conflicts usando store factory
 * y preloaded state type-safe approach.
 */

/* eslint-disable react-refresh/only-export-components */

import React, { PropsWithChildren } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore, type Store } from '@reduxjs/toolkit'
import { vi } from 'vitest'
import { authSlice } from '@shared/store/authSlice'
import { clientsSlice } from '@shared/store/clientsSlice'
import { baseApi } from '@shared/api/baseApi'
import type { AuthState } from '@shared/types/auth'
import type { ClientState } from '@shared/types/client'

// Test store type that mimics production store
type TestStore = Store<{
    auth: AuthState
    clients: ClientState
    api: ReturnType<typeof baseApi.reducer>
}>

// Test store configuration factory
export function createTestStore(): TestStore {
    return configureStore({
        reducer: {
            auth: authSlice.reducer,
            clients: clientsSlice.reducer,
            [baseApi.reducerPath]: baseApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }).concat(baseApi.middleware),
    }) as TestStore
}

// Default test user for authenticated tests
export const mockUser = {
    id: 1, // User.id should be number, not string
    email: 'trainer@test.com',
    nombre: 'Test',
    apellidos: 'Trainer',
    role: 'trainer' as const,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
}

// Helper to create authenticated store
export function createAuthenticatedTestStore(): TestStore {
    const store = createTestStore()
    
    // Dispatch authenticated state
    store.dispatch(authSlice.actions.loginSuccess({
        user: mockUser,
        token: 'test-jwt-token'
    }))
    
    return store
}

// Helper to create store with custom auth state
export function createTestStoreWithAuth(authOverrides: Partial<AuthState> = {}): TestStore {
    const store = createTestStore()
    
    // Apply auth state overrides
    if (authOverrides.user || authOverrides.token) {
        store.dispatch(authSlice.actions.loginSuccess({
            user: authOverrides.user || mockUser,
            token: authOverrides.token || 'test-jwt-token'
        }))
    }
    
    // Apply other auth state properties
    if (authOverrides.error) {
        store.dispatch(authSlice.actions.loginFailure(authOverrides.error))
    }
    
    if (authOverrides.isLoading !== undefined) {
        store.dispatch(authSlice.actions.setLoading(authOverrides.isLoading))
    }
    
    return store
}

// Test wrapper component
interface TestWrapperProps {
    store?: TestStore
}

function TestWrapper({
    children,
    store = createTestStore()
}: PropsWithChildren<TestWrapperProps>) {
    return (
        <Provider store={store}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </Provider>
    )
}

// Custom render function options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    store?: TestStore
    authenticated?: boolean
    authOverrides?: Partial<AuthState>
}

// Main render function with enterprise-grade type safety
export function render(
    ui: React.ReactElement,
    {
        store,
        authenticated = false,
        authOverrides = {},
        ...renderOptions
    }: CustomRenderOptions = {}
) {
    // Determine which store to use
    let testStore: TestStore
    
    if (store) {
        testStore = store
    } else if (authenticated) {
        testStore = createAuthenticatedTestStore()
    } else if (Object.keys(authOverrides).length > 0) {
        testStore = createTestStoreWithAuth(authOverrides)
    } else {
        testStore = createTestStore()
    }
    
    const Wrapper = ({ children }: PropsWithChildren) => (
        <TestWrapper store={testStore}>
            {children}
        </TestWrapper>
    )

    return {
        store: testStore,
        ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    }
}

// Convenience function for authenticated renders
export function renderAuthenticated(
    ui: React.ReactElement,
    options: Omit<CustomRenderOptions, 'authenticated'> = {}
) {
    return render(ui, {
        authenticated: true,
        ...options,
    })
}

// Convenience function for unauthenticated renders
export function renderUnauthenticated(
    ui: React.ReactElement,
    options: CustomRenderOptions = {}
) {
    return render(ui, {
        authenticated: false,
        ...options,
    })
}

// Utility to create mock API responses
export function createMockApiResponse<T>(data: T, status = 200) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
    } as Response)
}

// Utility to mock RTK Query endpoints
export function mockApiEndpoint(endpoint: string, response: unknown) {
    return vi.fn().mockResolvedValue(response)
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Re-export vitest utilities for convenience
export { vi, expect, describe, it, beforeEach, afterEach } from 'vitest'