/**
 * NexiaFormPieces.test.tsx — Piezas reutilizables de formulario de H10.
 *
 * Qué se prueba:
 * - NexiaSwitch: es un interruptor accesible y la etiqueta lo cambia.
 * - NexiaSearchPicker: busca sin acentos, enseña lo no elegible con su motivo, elige con
 *   teclado y devuelve el foco al botón al cerrar.
 * - LineListInput: Intro crea línea, Borrar en vacía la quita, pegar varias líneas reparte,
 *   no supera el máximo.
 * - NexiaSectionCard: en móvil se pliega con resumen y contador de errores.
 * Entorno: jsdom sin lg, así que el selector se abre como hoja (NexiaPremiumModal).
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { splitPastedLines } from "@nexia/shared";
import { NexiaSwitch } from "../NexiaSwitch";
import { NexiaSearchPicker } from "../NexiaSearchPicker";
import { LineListInput } from "../LineListInput";
import { NexiaSectionCard } from "@/components/ui/surface/NexiaSectionCard";

describe("NexiaSwitch", () => {
    it("es un interruptor y la etiqueta lo cambia", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<NexiaSwitch id="s" label="Revisado" checked={false} onChange={onChange} />);
        const control = screen.getByRole("switch", { name: "Revisado" });
        expect(control).toHaveAttribute("aria-checked", "false");
        await user.click(screen.getByText("Revisado"));
        expect(onChange).toHaveBeenCalledWith(true);
    });
});

describe("NexiaSearchPicker", () => {
    const options = [
        { value: 1, label: "Bíceps braquial" },
        { value: 2, label: "Braquial" },
        { value: 3, label: "Tríceps" },
    ];

    it("busca sin acentos, enseña lo no elegible y elige con teclado", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <NexiaSearchPicker
                title="Añadir sinergista"
                triggerLabel="Añadir"
                options={options}
                unavailable={new Map([[1, "Ya es objetivo"]])}
                onSelect={onSelect}
                searchPlaceholder="Buscar músculo"
                emptyText="Nada"
            />
        );
        const trigger = screen.getByRole("button", { name: "Añadir" });
        await user.click(trigger);
        const dialog = await screen.findByRole("dialog");
        const search = within(dialog).getByRole("combobox", { name: "Buscar músculo" });
        await user.type(search, "biceps");
        expect(within(dialog).getByRole("option", { name: /Bíceps braquial/ })).toHaveAttribute("aria-disabled", "true");
        expect(within(dialog).getByText("Ya es objetivo")).toBeInTheDocument();
        await user.clear(search);
        await user.type(search, "bra");
        await user.keyboard("{Enter}");
        expect(onSelect).toHaveBeenCalledWith(2);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it("sin resultados lo dice", async () => {
        const user = userEvent.setup();
        render(
            <NexiaSearchPicker
                title="Añadir"
                triggerLabel="Añadir"
                options={options}
                onSelect={vi.fn()}
                searchPlaceholder="Buscar"
                emptyText="Ningún músculo con ese nombre"
            />
        );
        await user.click(screen.getByRole("button", { name: "Añadir" }));
        await user.type(screen.getByRole("combobox", { name: "Buscar" }), "zzz");
        expect(screen.getByText("Ningún músculo con ese nombre")).toBeInTheDocument();
    });
});

function Lines({ initial, max = 5 }: { initial: string[]; max?: number }) {
    const [items, setItems] = useState(initial);
    return (
        <LineListInput
            id="steps"
            label="Ejecución"
            items={items}
            onChange={setItems}
            marker="number"
            itemLabel={(i) => `Paso ${i + 1}`}
            addLabel="Añadir paso"
            maxItems={max}
            minItems={1}
            splitPaste={splitPastedLines}
        />
    );
}

describe("LineListInput", () => {
    it("Intro crea la línea siguiente y Borrar en vacía la quita", async () => {
        const user = userEvent.setup();
        render(<Lines initial={["Uno"]} />);
        await user.click(screen.getByRole("textbox", { name: "Paso 1" }));
        await user.keyboard("{Enter}");
        expect(screen.getByRole("textbox", { name: "Paso 2" })).toHaveFocus();
        await user.keyboard("{Backspace}");
        expect(screen.queryByRole("textbox", { name: "Paso 2" })).not.toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Paso 1" })).toHaveFocus();
    });

    it("pegar varias líneas reparte una por campo, sin numeración y sin pasar del máximo", async () => {
        const user = userEvent.setup();
        render(<Lines initial={[""]} max={3} />);
        await user.click(screen.getByRole("textbox", { name: "Paso 1" }));
        await user.paste("1. A\n2. B\n3. C\n4. D");
        expect(screen.getAllByRole("textbox").map((f) => (f as HTMLTextAreaElement).value)).toEqual(["A", "B", "C"]);
        expect(screen.getByRole("button", { name: "Añadir paso" })).toBeDisabled();
    });

    it("con una sola línea, quitar la vacía", async () => {
        const user = userEvent.setup();
        render(<Lines initial={["Uno"]} />);
        await user.click(screen.getByRole("button", { name: "Quitar paso 1" }));
        expect(screen.getByRole("textbox", { name: "Paso 1" })).toHaveValue("");
    });
});

describe("NexiaSectionCard", () => {
    function Card() {
        const [open, setOpen] = useState(false);
        return (
            <NexiaSectionCard id="c" title="Técnica" open={open} onOpenChange={setOpen} summary="4 pasos" errorCount={2}>
                <p>Contenido</p>
            </NexiaSectionCard>
        );
    }

    it("en móvil se pliega con resumen y contador de errores", async () => {
        const user = userEvent.setup();
        render(<Card />);
        const toggle = screen.getByRole("button", { name: /Técnica/ });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText("4 pasos")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "2 errores" })).toBeInTheDocument();
        expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
        await user.click(toggle);
        expect(screen.getByText("Contenido")).toBeInTheDocument();
        expect(screen.queryByText("4 pasos")).not.toBeInTheDocument();
    });
});
