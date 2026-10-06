import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet I23", () => {
    it("atrapa Tab dentro del sheet y restaura el foco al cerrar", () => {
        const onClose = vi.fn();
        const trigger = document.createElement("button");
        trigger.textContent = "Abrir";
        document.body.appendChild(trigger);
        trigger.focus();

        const { rerender } = render(
            <BottomSheet isOpen title="Ayuda" onClose={onClose} footer={<button type="button">Listo</button>}>
                <button type="button">Primero</button>
            </BottomSheet>
        );

        const dialog = screen.getByRole("dialog", { name: "Ayuda" });
        expect(dialog).toHaveFocus();

        const first = screen.getByRole("button", { name: "Primero" });
        const last = screen.getByRole("button", { name: "Listo" });
        last.focus();
        fireEvent.keyDown(document, { key: "Tab" });
        expect(first).toHaveFocus();

        first.focus();
        fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
        expect(last).toHaveFocus();

        fireEvent.keyDown(document, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);

        rerender(
            <BottomSheet isOpen={false} title="Ayuda" onClose={onClose}>
                <button type="button">Primero</button>
            </BottomSheet>
        );
        expect(trigger).toHaveFocus();
        trigger.remove();
    });
});
