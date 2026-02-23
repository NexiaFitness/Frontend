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
            expect(button).toHaveClass("bg-primary")
            // Mobile-first: md size = px-3 py-2 text-sm en mobile
            expect(button).toHaveClass("px-3", "py-2", "text-sm")
            expect(button).toHaveClass("sm:px-4", "sm:py-2.5", "sm:text-base")
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
            expect(screen.getByRole("button")).toHaveClass("bg-primary", "text-primary-foreground")
        })

        it("renders secondary variant correctly", () => {
            render(<Button variant="secondary">Secondary</Button>)
            expect(screen.getByRole("button")).toHaveClass("bg-secondary", "text-secondary-foreground")
        })

        it("renders danger variant correctly", () => {
            render(<Button variant="danger">Danger</Button>)
            expect(screen.getByRole("button")).toHaveClass("bg-destructive", "text-destructive-foreground")
        })

        it("renders outline variant correctly", () => {
            render(<Button variant="outline">Outline</Button>)
            expect(screen.getByRole("button")).toHaveClass("border-input", "bg-background")
        })
    })

    describe("Sizes", () => {
        it("renders small size correctly", () => {
            render(<Button size="sm">Small</Button>)
            // sm = px-3 py-2 text-sm en mobile y sm+
            expect(screen.getByRole("button")).toHaveClass("px-3", "py-2", "text-sm")
            expect(screen.getByRole("button")).toHaveClass("min-h-[40px]")
        })

        it("renders medium size correctly", () => {
            render(<Button size="md">Medium</Button>)
            // md = px-3 py-2 text-sm en mobile, px-4 py-2.5 text-base en sm+
            expect(screen.getByRole("button")).toHaveClass("px-3", "py-2", "text-sm")
            expect(screen.getByRole("button")).toHaveClass("sm:px-4", "sm:py-2.5", "sm:text-base")
        })

        it("renders large size correctly", () => {
            render(<Button size="lg">Large</Button>)
            // lg = px-4 py-2.5 text-base en mobile, px-5 py-3 text-lg en sm+
            expect(screen.getByRole("button")).toHaveClass("px-4", "py-2.5", "text-base")
            expect(screen.getByRole("button")).toHaveClass("sm:px-5", "sm:py-3", "sm:text-lg")
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
            expect(button).toHaveClass("disabled:opacity-50", "disabled:pointer-events-none")
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
            expect(button).toHaveClass("bg-primary")
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
            expect(button).toHaveClass("bg-destructive")
            // lg size classes mobile-first
            expect(button).toHaveClass("px-4", "py-2.5", "text-base")
            expect(button).toHaveClass("sm:px-5", "sm:py-3", "sm:text-lg")
        })
    })
})