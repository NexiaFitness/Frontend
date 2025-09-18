/**
 * LogoutButton Component Test Suite
 *
 * Tests completos para el componente LogoutButton con modal de confirmación.
 * Usa mocks simples sin complicaciones innecesarias.
 *
 * @since v2.0.0
 */

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { LogoutButton } from "../LogoutButton"

// Mock del hook useLogout
const mockLogout = vi.fn()
const mockNavigate = vi.fn()

vi.mock("@shared/hooks/useLogout", () => ({
    useLogout: vi.fn(() => ({
        logout: mockLogout,
        isLoading: false,
        error: null,
        user: {
            id: 1,
            email: "test@test.com",
            nombre: "John",
            apellidos: "Doe",
            role: "trainer",
            is_active: true,
            created_at: "2023-01-01",
            updated_at: "2023-01-01"
        }
    }))
}))

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Mock del modal de confirmación
vi.mock("@/components/auth/modals/LogoutConfirmationModal", () => ({
    LogoutConfirmationModal: ({ isOpen, onConfirm, onCancel }: {
        isOpen: boolean
        onConfirm: () => void
        onCancel: () => void
    }) =>
        isOpen ? (
            <div data-testid="logout-modal">
                <button onClick={onConfirm} data-testid="modal-confirm">Confirmar</button>
                <button onClick={onCancel} data-testid="modal-cancel">Cancelar</button>
            </div>
        ) : null
}))

describe("LogoutButton", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Rendering", () => {
        it("renders with default text", () => {
            render(<LogoutButton />)
            
            expect(screen.getByRole("button", { name: "Cerrar Sesión" })).toBeInTheDocument()
        })

        it("renders with custom children", () => {
            render(<LogoutButton>Custom Logout</LogoutButton>)
            
            expect(screen.getByRole("button", { name: "Custom Logout" })).toBeInTheDocument()
        })
    })

    describe("Modal Flow", () => {
        it("shows modal when confirmation required", async () => {
            const user = userEvent.setup()
            render(<LogoutButton />)

            await user.click(screen.getByRole("button"))

            expect(screen.getByTestId("logout-modal")).toBeInTheDocument()
        })

        it("calls logout when modal confirmed", async () => {
            const user = userEvent.setup()
            render(<LogoutButton />)

            await user.click(screen.getByRole("button"))
            await user.click(screen.getByTestId("modal-confirm"))

            expect(mockLogout).toHaveBeenCalledTimes(1)
        })

        it("closes modal when cancelled", async () => {
            const user = userEvent.setup()
            render(<LogoutButton />)

            await user.click(screen.getByRole("button"))
            await user.click(screen.getByTestId("modal-cancel"))

            expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument()
        })
    })

    describe("Direct Logout", () => {
        it("skips modal when confirmationRequired is false", async () => {
            const user = userEvent.setup()
            render(<LogoutButton confirmationRequired={false} />)

            await user.click(screen.getByRole("button"))

            expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument()
            expect(mockLogout).toHaveBeenCalledTimes(1)
        })
    })
})