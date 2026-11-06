/**
 * FormCombobox — identificadores ARIA por instancia y foco del disparador.
 * Dos listas abiertas no pueden compartir id. Elegir o Escape devuelve el foco.
 */

import { useState } from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { FormCombobox, type ComboboxOption } from "../FormCombobox";
import { NexiaPremiumModal } from "@/components/ui/modals";

const OPTIONS: ComboboxOption[] = [
    { value: "lumbar", label: "Columna Lumbar" },
    { value: "toracica", label: "Columna Toracica" },
    { value: "cervical", label: "Columna Cervical" },
];

function TwoComboboxes() {
    const [joint, setJoint] = useState("");
    const [movement, setMovement] = useState("");
    return (
        <>
            <FormCombobox
                ariaLabel="Articulación"
                value={joint}
                onChange={setJoint}
                options={OPTIONS}
            />
            <FormCombobox
                ariaLabel="Movimiento"
                value={movement}
                onChange={setMovement}
                options={OPTIONS}
            />
        </>
    );
}

describe("FormCombobox", () => {
    it("dos instancias sin id tienen referencias ARIA distintas", async () => {
        const user = userEvent.setup();
        render(<TwoComboboxes />);
        const joint = screen.getByRole("button", { name: "Articulación" });
        const movement = screen.getByRole("button", { name: "Movimiento" });

        joint.focus();
        await user.keyboard("{ArrowDown}");
        movement.focus();
        await user.keyboard("{ArrowDown}");

        const listboxes = screen.getAllByRole("listbox");
        expect(listboxes).toHaveLength(2);
        const ids = listboxes.map((node) => node.id);
        expect(new Set(ids).size).toBe(2);
        expect(ids.every((value) => value.length > 0)).toBe(true);
        expect(joint).toHaveAttribute("aria-controls", ids[0]);
        expect(movement).toHaveAttribute("aria-controls", ids[1]);
        expect(joint.getAttribute("aria-activedescendant")).not.toBe(
            movement.getAttribute("aria-activedescendant"),
        );

        await user.keyboard("{ArrowDown}{Enter}");
        expect(movement).toHaveTextContent("Columna Toracica");
        expect(document.activeElement).toBe(movement);
        expect(screen.getAllByRole("listbox")).toHaveLength(1);

        joint.focus();
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(document.activeElement).toBe(joint);
    });

    it("el clic en una opción devuelve el foco al disparador", async () => {
        const user = userEvent.setup();
        render(<TwoComboboxes />);
        const joint = screen.getByRole("button", { name: "Articulación" });
        await user.click(joint);
        await user.click(screen.getByRole("option", { name: "Columna Lumbar" }));
        expect(joint).toHaveTextContent("Columna Lumbar");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(document.activeElement).toBe(joint);
    });

    it("respeta el id explícito", async () => {
        const user = userEvent.setup();
        render(
            <FormCombobox
                id="articulacion"
                ariaLabel="Articulación"
                value=""
                onChange={() => undefined}
                options={OPTIONS}
            />,
        );
        const trigger = screen.getByRole("button", { name: "Articulación" });
        expect(trigger).toHaveAttribute("id", "articulacion");
        await user.click(trigger);
        expect(screen.getByRole("listbox")).toHaveAttribute("id", "articulacion-listbox");
        expect(screen.getByRole("option", { name: "Columna Lumbar" })).toHaveAttribute(
            "id",
            "articulacion-option-0",
        );
    });

    it("Escape cierra la lista y deja el modal abierto", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <NexiaPremiumModal isOpen onClose={onClose} title="Editar lesión">
                <FormCombobox
                    ariaLabel="Articulación"
                    value=""
                    onChange={() => undefined}
                    options={OPTIONS}
                />
            </NexiaPremiumModal>,
        );
        await new Promise((resolve) => setTimeout(resolve, 150));
        const trigger = screen.getByRole("button", { name: "Articulación" });
        trigger.focus();
        await user.keyboard("{ArrowDown}{Escape}");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole("dialog", { name: "Editar lesión" })).toBeInTheDocument();
        expect(document.activeElement).toBe(trigger);
    });
});
