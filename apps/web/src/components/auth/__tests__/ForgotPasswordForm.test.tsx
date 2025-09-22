/**
 * ForgotPasswordForm Test Suite - Professional Coverage
 *
 * Tests usando handlers MSW centralizados + específicos para casos avanzados.
 * Arquitectura validada siguiendo pattern RegisterForm exitoso (21/21 tests).
 *
 * @author Frontend Team
 * @since v1.0.1
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ForgotPasswordForm } from "../ForgotPasswordForm";
import { server } from "@/test-utils/utils/msw";
import {
  forgotPasswordRetryHandler,
  forgotPasswordTimeoutHandler,
  forgotPasswordEmailValidationHandler,
  forgotPasswordSlowHandler,
  forgotPasswordRetryFromErrorHandler
} from "@/test-utils/mocks/handlers/authHandlers";
import {
    mockNavigate,
    clearRouterMocks,
    clearAuthMocks
} from "@/test-utils/mocks";

describe("ForgotPasswordForm", () => {
    beforeEach(() => {
        clearRouterMocks();
        clearAuthMocks();
    });

    describe("Rendering & Basic UI", () => {
        it("renders form elements correctly", () => {
            render(<ForgotPasswordForm />);

            expect(screen.getByRole("heading", { name: /recuperar contraseña/i }))
                .toBeInTheDocument();
            expect(screen.getByLabelText(/correo electrónico/i))
                .toBeInTheDocument();
            expect(screen.getByRole("button", { name: /enviar enlace de recuperación/i }))
                .toBeInTheDocument();
            expect(screen.getByRole("button", { name: /volver al login/i }))
                .toBeInTheDocument();
        });

        it("allows typing in email field", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");

            expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        it("shows required field error for empty email", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            expect(await screen.findByText(/el correo es obligatorio/i))
                .toBeInTheDocument();
        });

        it("shows email format validation error", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            // Usar email que definitivamente falle regex /\S+@\S+\.\S+/ - sin @ ni .
            await user.type(screen.getByLabelText(/correo electrónico/i), "bademail");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            await waitFor(() => {
                expect(screen.getByTestId("input-error"))
                    .toHaveTextContent("Introduce un correo válido");
            }, { timeout: 3000 });
        });
    });

    describe("Navigation", () => {
        it("navigates to login from initial form", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.click(screen.getByRole("button", { name: /volver al login/i }));

            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });

        it("navigates to login from success view", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /volver al login/i }));
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    describe("API Integration - Basic Cases", () => {
        it("successful request shows confirmation view with email", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.type(screen.getByLabelText(/correo electrónico/i), "success@example.com");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/success@example\.com/i)).toBeInTheDocument();
            expect(screen.getByText(/te hemos enviado un enlace/i)).toBeInTheDocument();
        });

        it("displays server validation errors", async () => {
            server.use(forgotPasswordEmailValidationHandler);

            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.type(screen.getByLabelText(/correo electrónico/i), "valid@email.com");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            expect(await screen.findByText(/email format is invalid/i))
                .toBeInTheDocument();
        });
    });

    describe("API Integration - Advanced Error Recovery", () => {
        const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
        };

        it("handles server error with successful retry", async () => {
            server.use(forgotPasswordRetryHandler);

            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await fillValidForm(user);

            // First attempt - should show error
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));
            expect(await screen.findByText(/service temporarily unavailable/i))
                .toBeInTheDocument();

            // Second attempt - should succeed
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));
            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument();
            });
        });

        it("handles network timeout gracefully", async () => {
            server.use(forgotPasswordTimeoutHandler);

            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await fillValidForm(user);
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            expect(await screen.findByText(/error de conexión.*intenta de nuevo/i))
                .toBeInTheDocument();
        }, 10000);
    });

    describe("Loading States", () => {
        it("shows loading state during submission", async () => {
            server.use(forgotPasswordSlowHandler);

            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            // Should show loading text and disabled state
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /enviando/i }))
                    .toBeInTheDocument();
            }, { timeout: 200 });

            expect(screen.getByRole("button", { name: /enviando/i }))
                .toBeDisabled();
            expect(screen.getByLabelText(/correo electrónico/i))
                .toBeDisabled();
        });

        it("disables navigation links during loading", async () => {
            server.use(forgotPasswordSlowHandler);

            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            // Navigation button should be disabled during loading
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /volver al login/i }))
                    .toBeDisabled();
            }, { timeout: 200 });
        });
    });

    describe("Error Recovery", () => {
        it("clears errors when user starts typing", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            // Trigger validation error first
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));
            expect(await screen.findByText(/el correo es obligatorio/i))
                .toBeInTheDocument();

            // Start typing - error should clear
            await user.type(screen.getByLabelText(/correo electrónico/i), "test");
            expect(screen.queryByText(/el correo es obligatorio/i))
                .not.toBeInTheDocument();
        });

        it("allows retry after server error", async () => {
            server.use(forgotPasswordRetryFromErrorHandler);

            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            // First attempt - should show server error
            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            expect(await screen.findByText(/email format is invalid/i))
                .toBeInTheDocument();

            // Second attempt - should succeed
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument();
            });
        });
    });

    describe("Success View", () => {
        const triggerSuccessView = async (user: ReturnType<typeof userEvent.setup>, email = "test@example.com") => {
            await user.type(screen.getByLabelText(/correo electrónico/i), email);
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument();
            });
        };

        it("shows success view elements correctly", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await triggerSuccessView(user, "success-view@example.com");

            expect(screen.getByRole("heading", { name: /correo enviado/i }))
                .toBeInTheDocument();
            expect(screen.getByText(/revisa tu bandeja de entrada/i))
                .toBeInTheDocument();
            expect(screen.getByText(/success-view@example\.com/i))
                .toBeInTheDocument();
            expect(screen.getByRole("button", { name: /volver al login/i }))
                .toBeInTheDocument();
        });

        it("hides form elements in success view", async () => {
            const user = userEvent.setup();
            render(<ForgotPasswordForm />);

            await triggerSuccessView(user);

            expect(screen.queryByLabelText(/correo electrónico/i))
                .not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /enviar enlace de recuperación/i }))
                .not.toBeInTheDocument();
        });
    });
});