/**
 * ServerErrorBanner Component Test Suite
 *
 * Tests completos para el componente ServerErrorBanner.
 * Cubre conditional rendering, dismiss functionality y styling.
 * Componente simple de feedback usado en formularios.
 *
 * @since v1.0.0
 */

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { ServerErrorBanner } from "../ServerErrorBanner"

describe("ServerErrorBanner", () => {
    describe("Conditional Rendering", () => {
        it("renders nothing when error is null", () => {
            const { container } = render(<ServerErrorBanner error={null} />)

            expect(container.firstChild).toBeNull()
        })

        it("renders nothing when error is empty string", () => {
            const { container } = render(<ServerErrorBanner error="" />)

            expect(container.firstChild).toBeNull()
        })

        it("renders banner when error is provided", () => {
            render(<ServerErrorBanner error="Something went wrong" />)

            expect(screen.getByText("Something went wrong")).toBeInTheDocument()
        })
    })

    describe("Error Message Display", () => {
        it("displays the error message correctly", () => {
            render(<ServerErrorBanner error="Network connection failed" />)

            const errorText = screen.getByText("Network connection failed")
            expect(errorText).toBeInTheDocument()
            expect(errorText).toHaveClass("text-red-800", "text-sm", "font-medium")
        })

        it("handles long error messages", () => {
            const longError = "This is a very long error message that should still be displayed correctly even though it contains many words and describes a complex error scenario"

            render(<ServerErrorBanner error={longError} />)

            expect(screen.getByText(longError)).toBeInTheDocument()
        })

        it("handles error messages with special characters", () => {
            const specialError = "Error: Invalid input (code: 400) - Please try again!"

            render(<ServerErrorBanner error={specialError} />)

            expect(screen.getByText(specialError)).toBeInTheDocument()
        })
    })

    describe("Styling & Layout", () => {
        it("applies correct container styling", () => {
            render(<ServerErrorBanner error="Test error" />)

            const container = screen.getByText("Test error").parentElement
            expect(container).toHaveClass(
                "bg-red-50",
                "border",
                "border-red-200",
                "rounded-lg",
                "p-4",
                "relative"
            )
        })

        it("applies correct text styling", () => {
            render(<ServerErrorBanner error="Styled error" />)

            const errorText = screen.getByText("Styled error")
            expect(errorText).toHaveClass("text-red-800", "text-sm", "font-medium")
        })
    })

    describe("Dismiss Functionality", () => {
        it("shows dismiss button when onDismiss is provided", () => {
            const mockDismiss = vi.fn()
            render(<ServerErrorBanner error="Dismissible error" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")
            expect(dismissButton).toBeInTheDocument()
            expect(dismissButton).toHaveTextContent("×")
        })

        it("does not show dismiss button when onDismiss is not provided", () => {
            render(<ServerErrorBanner error="Non-dismissible error" />)

            expect(screen.queryByRole("button")).not.toBeInTheDocument()
        })

        it("calls onDismiss when dismiss button is clicked", async () => {
            const mockDismiss = vi.fn()
            const user = userEvent.setup()

            render(<ServerErrorBanner error="Clickable error" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")
            await user.click(dismissButton)

            expect(mockDismiss).toHaveBeenCalledTimes(1)
        })

        it("applies correct dismiss button styling", () => {
            const mockDismiss = vi.fn()
            render(<ServerErrorBanner error="Styled dismiss" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")
            expect(dismissButton).toHaveClass(
                "absolute",
                "top-3",
                "right-3",
                "text-red-400",
                "hover:text-red-600",
                "text-sm"
            )
        })

        it("has correct button type attribute", () => {
            const mockDismiss = vi.fn()
            render(<ServerErrorBanner error="Button type test" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")
            expect(dismissButton).toHaveAttribute("type", "button")
        })
    })

    describe("Accessibility", () => {
        it("dismiss button is keyboard accessible", async () => {
            const mockDismiss = vi.fn()
            const user = userEvent.setup()

            render(<ServerErrorBanner error="Keyboard test" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")
            dismissButton.focus()

            expect(dismissButton).toHaveFocus()

            await user.keyboard("{Enter}")
            expect(mockDismiss).toHaveBeenCalledTimes(1)
        })

        it("dismiss button responds to space key", async () => {
            const mockDismiss = vi.fn()
            const user = userEvent.setup()

            render(<ServerErrorBanner error="Space key test" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")
            dismissButton.focus()

            await user.keyboard(" ")
            expect(mockDismiss).toHaveBeenCalledTimes(1)
        })
    })

    describe("Multiple Interactions", () => {
        it("can be dismissed multiple times if re-rendered", async () => {
            const mockDismiss = vi.fn()
            const user = userEvent.setup()

            const { rerender } = render(
                <ServerErrorBanner error="First error" onDismiss={mockDismiss} />
            )

            await user.click(screen.getByRole("button"))
            expect(mockDismiss).toHaveBeenCalledTimes(1)

            // Simulate re-render with new error
            rerender(<ServerErrorBanner error="Second error" onDismiss={mockDismiss} />)

            await user.click(screen.getByRole("button"))
            expect(mockDismiss).toHaveBeenCalledTimes(2)
        })

        it("maintains state consistency across rapid clicks", async () => {
            const mockDismiss = vi.fn()
            const user = userEvent.setup()

            render(<ServerErrorBanner error="Rapid click test" onDismiss={mockDismiss} />)

            const dismissButton = screen.getByRole("button")

            // Rapid multiple clicks
            await user.click(dismissButton)
            await user.click(dismissButton)
            await user.click(dismissButton)

            expect(mockDismiss).toHaveBeenCalledTimes(3)
        })
    })

    describe("Edge Cases", () => {
        it("handles undefined error gracefully", () => {
            const { container } = render(<ServerErrorBanner error={undefined} />)

            expect(container.firstChild).toBeNull()
        })

        it("handles whitespace-only error", () => {
            const { container } = render(<ServerErrorBanner error="   " />)

            const errorContainer = container.querySelector(".bg-red-50")
            expect(errorContainer).toBeInTheDocument()
        })


        it("works with error containing HTML-like content", () => {
            const htmlError = "Error: <script>alert('xss')</script> not allowed"

            render(<ServerErrorBanner error={htmlError} />)

            // Should render as text, not execute as HTML
            expect(screen.getByText(htmlError)).toBeInTheDocument()
        })

        it("handles error with newlines and special formatting", () => {
            const formattedError = "Line 1\nLine 2\tTabbed content"

            render(<ServerErrorBanner error={formattedError} />)

            // Testing Library normalizes whitespace, so check for parts of the content
            expect(screen.getByText(/Line 1/)).toBeInTheDocument()
            expect(screen.getByText(/Line 2/)).toBeInTheDocument()
            expect(screen.getByText(/Tabbed content/)).toBeInTheDocument()
        })
    })
})