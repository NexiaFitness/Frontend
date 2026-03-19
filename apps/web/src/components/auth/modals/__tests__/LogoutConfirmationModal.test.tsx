/**
 * LogoutConfirmationModal Component Test Suite
 *
 * Tests para el modal de confirmación de logout.
 * Componente UI con estándares de typography y buttonStyles.
 *
 * @since v2.1.0
 * @updated v4.3.7 - Alineado con BUTTON_PRESETS.modalEqual
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { LogoutConfirmationModal } from "../LogoutConfirmationModal";
import type { ButtonHTMLAttributes, ReactNode } from "react";

vi.mock("@/components/ui/buttons", () => {
    type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: string;
        isLoading?: boolean;
        children?: ReactNode;
    };

    const MockButton = ({
        children,
        onClick,
        variant,
        className,
        disabled,
        isLoading,
        ...props
    }: ButtonProps) => (
        <button
            onClick={onClick}
            className={`btn-${variant ?? "default"} ${className ?? ""}`}
            disabled={Boolean(disabled || isLoading)}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Cerrando...
                </div>
            ) : (
                children
            )}
        </button>
    );

    return { Button: MockButton };
});

describe("LogoutConfirmationModal", () => {
    const defaultProps = {
        isOpen: true,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
        isLoading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Conditional Rendering", () => {
        it("renders nothing when isOpen is false", () => {
            render(<LogoutConfirmationModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText("¿Cerrar sesión?")).not.toBeInTheDocument();
        });

        it("renders modal when isOpen is true", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            expect(screen.getByText("¿Cerrar sesión?")).toBeInTheDocument();
            expect(
                screen.getByText("¿Seguro que deseas cerrar sesión?")
            ).toBeInTheDocument();
        });
    });

    describe("Content Display", () => {
        it("shows default message without username", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            expect(
                screen.getByText("¿Seguro que deseas cerrar sesión?")
            ).toBeInTheDocument();
            expect(
                screen.queryByText(/¿Seguro que quieres cerrar sesión,/)
            ).not.toBeInTheDocument();
        });

        it("shows personalized message with username", () => {
            render(
                <LogoutConfirmationModal {...defaultProps} userName="John Doe" />
            );

            expect(
                screen.getByText(/¿Seguro que quieres cerrar sesión, John Doe\?/)
            ).toBeInTheDocument();
        });

        it("handles empty username gracefully", () => {
            render(<LogoutConfirmationModal {...defaultProps} userName="" />);

            expect(
                screen.getByText("¿Seguro que deseas cerrar sesión?")
            ).toBeInTheDocument();
        });
    });

    describe("Button Interactions", () => {
        it("calls onCancel when cancel button is clicked", async () => {
            const onCancel = vi.fn();
            const user = userEvent.setup();

            render(<LogoutConfirmationModal {...defaultProps} onCancel={onCancel} />);

            await user.click(screen.getByText("Cancelar"));
            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it("calls onConfirm when confirm button is clicked", async () => {
            const onConfirm = vi.fn();
            const user = userEvent.setup();

            render(<LogoutConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

            await user.click(screen.getByText("Cerrar sesión"));
            expect(onConfirm).toHaveBeenCalledTimes(1);
        });
    });

    describe("Loading States", () => {
        it("shows loading text when isLoading is true", () => {
            render(<LogoutConfirmationModal {...defaultProps} isLoading={true} />);

            expect(screen.getByText("Cerrando...")).toBeInTheDocument();
            expect(
                screen.queryByText("Cerrar sesión")
            ).not.toBeInTheDocument();
        });

        it("disables buttons when loading", () => {
            render(<LogoutConfirmationModal {...defaultProps} isLoading={true} />);

            const cancelButton = screen.getByText("Cancelar");
            const confirmButton = screen.getByText("Cerrando...").closest("button");

            expect(cancelButton).toBeDisabled();
            expect(confirmButton).toBeDisabled();
        });

        it("shows normal text when not loading", () => {
            render(<LogoutConfirmationModal {...defaultProps} isLoading={false} />);

            expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
            expect(screen.queryByText("Cerrando...")).not.toBeInTheDocument();
        });
    });

    describe("Modal Structure", () => {
        it("renders warning icon", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            const warningIcon = document.querySelector("svg");
            expect(warningIcon).toBeInTheDocument();
        });

        it("renders backdrop", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            const backdrop = document.querySelector(".bg-black\\/60");
            expect(backdrop).toBeInTheDocument();
        });

        it("applies correct button styling", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            const cancelButton = screen.getByText("Cancelar");
            const confirmButton = screen.getByText("Cerrar sesión");

            expect(cancelButton).toHaveClass("btn-outline");
            expect(confirmButton).toHaveClass("btn-danger");
            expect(cancelButton).toHaveClass("w-full");
            expect(confirmButton).toHaveClass("w-full");
        });
    });

    describe("Accessibility", () => {
        it("prevents body scroll when open", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            expect(document.body.style.overflow).toBe("hidden");
        });

        it("restores body scroll when closed", () => {
            const { unmount } = render(<LogoutConfirmationModal {...defaultProps} />);

            unmount();

            expect(document.body.style.overflow).toBe("unset");
        });
    });

    describe("Edge Cases", () => {
        it("handles rapid button clicks", async () => {
            const onConfirm = vi.fn();
            const user = userEvent.setup();

            render(<LogoutConfirmationModal {...defaultProps} onConfirm={onConfirm} />);

            const confirmButton = screen.getByText("Cerrar sesión");

            await user.click(confirmButton);
            await user.click(confirmButton);
            await user.click(confirmButton);

            expect(onConfirm).toHaveBeenCalledTimes(3);
        });

        it("maintains consistent button sizes", () => {
            render(<LogoutConfirmationModal {...defaultProps} />);

            const cancelButton = screen.getByText("Cancelar");
            const confirmButton = screen.getByText("Cerrar sesión");

            expect(cancelButton).toHaveClass("sm:w-[160px]");
            expect(confirmButton).toHaveClass("sm:w-[160px]");
        });
    });
});
