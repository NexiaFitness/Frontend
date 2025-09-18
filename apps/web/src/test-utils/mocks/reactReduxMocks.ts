/**
 * React Redux Mocks
 *
 * Mock de useDispatch y useSelector para tests aislados sin store real.
 * Intercepta el import de react-redux y devuelve mocks controlables.
 *
 * @since v1.0.1
 */

import { vi } from "vitest"
import type { RootState, AppDispatch } from "@shared/store"

export const mockDispatch = vi.fn()
export let mockAuthState: { isAuthenticated: boolean; token: string | null } = {
    isAuthenticated: false,
    token: null,
}

// Interceptamos el módulo real de react-redux
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<typeof import("react-redux")>("react-redux")

    return {
        ...actual,
        useDispatch: (): AppDispatch => mockDispatch as unknown as AppDispatch,
        useSelector: <TSelected>(selector: (state: RootState) => TSelected): TSelected =>
            selector({ auth: mockAuthState } as RootState),
    }
})

// Helpers para los tests
export const setMockAuthState = (state: typeof mockAuthState) => {
    mockAuthState = state
}

export const clearReduxMocks = () => {
    vi.clearAllMocks()
    mockAuthState = { isAuthenticated: false, token: null }
}
