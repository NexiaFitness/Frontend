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
            // Default variant=primary: gradient + text-primary-foreground
            expect(button).toHaveClass("text-primary-foreground", "bg-gradient-to-r")
            // Default size=sm: h-9 px-3
            expect(button).toHaveClass("h-9", "px-3")
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
            expect(screen.getByRole("button")).toHaveClass("text-primary-foreground", "bg-gradient-to-r")
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
            expect(screen.getByRole("button")).toHaveClass("border-primary", "bg-transparent")
        })
    })

    describe("Sizes", () => {
        it("renders small size correctly", () => {
            render(<Button size="sm">Small</Button>)
            expect(screen.getByRole("button")).toHaveClass("h-9", "px-3")
        })

        it("renders medium size correctly", () => {
            render(<Button size="md">Medium</Button>)
            expect(screen.getByRole("button")).toHaveClass("h-9", "px-4")
        })

        it("renders large size correctly", () => {
            render(<Button size="lg">Large</Button>)
            // lg = h-9 px-8 (sizeStyles)
            expect(screen.getByRole("button")).toHaveClass("h-9", "px-8")
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
            expect(button).toHaveClass("disabled:pointer-events-none")
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
            expect(button).toHaveClass("text-primary-foreground")
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
            expect(button).toHaveClass("h-9", "px-8")
        })
    })
})