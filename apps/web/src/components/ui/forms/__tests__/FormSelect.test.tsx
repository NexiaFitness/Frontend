/**
 * FormSelect Component Test Suite
 *
 * Tests principales para el componente FormSelect:
 * - Renderizado básico
 * - Placeholder y opciones
 * - Selección de usuario
 * - Estilos condicionales (placeholder, error, helper, disabled)
 * - Accesibilidad (label, required, ids)
 * - ForwardRef
 *
 * Simplificado: sin duplicación excesiva ni tests redundantes.
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
    it("renders with options", () => {
        render(<FormSelect options={mockOptions} />)
        expect(screen.getByRole("combobox")).toBeInTheDocument()
        expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument()
    })

    it("handles user selection", async () => {
        const user = userEvent.setup()
        render(<FormSelect options={mockOptions} />)
        const select = screen.getByRole("combobox")
        await user.selectOptions(select, "option2")
        expect(select).toHaveValue("option2")
    })

    it("renders placeholder correctly", () => {
        render(<FormSelect options={mockOptions} placeholder="Choose one" />)
        const placeholderOption = screen.getByRole("option", { name: "Choose one" })
        expect(placeholderOption).toBeDisabled()
        expect(placeholderOption).toHaveAttribute("value", "")
    })

    it("applies muted text when no value selected", () => {
        render(
            <FormSelect
                options={mockOptions}
                placeholder="Select"
                value=""
                onChange={() => { }}
            />
        )
        expect(screen.getByRole("combobox")).toHaveClass("text-muted-foreground")
    })

    it("applies foreground text when value is selected", () => {
        render(
            <FormSelect
                options={mockOptions}
                value="option1"
                onChange={() => { }}
            />
        )
        expect(screen.getByRole("combobox")).toHaveClass("text-foreground")
    })

    it("shows label and associates it with select", () => {
        render(<FormSelect label="Country" options={mockOptions} />)
        expect(screen.getByText("Country")).toBeInTheDocument()
        expect(screen.getByLabelText("Country")).toBeInTheDocument()
    })

    it("shows required asterisk when isRequired is true", () => {
        render(<FormSelect label="Required" isRequired options={mockOptions} />)
        expect(screen.getByText("*")).toBeInTheDocument()
    })

    it("shows error message when provided", () => {
        render(<FormSelect error="This field is required" options={mockOptions} />)
        expect(screen.getByText("This field is required")).toBeInTheDocument()
    })

    it("shows helper text when provided and no error", () => {
        render(<FormSelect helperText="Helper" options={mockOptions} />)
        expect(screen.getByText("Helper")).toBeInTheDocument()
    })

    it("respects disabled state", () => {
        render(<FormSelect disabled options={mockOptions} />)
        expect(screen.getByRole("combobox")).toBeDisabled()
    })

    it("forwards ref correctly", () => {
        const ref = React.createRef<HTMLSelectElement>()
        render(<FormSelect ref={ref} options={mockOptions} />)
        expect(ref.current).toBeInstanceOf(HTMLSelectElement)
    })
})
