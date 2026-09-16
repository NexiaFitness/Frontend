/**
 * NexiaPremiumConfirmModal — confirmación premium (a11y básica).
 */

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { NexiaPremiumConfirmModal } from "../NexiaPremiumConfirmModal";

describe("NexiaPremiumConfirmModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: "Eliminar sesión",
        description: "¿Seguro?",
        confirmLabel: "Eliminar",
    };

    it("renders title and actions when open", () => {
        render(<NexiaPremiumConfirmModal {...defaultProps} />);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Eliminar sesión")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
    });

    it("calls onConfirm when confirm clicked", async () => {
        const onConfirm = vi.fn();
        const user = userEvent.setup();
        render(<NexiaPremiumConfirmModal {...defaultProps} onConfirm={onConfirm} />);
        await user.click(screen.getByRole("button", { name: "Eliminar" }));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not render when closed", () => {
        render(<NexiaPremiumConfirmModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
