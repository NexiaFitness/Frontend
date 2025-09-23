/**
 * DeleteAccountModal Test Suite - Professional MSW Coverage
 *
 * Tests de integración siguiendo metodología híbrida MSW establecida.
 * Integration test pattern - usa componentes reales sin mocks inline.
 *
 * @author Frontend Team
 * @since v2.3.0
 * @updated v4.3.7 - Validación de estilos ajustada a BUTTON_PRESETS.modalEqual
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { DeleteAccountModal } from "../DeleteAccountModal";
import { server } from "@/test-utils/utils/msw";
import {
    deleteAccountErrorHandler,
    deleteAccountTimeoutHandler,
    deleteAccountNetworkErrorHandler,
    deleteAccountRetryHandler,
} from "@/test-utils/mocks/handlers/accountHandlers";
import { clearRouterMocks } from "@/test-utils/mocks";

describe("DeleteAccountModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onDeleteSuccess: vi.fn(),
    };

    beforeEach(() => {
        clearRouterMocks();
        vi.clearAllMocks();
        document.body.style.overflow = "unset";
    });

    describe("Rendering & Basic UI", () => {
        it("renders nothing when isOpen is false", () => {
            const { container } = render(
                <DeleteAccountModal {...defaultProps} isOpen={false} />
            );
            expect(container.firstChild).toBeNull();
        });

        it("renders modal when isOpen is true", () => {
            render(<DeleteAccountModal {...defaultProps} />);
            expect(screen.getByRole("heading", { name: "Eliminar cuenta" })).toBeInTheDocument();
            expect(screen.getByText("Esta acción es irreversible.")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Eliminar cuenta" })).toBeInTheDocument();
        });

        it("shows danger icon and warning styling", () => {
            render(<DeleteAccountModal {...defaultProps} />);
            const dangerIcon = document.querySelector("svg");
            expect(dangerIcon).toBeInTheDocument();
            const warningText = screen.getByText("Esta acción es irreversible.");
            expect(warningText).toHaveClass("text-red-600");
        });
    });

    describe("Content Display", () => {
        it("shows default confirmation message without user info", () => {
            render(<DeleteAccountModal {...defaultProps} />);
            expect(
                screen.getByText(/¿Estás seguro de que quieres eliminar tu cuenta/)
            ).toBeInTheDocument();
            expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
        });

        it("shows user name and email in confirmation message", () => {
            render(
                <DeleteAccountModal
                    {...defaultProps}
                    userName="John Doe"
                    userEmail="john@example.com"
                />
            );
            const descriptionElement = screen.getByText(/¿Estás seguro de que quieres eliminar tu cuenta/);
            expect(descriptionElement.textContent).toContain("John Doe");
            expect(descriptionElement.textContent).toContain("john@example.com");
            expect(descriptionElement.textContent).toContain("·");
        });
    });

    describe("API Integration - Basic Cases", () => {
        it("successfully deletes account and calls callbacks", async () => {
            const onClose = vi.fn();
            const onDeleteSuccess = vi.fn();
            const user = userEvent.setup();
            render(<DeleteAccountModal {...defaultProps} onClose={onClose} onDeleteSuccess={onDeleteSuccess} />);
            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
            await waitFor(() => {
                expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
                expect(onClose).toHaveBeenCalledTimes(1);
            });
        });

        it("displays server error message via console", async () => {
            server.use(deleteAccountErrorHandler);
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const user = userEvent.setup();
            render(<DeleteAccountModal {...defaultProps} />);
            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });
            consoleSpy.mockRestore();
        });
    });

    describe("API Integration - Advanced Error Recovery", () => {
        it("handles server error with successful retry", async () => {
            server.use(deleteAccountRetryHandler);
            const onDeleteSuccess = vi.fn();
            const user = userEvent.setup();
            render(<DeleteAccountModal {...defaultProps} onDeleteSuccess={onDeleteSuccess} />);
            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
            await waitFor(() => {
                expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
            });
        });

        it("handles network connectivity issues", async () => {
            server.use(deleteAccountNetworkErrorHandler);
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const user = userEvent.setup();
            render(<DeleteAccountModal {...defaultProps} />);
            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });
            consoleSpy.mockRestore();
        });
    });

    describe("Button Interactions", () => {
        it("calls onClose when cancel button is clicked", async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            render(<DeleteAccountModal {...defaultProps} onClose={onClose} />);
            await user.click(screen.getByRole("button", { name: "Cancelar" }));
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("Loading States", () => {
        it("disables buttons when loading", async () => {
            const user = userEvent.setup();
            render(<DeleteAccountModal {...defaultProps} />);
            await user.click(screen.getByRole("button", { name: "Eliminar cuenta" }));
            await waitFor(() => {
                expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
                expect(screen.getByRole("button", { name: "Eliminar cuenta" })).toBeDisabled();
            });
        });
    });

    describe("Modal Structure & Accessibility", () => {
        it("has proper ARIA attributes", () => {
            render(<DeleteAccountModal {...defaultProps} />);
            const modal = screen.getByRole("dialog");
            expect(modal).toHaveAttribute("aria-modal", "true");
            expect(modal).toHaveAttribute("aria-labelledby", "delete-account-title");
            expect(modal).toHaveAttribute("aria-describedby", "delete-account-description");
        });

        it("applies BUTTON_PRESETS.modalEqual styling", () => {
            render(<DeleteAccountModal {...defaultProps} />);
            const cancelButton = screen.getByRole("button", { name: "Cancelar" });
            const deleteButton = screen.getByRole("button", { name: "Eliminar cuenta" });
            expect(cancelButton).toHaveClass("sm:w-[160px]");
            expect(deleteButton).toHaveClass("sm:w-[160px]");
        });
    });
});
