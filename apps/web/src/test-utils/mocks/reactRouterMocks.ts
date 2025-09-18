/**
 * React Router Mocks
 *
 * Mock centralizado de react-router-dom en entorno de testing.
 * Permite controlar navegación y localización sin un router real.
 *
 * @since v1.0.0
 */

import React from "react"
import { vi } from "vitest"

export const mockNavigate = vi.fn()
export let mockLocationPathname = "/"
export let mockLocationState: Record<string, any> = {} // siempre un objeto, nunca null/undefined

// Helper para configurar la localización mockeada
export const setMockLocation = (
  pathname: string,
  state: Record<string, any> = {}
) => {
  mockLocationPathname = pathname
  mockLocationState = state
}

// Interceptamos react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  )

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockLocationPathname,
      state: mockLocationState,
      search: "",
      hash: "",
      key: "default",
    }),
    // Mock de Navigate: devolvemos un <div> en vez del componente real
    Navigate: ({ to, state }: { to: string; state?: any }) =>
      React.createElement("div", {
        "data-testid": "navigate",
        "data-to": to,
        "data-state": JSON.stringify(state),
      }),
  }
})

// Helpers extra
export const clearRouterMocks = () => {
  vi.clearAllMocks()
  mockNavigate.mockReset()
  mockLocationPathname = "/"
  mockLocationState = {}
}
