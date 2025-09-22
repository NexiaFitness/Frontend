/**
 * Button Component Test Suite
 *
 * Tests completos para el componente Button UI base.
 * Cubre variants, sizes, loading states, accessibility y forwardRef.
 * Componente crítico usado en toda la aplicación.
 *
 * @since v1.0.0
 */

import React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { Button } from "../Button"

describe("Button", () => {
    describe("Rendering & Basic Functionality", () => {
        it("renders with default props", () => {
            render(<Button>Test Button</Button>)

            const button = screen.getByRole("button", { name: "Test Button" })
            expect(button).toBeInTheDocument()
            expect(button).toHaveClass("bg-primary-600") // default primary variant
            expect(button).toHaveClass("px-4", "py-2") // default md size
        })

        it("renders children correctly", () => {
            render(<Button>Click me</Button>)
            expect(screen.getByText("Click me")).toBeInTheDocument()
        })

        it("handles click events", async () => {
            const handleClick = vi.fn()
            const user = userEvent.setup()

            render(<Button onClick={handleClick}>Clickable</Button>)
            await user.click(screen.getByRole("button"))
            expect(handleClick).toHaveBeenCalledTimes(1)
        })
    })

    describe("Variants", () => {
        it("renders primary variant correctly", () => {
            render(<Button variant="primary">Primary</Button>)
            expect(screen.getByRole("button")).toHaveClass("bg-primary-600", "text-white")
        })

        it("renders secondary variant correctly", () => {
            render(<Button variant="secondary">Secondary</Button>)
            expect(screen.getByRole("button")).toHaveClass("bg-white/20", "backdrop-blur-sm", "border", "border-white")
        })

        it("renders danger variant correctly", () => {
            render(<Button variant="danger">Danger</Button>)
            expect(screen.getByRole("button")).toHaveClass("bg-red-600", "text-white")
        })

        it("renders outline variant correctly", () => {
            render(<Button variant="outline">Outline</Button>)
            expect(screen.getByRole("button")).toHaveClass("bg-transparent", "border-2", "border-slate-800")
        })
    })

    describe("Sizes", () => {
        it("renders small size correctly", () => {
            render(<Button size="sm">Small</Button>)
            expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5", "text-sm")
        })

        it("renders medium size correctly", () => {
            render(<Button size="md">Medium</Button>)
            expect(screen.getByRole("button")).toHaveClass("px-4", "py-2", "text-base")
        })

        it("renders large size correctly", () => {
            render(<Button size="lg">Large</Button>)
            expect(screen.getByRole("button")).toHaveClass("px-5", "py-3", "text-lg")
        })
    })

    describe("Loading State", () => {
        it("renders spinner when isLoading is true", () => {
            render(<Button isLoading>Submit</Button>)

            // Spinner presente
            expect(screen.getByRole("button").querySelector("span")).toHaveClass("animate-spin")
            // El botón debe estar deshabilitado
            expect(screen.getByRole("button")).toBeDisabled()
            // Sigue mostrando el texto children
            expect(screen.getByText("Submit")).toBeInTheDocument()
        })

        it("prevents click events when loading", async () => {
            const handleClick = vi.fn()
            const user = userEvent.setup()

            render(<Button isLoading onClick={handleClick}>Submit</Button>)
            await user.click(screen.getByRole("button"))
            expect(handleClick).not.toHaveBeenCalled()
        })
    })

    describe("Disabled State", () => {
        it("disables button when disabled prop is true", () => {
            render(<Button disabled>Disabled</Button>)
            const button = screen.getByRole("button")
            expect(button).toBeDisabled()
            expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed")
        })

        it("prioritizes loading over disabled prop", () => {
            render(<Button isLoading disabled>Button</Button>)
            const button = screen.getByRole("button")
            expect(button).toBeDisabled()
            // Confirmamos que spinner existe
            expect(button.querySelector("span")).toHaveClass("animate-spin")
        })
    })

    describe("Custom Props & Styling", () => {
        it("applies custom className", () => {
            render(<Button className="custom-class">Styled</Button>)
            const button = screen.getByRole("button")
            expect(button).toHaveClass("custom-class")
            expect(button).toHaveClass("bg-primary-600")
        })

        it("passes through HTML button attributes", () => {
            render(<Button type="submit" title="Submit form">Submit</Button>)
            const button = screen.getByRole("button")
            expect(button).toHaveAttribute("type", "submit")
            expect(button).toHaveAttribute("title", "Submit form")
        })

        it("supports aria attributes for accessibility", () => {
            render(<Button aria-label="Close dialog" aria-describedby="help-text">X</Button>)
            const button = screen.getByRole("button")
            expect(button).toHaveAttribute("aria-label", "Close dialog")
            expect(button).toHaveAttribute("aria-describedby", "help-text")
        })
    })

    describe("ForwardRef", () => {
        it("forwards ref correctly", () => {
            const ref = React.createRef<HTMLButtonElement>()
            render(<Button ref={ref}>Ref Test</Button>)
            expect(ref.current).toBeInstanceOf(HTMLButtonElement)
            expect(ref.current).toHaveTextContent("Ref Test")
        })

        it("allows focus management through ref", () => {
            const ref = React.createRef<HTMLButtonElement>()
            render(<Button ref={ref}>Focus Test</Button>)
            ref.current?.focus()
            expect(ref.current).toHaveFocus()
        })
    })

    describe("Edge Cases", () => {
        it("handles empty children", () => {
            render(<Button></Button>)
            const button = screen.getByRole("button")
            expect(button).toBeInTheDocument()
        })

        it("handles complex children", () => {
            render(
                <Button>
                    <span>Icon</span>
                    <span>Text</span>
                </Button>
            )
            expect(screen.getByRole("button")).toHaveTextContent("IconText")
        })

        it("combines variant and size classes correctly", () => {
            render(<Button variant="danger" size="lg">Large Danger</Button>)
            const button = screen.getByRole("button")
            expect(button).toHaveClass("bg-red-600")
            expect(button).toHaveClass("px-5", "py-3", "text-lg")
        })
    })
})
