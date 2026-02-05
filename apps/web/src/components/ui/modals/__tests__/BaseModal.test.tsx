/**
 * BaseModal Test Suite — Cobertura de accesibilidad y comportamiento.
 *
 * Se valida:
 * - Render condicional (isOpen).
 * - Iconos según variant (danger, warning, info, success).
 * - Eventos de cierre: backdrop, ESC, closeOnBackdrop/closeOnEsc.
 * - Scroll lock (body overflow).
 * - Auto-focus en apertura.
 *
 * @since v4.2.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { BaseModal } from "../BaseModal";

describe("BaseModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        title: "Título de prueba",
        description: "Descripción de prueba",
    };

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.style.overflow = "unset";
    });

    describe("Rendering", () => {
        it("no renderiza nada si isOpen es false", () => {
            render(<BaseModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByRole("heading", { name: "Título de prueba" })).not.toBeInTheDocument();
        });

        it("renderiza título y descripción cuando está abierto", () => {
            render(<BaseModal {...defaultProps} />);
            expect(screen.getByRole("heading", { name: "Título de prueba" })).toBeInTheDocument();
            expect(screen.getByText("Descripción de prueba")).toBeInTheDocument();
        });

        it("renderiza children personalizados", () => {
            render(
                <BaseModal {...defaultProps}>
                    <button>Botón interno</button>
                </BaseModal>
            );
            expect(screen.getByRole("button", { name: "Botón interno" })).toBeInTheDocument();
        });
    });

    describe("Iconos", () => {
        it("muestra icono de warning", () => {
            render(<BaseModal {...defaultProps} iconType="warning" />);
            expect(document.querySelector(".text-amber-600")).toBeInTheDocument();
        });

        it("muestra icono de danger", () => {
            render(<BaseModal {...defaultProps} iconType="danger" />);
            expect(document.querySelector(".text-red-600")).toBeInTheDocument();
        });

        it("muestra icono de info", () => {
            render(<BaseModal {...defaultProps} iconType="info" />);
            expect(document.querySelector(".text-blue-600")).toBeInTheDocument();
        });

        it("muestra icono de success", () => {
            render(<BaseModal {...defaultProps} iconType="success" />);
            expect(document.querySelector(".text-green-600")).toBeInTheDocument();
        });
    });

    describe("Backdrop", () => {
        it("llama a onClose al hacer click en backdrop si closeOnBackdrop=true", async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            render(<BaseModal {...defaultProps} onClose={onClose} />);
            const backdrop = document.querySelector('[aria-hidden="true"]')!;
            await user.click(backdrop);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("no cierra al hacer click en backdrop si closeOnBackdrop=false", async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            render(<BaseModal {...defaultProps} onClose={onClose} closeOnBackdrop={false} />);
            const backdrop = document.querySelector('[aria-hidden="true"]')!;
            await user.click(backdrop);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe("Keyboard", () => {
        it("cierra al pulsar ESC si closeOnEsc=true", async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            render(<BaseModal {...defaultProps} onClose={onClose} />);
            await user.keyboard("{Escape}");
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("no cierra al pulsar ESC si closeOnEsc=false", async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            render(<BaseModal {...defaultProps} onClose={onClose} closeOnEsc={false} />);
            await user.keyboard("{Escape}");
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe("Scroll lock", () => {
        it("bloquea scroll al abrir y lo restaura al cerrar", () => {
            const { unmount } = render(<BaseModal {...defaultProps} />);
            expect(document.body.style.overflow).toBe("hidden");
            unmount();
            expect(document.body.style.overflow).toBe("unset");
        });
    });

    describe("Focus", () => {
        it("enfoca el modal automáticamente si autoFocus=true", async () => {
            render(<BaseModal {...defaultProps} autoFocus />);
            await waitFor(() => {
                expect(screen.getByRole("dialog")).toHaveFocus();
            });
        });

        it("no enfoca automáticamente si autoFocus=false", async () => {
            render(<BaseModal {...defaultProps} autoFocus={false} />);
            await waitFor(() => {
                expect(screen.getByRole("dialog")).not.toHaveFocus();
            });
        });
    });
});
