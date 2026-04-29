/**
 * Input Component Test Suite
 *
 * Tests completos para el componente Input UI base.
 * Cubre tipos, tamaños, validación, accesibilidad y forwardRef.
 * Componente crítico usado en todos los formularios.
 *
 * @since v1.0.0
 */

import React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { Input } from "../Input"

describe("Input", () => {
    describe("Rendering & Basic Functionality", () => {
        it("renders with default props", () => {
            render(<Input placeholder="Test input" />)
            
            const input = screen.getByPlaceholderText("Test input")
            expect(input).toBeInTheDocument()
            expect(input).toHaveAttribute("type", "text") // default type
            // Default size = sm: h-9 px-3 py-1.5 text-sm
            expect(input).toHaveClass("h-9", "px-3", "py-1.5", "text-sm")
        })

        it("renders with custom placeholder", () => {
            render(<Input placeholder="Enter your email" />)
            
            expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument()
        })

        it("handles user input correctly", async () => {
            const user = userEvent.setup()
            render(<Input placeholder="Type here" />)
            
            const input = screen.getByPlaceholderText("Type here")
            await user.type(input, "Hello World")
            
            expect(input).toHaveValue("Hello World")
        })
    })

    describe("Input Types", () => {
        it("renders text type correctly", () => {
            render(<Input type="text" placeholder="Text input" />)
            
            const input = screen.getByPlaceholderText("Text input")
            expect(input).toHaveAttribute("type", "text")
        })

        it("renders email type correctly", () => {
            render(<Input type="email" placeholder="Email input" />)
            
            const input = screen.getByPlaceholderText("Email input")
            expect(input).toHaveAttribute("type", "email")
        })

        it("renders password type correctly", () => {
            render(<Input type="password" placeholder="Password input" />)
            
            const input = screen.getByPlaceholderText("Password input")
            expect(input).toHaveAttribute("type", "password")
        })
    })

    describe("Sizes", () => {
        it("renders small size correctly", () => {
            render(<Input size="sm" placeholder="Small input" />)
            
            const input = screen.getByPlaceholderText("Small input")
            // sm = h-9 px-3 py-1.5 text-sm
            expect(input).toHaveClass("h-9", "px-3", "py-1.5", "text-sm")
        })

        it("renders medium size correctly", () => {
            render(<Input size="md" placeholder="Medium input" />)
            
            const input = screen.getByPlaceholderText("Medium input")
            // md = h-9 px-4 py-1.5 text-sm
            expect(input).toHaveClass("h-9", "px-4", "py-1.5", "text-sm")
        })

        it("renders large size correctly", () => {
            render(<Input size="lg" placeholder="Large input" />)
            
            const input = screen.getByPlaceholderText("Large input")
            // lg = h-9 px-5 py-1.5 text-sm
            expect(input).toHaveClass("h-9", "px-5", "py-1.5", "text-sm")
        })
    })

    describe("Labels & Accessibility", () => {
        it("renders label correctly", () => {
            render(<Input label="Email Address" placeholder="Enter email" />)
            
            expect(screen.getByText("Email Address")).toBeInTheDocument()
            expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
        })

        it("associates label with input using htmlFor", () => {
            render(<Input label="Username" placeholder="Enter username" />)
            
            const label = screen.getByText("Username")
            const input = screen.getByLabelText("Username")
            
            expect(label).toHaveAttribute("for", input.id)
            expect(input).toHaveAttribute("id")
        })

        it("shows required asterisk when isRequired is true", () => {
            render(<Input label="Required Field" isRequired placeholder="Required input" />)
            
            expect(screen.getByText("*")).toBeInTheDocument()
            expect(screen.getByText("*")).toHaveClass("text-destructive")
        })

        it("does not show asterisk when isRequired is false", () => {
            render(<Input label="Optional Field" isRequired={false} placeholder="Optional input" />)
            
            expect(screen.queryByText("*")).not.toBeInTheDocument()
        })

        it("generates unique id when no id provided", () => {
            render(
                <div>
                    <Input label="Field 1" placeholder="Input 1" />
                    <Input label="Field 2" placeholder="Input 2" />
                </div>
            )
            
            const input1 = screen.getByPlaceholderText("Input 1")
            const input2 = screen.getByPlaceholderText("Input 2")
            
            expect(input1.id).toBeTruthy()
            expect(input2.id).toBeTruthy()
            expect(input1.id).not.toBe(input2.id)
        })

        it("uses provided id when specified", () => {
            render(<Input id="custom-id" placeholder="Custom ID input" />)
            
            const input = screen.getByPlaceholderText("Custom ID input")
            expect(input).toHaveAttribute("id", "custom-id")
        })
    })

    describe("Error States", () => {
        it("shows error message when error prop is provided", () => {
            render(<Input error="This field is required" placeholder="Error input" />)
            
            expect(screen.getByTestId("input-error")).toBeInTheDocument()
            expect(screen.getByText("This field is required")).toBeInTheDocument()
        })

        it("applies error styling when error is present", () => {
            render(<Input error="Error message" placeholder="Error input" />)
            
            const input = screen.getByPlaceholderText("Error input")
            expect(input).toHaveClass("border-destructive")
        })

        it("does not show error when error prop is undefined", () => {
            render(<Input placeholder="No error input" />)
            
            expect(screen.queryByTestId("input-error")).not.toBeInTheDocument()
        })

        it("prioritizes error over helper text", () => {
            render(
                <Input 
                    error="Error message" 
                    helperText="Helper text" 
                    placeholder="Priority test" 
                />
            )
            
            expect(screen.getByText("Error message")).toBeInTheDocument()
            expect(screen.queryByText("Helper text")).not.toBeInTheDocument()
        })
    })

    describe("Helper Text", () => {
        it("shows helper text when provided and no error", () => {
            render(<Input helperText="This is helpful information" placeholder="Helper input" />)
            
            expect(screen.getByText("This is helpful information")).toBeInTheDocument()
        })

        it("applies correct styling to helper text", () => {
            render(<Input helperText="Helper message" placeholder="Helper input" />)
            
            const helperText = screen.getByText("Helper message")
            expect(helperText).toHaveClass("text-muted-foreground")
        })
    })

    describe("Disabled State", () => {
        it("disables input when disabled prop is true", () => {
            render(<Input disabled placeholder="Disabled input" />)
            
            const input = screen.getByPlaceholderText("Disabled input")
            expect(input).toBeDisabled()
            expect(input).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed")
        })

        it("prevents user input when disabled", async () => {
            const user = userEvent.setup()
            render(<Input disabled placeholder="Disabled input" />)
            
            const input = screen.getByPlaceholderText("Disabled input")
            await user.type(input, "Should not work")
            
            expect(input).toHaveValue("")
        })
    })

    describe("Custom Props & Styling", () => {
        it("applies custom className", () => {
            render(<Input className="custom-class" placeholder="Custom styled" />)
            
            const input = screen.getByPlaceholderText("Custom styled")
            expect(input).toHaveClass("custom-class")
            expect(input).toHaveClass("block", "w-full") // Should still have base classes
        })

        it("passes through HTML input attributes", () => {
            render(
                <Input 
                    placeholder="Attribute test"
                    maxLength={10}
                    readOnly
                    title="Input title"
                />
            )
            
            const input = screen.getByPlaceholderText("Attribute test")
            expect(input).toHaveAttribute("maxLength", "10")
            expect(input).toHaveAttribute("readOnly")
            expect(input).toHaveAttribute("title", "Input title")
        })
    })

    describe("ForwardRef", () => {
        it("forwards ref correctly", () => {
            const ref = React.createRef<HTMLInputElement>()
            
            render(<Input ref={ref} placeholder="Ref test" />)
            
            expect(ref.current).toBeInstanceOf(HTMLInputElement)
            expect(ref.current).toHaveAttribute("placeholder", "Ref test")
        })

        it("allows focus management through ref", () => {
            const ref = React.createRef<HTMLInputElement>()
            
            render(<Input ref={ref} placeholder="Focus test" />)
            
            ref.current?.focus()
            expect(ref.current).toHaveFocus()
        })

        it("allows value access through ref", async () => {
            const ref = React.createRef<HTMLInputElement>()
            const user = userEvent.setup()
            
            render(<Input ref={ref} placeholder="Value test" />)
            
            await user.type(ref.current!, "Test value")
            expect(ref.current?.value).toBe("Test value")
        })
    })

    describe("Edge Cases", () => {
        it("handles empty label gracefully", () => {
            render(<Input label="" placeholder="Empty label" />)
            
            const input = screen.getByPlaceholderText("Empty label")
            expect(input).toBeInTheDocument()
        })

        it("handles long error messages", () => {
            const longError = "This is a very long error message that should still be displayed correctly even though it contains many words and characters"
            
            render(<Input error={longError} placeholder="Long error" />)
            
            expect(screen.getByText(longError)).toBeInTheDocument()
        })

        it("combines all props correctly", () => {
            render(
                <Input
                    type="email"
                    size="lg"
                    label="Email Address"
                    error="Invalid email"
                    isRequired
                    helperText="This won't show due to error"
                    className="custom-class"
                    placeholder="Complex input"
                    disabled
                />
            )
            
            const input = screen.getByPlaceholderText("Complex input")
            
            expect(input).toHaveAttribute("type", "email")
            // lg size classes
            expect(input).toHaveClass("h-9", "px-5", "py-1.5", "text-sm")
            expect(input).toHaveClass("border-destructive")
            expect(input).toHaveClass("custom-class")
            expect(input).toBeDisabled()
            
            expect(screen.getByText("Email Address")).toBeInTheDocument()
            expect(screen.getByText("*")).toBeInTheDocument() // required asterisk
            expect(screen.getByText("Invalid email")).toBeInTheDocument()
            expect(screen.queryByText("This won't show due to error")).not.toBeInTheDocument()
        })
    })
})