/**
 * DeleteAccountModal Component Test Suite - PROFESSIONAL CORRECTED VERSION
 *
 * Tests para el modal de confirmación de eliminación de cuenta.
 * Mock RTK Query correcto con estados dinámicos y selectors precisos.
 *
 * @author Nelson
 * @since v2.3.0
 */

import React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { DeleteAccountModal } from "../DeleteAccountModal"

// Mock del Button component (tipado compatible con hoisting de vi.mock)
vi.mock("@/components/ui/buttons", () => {
    const ReactMod = require("react") as typeof import("react")

    type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string
        isLoading?: boolean
    }

    const MockButton = ReactMod.forwardRef<HTMLButtonElement, ButtonProps>(
        ({ children, onClick, variant, className, disabled, isLoading, ...props }, ref) => (
            <button
                ref={ref}
                onClick={onClick}
                className={`btn-${variant ?? "default"} ${className ?? ""}`}
                disabled={Boolean(disabled || isLoading)}
                {...props}
            >
                {isLoading ? "Eliminando..." : children}
            </button>
        )
    )

    MockButton.displayName = "MockButton"

    return { Button: MockButton }
})


// Mock configuration with dynamic loading state
const mockDeleteAccount = vi.fn(() => ({
    unwrap: vi.fn().mockResolvedValue({ success: true })
}))

let mockIsLoading = false

// Mock de useDeleteAccountMutation con estado dinámico
vi.mock("@shared/api/accountApi", () => ({
    useDeleteAccountMutation: () => [mockDeleteAccount, { isLoading: mockIsLoading }]
}))

// Helper para cambiar loading state dinámicamente
const setMockLoading = (loading: boolean) => {
    mockIsLoading = loading
}

describe("DeleteAccountModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onDeleteSuccess: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        setMockLoading(false) // Reset loading state
        // Reset DOM body state
        document.body.style.overflow = 'unset'
    })

    describe("Conditional Rendering", () => {
        it("renders nothing when isOpen is false", () => {
            const { container } = render(
                <DeleteAccountModal {...defaultProps} isOpen={false} />
            )

            expect(container.firstChild).toBeNull()
        })

        it("renders modal when isOpen is true", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            expect(screen.getByRole("heading", { name: "Eliminar cuenta" })).toBeInTheDocument()
            expect(screen.getByText("Esta acción es irreversible.")).toBeInTheDocument()
        })
    })

    describe("Content Display", () => {
        it("shows default confirmation message without user info", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            expect(screen.getByText(/¿Estás seguro de que quieres eliminar tu cuenta/)).toBeInTheDocument()
            // Verify no parentheses for user info are present
            expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
        })

        it("shows user name and email in confirmation message", () => {
            render(
                <DeleteAccountModal
                    {...defaultProps}
                    userName="John Doe"
                    userEmail="john@example.com"
                />
            )

            // Check for name as strong text
            expect(screen.getByText("John Doe")).toBeInTheDocument()

            // Check for email within the paragraph context - use more flexible selector
            const descriptionElement = screen.getByText(/¿Estás seguro de que quieres eliminar tu cuenta/)
            expect(descriptionElement.textContent).toContain("john@example.com")

            // Verify separator is present
            expect(descriptionElement.textContent).toContain("·")
        })

        it("handles empty user name gracefully", () => {
            render(
                <DeleteAccountModal
                    {...defaultProps}
                    userName=""
                    userEmail="test@example.com"
                />
            )

            expect(screen.getByText(/¿Estás seguro de que quieres eliminar tu cuenta/)).toBeInTheDocument()
        })
    })

    describe("Button Interactions", () => {
        it("calls onClose when cancel button is clicked", async () => {
            const onClose = vi.fn()
            const user = userEvent.setup()

            render(
                <DeleteAccountModal {...defaultProps} onClose={onClose} />
            )

            await user.click(screen.getByRole("button", { name: "Cancelar" }))
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it("calls deleteAccount when delete button is clicked", async () => {
            const user = userEvent.setup()

            render(<DeleteAccountModal {...defaultProps} />)

            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }))

            expect(mockDeleteAccount).toHaveBeenCalledTimes(1)
        })

        it("calls onDeleteSuccess after successful deletion", async () => {
            const onDeleteSuccess = vi.fn()
            const user = userEvent.setup()

            render(
                <DeleteAccountModal
                    {...defaultProps}
                    onDeleteSuccess={onDeleteSuccess}
                />
            )

            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }))

            await waitFor(() => {
                expect(onDeleteSuccess).toHaveBeenCalledTimes(1)
            }, { timeout: 3000 })
        })

        it("calls onClose after successful deletion", async () => {
            const onClose = vi.fn()
            const user = userEvent.setup()

            render(
                <DeleteAccountModal
                    {...defaultProps}
                    onClose={onClose}
                />
            )

            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }))

            await waitFor(() => {
                expect(onClose).toHaveBeenCalledTimes(1)
            }, { timeout: 3000 })
        })

        it("handles deletion error gracefully", async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            // Mock error for this test
            mockDeleteAccount.mockReturnValueOnce({
                unwrap: vi.fn().mockRejectedValue(new Error("Network error"))
            })

            const user = userEvent.setup()
            render(<DeleteAccountModal {...defaultProps} />)

            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }))

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    "[DeleteAccountModal] Error al eliminar cuenta:",
                    expect.any(Error)
                )
            }, { timeout: 3000 })

            consoleSpy.mockRestore()
        })
    })

    describe("Keyboard Interactions", () => {
        it("closes modal when Escape key is pressed", async () => {
            const onClose = vi.fn()
            const user = userEvent.setup()

            render(<DeleteAccountModal {...defaultProps} onClose={onClose} />)

            await user.keyboard("{Escape}")

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it("does not close on Escape when loading", async () => {
            // Set loading state before render
            setMockLoading(true)

            const onClose = vi.fn()
            const user = userEvent.setup()

            render(<DeleteAccountModal {...defaultProps} onClose={onClose} />)

            await user.keyboard("{Escape}")

            expect(onClose).not.toHaveBeenCalled()
        })

        it("focuses cancel button on open", async () => {
            render(<DeleteAccountModal {...defaultProps} />)

            await waitFor(() => {
                const cancelButton = screen.getByRole("button", { name: "Cancelar" })
                expect(cancelButton).toHaveFocus()
            }, { timeout: 200 })
        })
    })

    describe("Loading States", () => {
        it("shows loading text on delete button when loading", () => {
            // Set loading state before render
            setMockLoading(true)

            render(<DeleteAccountModal {...defaultProps} />)

            expect(screen.getByText("Eliminando...")).toBeInTheDocument()
        })

        it("disables buttons when loading", () => {
            // Set loading state before render
            setMockLoading(true)

            render(<DeleteAccountModal {...defaultProps} />)

            const cancelButton = screen.getByRole("button", { name: "Cancelar" })
            const loadingButton = screen.getByText("Eliminando...").closest('button')

            expect(cancelButton).toBeDisabled()
            expect(loadingButton).toBeDisabled()
        })

        it("prevents backdrop click when loading", async () => {
            // Set loading state before render
            setMockLoading(true)

            const onClose = vi.fn()
            const user = userEvent.setup()

            render(<DeleteAccountModal {...defaultProps} onClose={onClose} />)

            // Find backdrop element
            const backdrop = document.querySelector('.bg-black\\/60')
            if (backdrop) {
                await user.click(backdrop)
            }

            expect(onClose).not.toHaveBeenCalled()
        })
    })

    describe("Modal Structure & Accessibility", () => {
        it("renders danger icon", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            const dangerIcon = document.querySelector('svg')
            expect(dangerIcon).toBeInTheDocument()
        })

        it("has proper ARIA attributes", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            const modal = screen.getByRole("dialog")
            expect(modal).toHaveAttribute("aria-modal", "true")
            expect(modal).toHaveAttribute("aria-labelledby", "delete-account-title")
            expect(modal).toHaveAttribute("aria-describedby", "delete-account-description")
        })

        it("prevents body scroll when open", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            expect(document.body.style.overflow).toBe('hidden')
        })

        it("restores body scroll when closed", () => {
            const { unmount } = render(<DeleteAccountModal {...defaultProps} />)

            unmount()

            expect(document.body.style.overflow).toBe('unset')
        })

        it("applies correct button styling and sizes", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            const cancelButton = screen.getByRole("button", { name: "Cancelar" })
            const deleteButton = screen.getByRole("button", { name: "Eliminar cuenta" })

            expect(cancelButton).toHaveClass("btn-outline", "min-w-[160px]")
            expect(deleteButton).toHaveClass("btn-danger", "min-w-[160px]")
        })
    })

    describe("Backdrop Interaction", () => {
        it("calls onClose when backdrop is clicked", async () => {
            const onClose = vi.fn()
            const user = userEvent.setup()

            render(<DeleteAccountModal {...defaultProps} onClose={onClose} />)

            // Find backdrop element using more reliable selector
            const backdrop = document.querySelector('[aria-hidden="true"]')
            if (backdrop) {
                await user.click(backdrop)
            }

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe("Edge Cases", () => {
        it("handles multiple rapid delete clicks", async () => {
            const user = userEvent.setup()
            render(<DeleteAccountModal {...defaultProps} />)

            const deleteButton = screen.getByRole("button", { name: "Eliminar cuenta" })

            await user.click(deleteButton)
            await user.click(deleteButton)
            await user.click(deleteButton)

            // Should call multiple times (no built-in debouncing)
            expect(mockDeleteAccount).toHaveBeenCalledTimes(3)
        })

        it("maintains consistent modal positioning", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            const modal = screen.getByRole("dialog")
            expect(modal).toHaveClass("max-w-md", "w-full")
        })

        it("shows warning styling for dangerous action", () => {
            render(<DeleteAccountModal {...defaultProps} />)

            const iconContainer = document.querySelector('.bg-red-100')
            expect(iconContainer).toBeInTheDocument()

            const warningText = screen.getByText("Esta acción es irreversible.")
            expect(warningText).toHaveClass("text-red-600")
        })
    })
})