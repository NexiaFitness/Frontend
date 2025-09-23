/**
 * FormSelect Component Test Suite
 *
 * Tests completos para el componente FormSelect UI base.
 * Cubre options, placeholder, validación, accesibilidad y forwardRef.
 * Test directo sin MSW - componente UI puro.
 *
 * @since v2.0.0
 */

import React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { FormSelect, type SelectOption } from "../FormSelect"

const mockOptions: SelectOption[] = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3", disabled: true },
]

describe("FormSelect", () => {
    describe("Rendering & Basic Functionality", () => {
        it("renders with required options prop", () => {
            render(<FormSelect options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            expect(select).toBeInTheDocument()
            // Mobile-first: md size = px-3 py-2 text-sm en mobile
            expect(select).toHaveClass("px-3", "py-2", "text-sm")
            expect(select).toHaveClass("sm:px-4", "sm:py-2.5", "sm:text-base")
        })

        it("renders all provided options", () => {
            render(<FormSelect options={mockOptions} />)
            
            expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "Option 2" })).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "Option 3" })).toBeInTheDocument()
        })

        it("handles user selection correctly", async () => {
            const user = userEvent.setup()
            render(<FormSelect options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            await user.selectOptions(select, "option2")
            
            expect(select).toHaveValue("option2")
        })
    })

    describe("Placeholder", () => {
        it("shows placeholder when provided", () => {
            render(<FormSelect options={mockOptions} placeholder="Select an option" />)
            
            expect(screen.getByRole("option", { name: "Select an option" })).toBeInTheDocument()
        })

        it("placeholder option has empty value and is disabled", () => {
            render(<FormSelect options={mockOptions} placeholder="Choose one" />)
            
            const placeholderOption = screen.getByRole("option", { name: "Choose one" })
            expect(placeholderOption).toHaveAttribute("value", "")
            expect(placeholderOption).toBeDisabled()
        })

        it("applies gray text color when no value selected", () => {
            render(<FormSelect options={mockOptions} placeholder="Select" value="" />)
            
            const select = screen.getByRole("combobox")
            expect(select).toHaveClass("text-gray-400")
        })

        it("applies dark text color when value is selected", () => {
            render(<FormSelect options={mockOptions} value="option1" />)
            
            const select = screen.getByRole("combobox")
            expect(select).toHaveClass("text-gray-900")
        })
    })

    describe("Sizes", () => {
        it("renders small size correctly", () => {
            render(<FormSelect size="sm" options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            // sm = px-3 py-2 text-sm en mobile y sm+
            expect(select).toHaveClass("px-3", "py-2", "text-sm")
            expect(select).toHaveClass("min-h-[40px]")
        })

        it("renders medium size correctly", () => {
            render(<FormSelect size="md" options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            // md = px-3 py-2 text-sm en mobile, px-4 py-2.5 text-base en sm+
            expect(select).toHaveClass("px-3", "py-2", "text-sm")
            expect(select).toHaveClass("sm:px-4", "sm:py-2.5", "sm:text-base")
        })

        it("renders large size correctly", () => {
            render(<FormSelect size="lg" options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            // lg = px-4 py-2.5 text-base en mobile, px-5 py-3 text-lg en sm+
            expect(select).toHaveClass("px-4", "py-2.5", "text-base")
            expect(select).toHaveClass("sm:px-5", "sm:py-3", "sm:text-lg")
        })
    })

    describe("Labels & Accessibility", () => {
        it("renders label correctly", () => {
            render(<FormSelect label="Country" options={mockOptions} />)
            
            expect(screen.getByText("Country")).toBeInTheDocument()
            expect(screen.getByLabelText("Country")).toBeInTheDocument()
        })

        it("associates label with select using htmlFor", () => {
            render(<FormSelect label="Region" options={mockOptions} />)
            
            const label = screen.getByText("Region")
            const select = screen.getByLabelText("Region")
            
            expect(label).toHaveAttribute("for", select.id)
            expect(select).toHaveAttribute("id")
        })

        it("shows required asterisk when isRequired is true", () => {
            render(<FormSelect label="Required Field" isRequired options={mockOptions} />)
            
            expect(screen.getByText("*")).toBeInTheDocument()
            expect(screen.getByText("*")).toHaveClass("text-white")
        })

        it("does not show asterisk when isRequired is false", () => {
            render(<FormSelect label="Optional Field" isRequired={false} options={mockOptions} />)
            
            expect(screen.queryByText("*")).not.toBeInTheDocument()
        })

        it("generates unique id when no id provided", () => {
            render(
                <div>
                    <FormSelect label="Field 1" options={mockOptions} />
                    <FormSelect label="Field 2" options={mockOptions} />
                </div>
            )
            
            const select1 = screen.getByLabelText("Field 1")
            const select2 = screen.getByLabelText("Field 2")
            
            expect(select1.id).toBeTruthy()
            expect(select2.id).toBeTruthy()
            expect(select1.id).not.toBe(select2.id)
        })

        it("uses provided id when specified", () => {
            render(<FormSelect id="custom-select" label="Custom" options={mockOptions} />)
            
            const select = screen.getByLabelText("Custom")
            expect(select).toHaveAttribute("id", "custom-select")
        })
    })

    describe("Error States", () => {
        it("shows error message when error prop is provided", () => {
            render(<FormSelect error="This field is required" options={mockOptions} />)
            
            expect(screen.getByText("This field is required")).toBeInTheDocument()
        })

        it("applies error styling when error is present", () => {
            render(<FormSelect error="Error message" options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            expect(select).toHaveClass("border-red-500")
        })

        it("does not show error when error prop is undefined", () => {
            render(<FormSelect options={mockOptions} />)
            
            expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
        })

        it("prioritizes error over helper text", () => {
            render(
                <FormSelect 
                    error="Error message" 
                    helperText="Helper text" 
                    options={mockOptions} 
                />
            )
            
            expect(screen.getByText("Error message")).toBeInTheDocument()
            expect(screen.queryByText("Helper text")).not.toBeInTheDocument()
        })
    })

    describe("Helper Text", () => {
        it("shows helper text when provided and no error", () => {
            render(<FormSelect helperText="Choose your country" options={mockOptions} />)
            
            expect(screen.getByText("Choose your country")).toBeInTheDocument()
        })

        it("applies correct styling to helper text", () => {
            render(<FormSelect helperText="Helper message" options={mockOptions} />)
            
            const helperText = screen.getByText("Helper message")
            expect(helperText).toHaveClass("text-gray-500")
        })
    })

    describe("Disabled Options", () => {
        it("renders disabled option correctly", () => {
            render(<FormSelect options={mockOptions} />)
            
            const disabledOption = screen.getByRole("option", { name: "Option 3" })
            expect(disabledOption).toBeDisabled()
        })

        it("allows selection of enabled options", async () => {
            const user = userEvent.setup()
            render(<FormSelect options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            await user.selectOptions(select, "option1")
            
            expect(select).toHaveValue("option1")
        })
    })

    describe("Disabled State", () => {
        it("disables select when disabled prop is true", () => {
            render(<FormSelect disabled options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            expect(select).toBeDisabled()
            expect(select).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed")
        })

        it("prevents user interaction when disabled", async () => {
            const user = userEvent.setup()
            render(<FormSelect disabled options={mockOptions} value="option1" />)
            
            const select = screen.getByRole("combobox")
            await user.selectOptions(select, "option2")
            
            // Value should remain unchanged
            expect(select).toHaveValue("option1")
        })
    })

    describe("Custom Props & Styling", () => {
        it("applies custom className", () => {
            render(<FormSelect className="custom-class" options={mockOptions} />)
            
            const select = screen.getByRole("combobox")
            expect(select).toHaveClass("custom-class")
            expect(select).toHaveClass("block", "w-full") // Should still have base classes
        })

        it("passes through HTML select attributes", () => {
            render(
                <FormSelect 
                    options={mockOptions}
                    title="Select title"
                    data-testid="custom-select"
                />
            )
            
            const select = screen.getByRole("combobox")
            expect(select).toHaveAttribute("title", "Select title")
            expect(select).toHaveAttribute("data-testid", "custom-select")
        })
    })

    describe("ForwardRef", () => {
        it("forwards ref correctly", () => {
            const ref = React.createRef<HTMLSelectElement>()
            
            render(<FormSelect ref={ref} options={mockOptions} />)
            
            expect(ref.current).toBeInstanceOf(HTMLSelectElement)
        })

        it("allows focus management through ref", () => {
            const ref = React.createRef<HTMLSelectElement>()
            
            render(<FormSelect ref={ref} options={mockOptions} />)
            
            ref.current?.focus()
            expect(ref.current).toHaveFocus()
        })

        it("allows value access through ref", async () => {
            const ref = React.createRef<HTMLSelectElement>()
            const user = userEvent.setup()
            
            render(<FormSelect ref={ref} options={mockOptions} />)
            
            await user.selectOptions(ref.current!, "option2")
            expect(ref.current?.value).toBe("option2")
        })
    })

    describe("Edge Cases", () => {
        it("handles empty options array", () => {
            render(<FormSelect options={[]} placeholder="No options" />)
            
            const select = screen.getByRole("combobox")
            expect(select).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "No options" })).toBeInTheDocument()
        })

        it("handles options with special characters", () => {
            const specialOptions = [
                { value: "special", label: "Option with (parentheses)" },
                { value: "unicode", label: "Option with émojis 🚀" },
            ]
            
            render(<FormSelect options={specialOptions} />)
            
            expect(screen.getByRole("option", { name: "Option with (parentheses)" })).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "Option with émojis 🚀" })).toBeInTheDocument()
        })

        it("combines all props correctly", () => {
            render(
                <FormSelect
                    size="lg"
                    label="Country"
                    error="Invalid selection"
                    isRequired
                    helperText="This won't show due to error"
                    className="custom-class"
                    placeholder="Choose country"
                    disabled
                    options={mockOptions}
                    value="option1"
                />
            )
            
            const select = screen.getByRole("combobox")
            
            // lg size classes mobile-first
            expect(select).toHaveClass("px-4", "py-2.5", "text-base")
            expect(select).toHaveClass("sm:px-5", "sm:py-3", "sm:text-lg")
            expect(select).toHaveClass("border-red-500") // error state
            expect(select).toHaveClass("text-gray-900") // has value
            expect(select).toHaveClass("custom-class")
            expect(select).toBeDisabled()
            expect(select).toHaveValue("option1")
            
            expect(screen.getByText("Country")).toBeInTheDocument()
            expect(screen.getByText("*")).toBeInTheDocument() // required asterisk
            expect(screen.getByText("Invalid selection")).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "Choose country" })).toBeInTheDocument()
            expect(screen.queryByText("This won't show due to error")).not.toBeInTheDocument()
        })
    })
})