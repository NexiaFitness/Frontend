/**
 * TrainingSessionDeleteConfirmModal.test.tsx — B-04: 409 visible y el diálogo se cierra.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render } from "@/test-utils/render";

import { TrainingSessionDeleteConfirmModal } from "./TrainingSessionDeleteConfirmModal";
import {
    SESSION_DELETE_ACK_LABEL,
    SESSION_DELETE_BLOCKED_TITLE,
} from "./sessionDeleteDialogPresentation";

describe("TrainingSessionDeleteConfirmModal", () => {
    it("un 409 enseña el motivo y Entendido cierra el diálogo", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onDeleted = vi.fn();
        const detail =
            "No se puede eliminar una sesion que ya fue ejecutada, completada o archivada";
        const onConfirmDelete = vi.fn().mockRejectedValue({
            status: 409,
            data: { detail },
        });

        render(
            <TrainingSessionDeleteConfirmModal
                isOpen
                sessionName="Fuerza · martes"
                isDeleting={false}
                onClose={onClose}
                onConfirmDelete={onConfirmDelete}
                onDeleted={onDeleted}
            />,
        );

        await user.click(screen.getByRole("button", { name: "Eliminar" }));

        expect(
            await screen.findByRole("heading", { name: SESSION_DELETE_BLOCKED_TITLE }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "No se puede eliminar una sesión que ya fue ejecutada, completada o archivada",
            ),
        ).toBeInTheDocument();
        expect(onDeleted).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        await user.click(
            screen.getByRole("button", { name: SESSION_DELETE_ACK_LABEL }),
        );
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
