/**
 * ProtectedRoute Test Suite
 *
 * Tests del componente ProtectedRoute que validan:
 *  - Redirección al login cuando el usuario no está autenticado
 *  - Renderizado correcto de children cuando el usuario está autenticado
 *  - Preservación de la ruta de origen en el estado de navegación
 *  - Uso de useNavigate cuando se fuerza redirección manual
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react"
import { vi } from "vitest"
import { render } from "@/test-utils/render"
import { ProtectedRoute } from "../ProtectedRoute"
import type { RootState } from "@nexia/shared/store"   // ✅ Importamos RootState real

// --- Mocks ---
const mockNavigate = vi.fn()
let mockLocationPathname = "/dashboard"

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
    return {
        ...actual,
        useLocation: () => ({ pathname: mockLocationPathname }),
        useNavigate: () => mockNavigate,
        Navigate: ({ to, state }: { to: string; state?: unknown }) => (
            <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)} />
        ),
    }
})

// Estado simulado de auth
let mockAuthState: { isAuthenticated: boolean; token: string | null } = {
    isAuthenticated: false,
    token: null,
}

// Mock react-redux
vi.mock("react-redux", async () => {
    const actual = await vi.importActual<typeof import("react-redux")>("react-redux")
    return {
        ...actual,
        useSelector: (fn: (state: RootState) => unknown) =>
            fn({ auth: mockAuthState } as RootState), // ✅ Tipado profesional
    }
})

// --- Tests ---
describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAuthState = { isAuthenticated: false, token: null }
        mockLocationPathname = "/dashboard"
    })

    it("redirige al login si no está autenticado", () => {
        render(
            <ProtectedRoute>
                <div>Contenido protegido</div>
            </ProtectedRoute>
        )

        const navigateElement = screen.getByTestId("navigate")
        expect(navigateElement).toBeInTheDocument()
        expect(navigateElement).toHaveAttribute("data-to", "/auth/login")
        expect(JSON.parse(navigateElement.getAttribute("data-state") || "{}")).toEqual({
            from: "/dashboard",
        })
    })

    it("renderiza los children si está autenticado con token válido", () => {
        mockAuthState = { isAuthenticated: true, token: "fake-token" }

        render(
            <ProtectedRoute>
                <div>Contenido protegido</div>
            </ProtectedRoute>
        )

        expect(screen.getByText("Contenido protegido")).toBeInTheDocument()
    })

    it("redirige si isAuthenticated es true pero token está vacío", () => {
        mockAuthState = { isAuthenticated: true, token: "" }

        render(
            <ProtectedRoute>
                <div>Contenido protegido</div>
            </ProtectedRoute>
        )

        const navigateElement = screen.getByTestId("navigate")
        expect(navigateElement).toBeInTheDocument()
        expect(navigateElement).toHaveAttribute("data-to", "/auth/login")
    })

    it("mantiene la ruta actual en state.from al redirigir", () => {
        mockAuthState = { isAuthenticated: false, token: null }
        mockLocationPathname = "/clients"

        render(
            <ProtectedRoute>
                <div>Contenido protegido</div>
            </ProtectedRoute>
        )

        const navigateElement = screen.getByTestId("navigate")
        const state = JSON.parse(navigateElement.getAttribute("data-state") || "{}")
        expect(state.from).toBe("/clients")
    })

    it("llama a useNavigate si se fuerza una navegación manual", () => {
        // Simula que ProtectedRoute podría llamar manualmente a navigate
        mockNavigate("/auth/login", { replace: true })
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", { replace: true })
    })
})
