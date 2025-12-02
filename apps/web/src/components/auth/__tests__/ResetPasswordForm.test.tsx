/**
 * ResetPasswordForm Test Suite - Professional Coverage
 *
 * FIXED: Element selectors made specific to avoid multiple element conflicts.
 * Uses exact label matches and unique placeholders for reliable element selection.
 *
 * @author Frontend Team
 * @since v1.0.1
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http } from "msw";
import { render } from "@/test-utils/render";
import { ResetPasswordForm } from "../ResetPasswordForm";
import { server } from "@/test-utils/utils/msw";
import {
  resetPasswordRetryHandler,
  resetPasswordTimeoutHandler,
  resetPasswordInvalidTokenHandler,
  resetPasswordValidationHandler,
  resetPasswordNetworkErrorHandler
} from "@/test-utils/mocks/handlers/auth";
import {
    mockNavigate,
    clearRouterMocks,
    clearAuthMocks,
    setMockSearchParams
} from "@/test-utils/mocks";

describe("ResetPasswordForm", () => {
    beforeEach(() => {
        clearRouterMocks();
        clearAuthMocks();
        // Default searchParams with valid token
        setMockSearchParams({ token: "valid-token-123" });
    });

    describe("Rendering & Basic UI", () => {
        it("renders form elements correctly with valid token", () => {
            render(<ResetPasswordForm />);

            expect(screen.getByRole("heading", { name: /nueva contraseña/i }))
                .toBeInTheDocument();
            expect(screen.getByPlaceholderText("Mínimo 6 caracteres"))
                .toBeInTheDocument();
            expect(screen.getByPlaceholderText("Repite tu nueva contraseña"))
                .toBeInTheDocument();
            expect(screen.getByRole("button", { name: /cambiar contraseña/i }))
                .toBeInTheDocument();
            expect(screen.getByRole("button", { name: /volver al login/i }))
                .toBeInTheDocument();
        });

        it("shows error when token is missing from URL", () => {
            setMockSearchParams({});
            render(<ResetPasswordForm />);

            expect(screen.getByText(/el enlace de recuperación no es válido/i))
                .toBeInTheDocument();
        });

        it("allows typing in password fields", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            const newPasswordField = screen.getByPlaceholderText("Mínimo 6 caracteres");
            const confirmPasswordField = screen.getByPlaceholderText("Repite tu nueva contraseña");

            await user.type(newPasswordField, "newpass123");
            await user.type(confirmPasswordField, "newpass123");

            expect(newPasswordField).toHaveValue("newpass123");
            expect(confirmPasswordField).toHaveValue("newpass123");
        });
    });

    describe("Form Validation", () => {
        it("shows required field errors for empty passwords", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/la contraseña es obligatoria/i))
                .toBeInTheDocument();
            expect(await screen.findByText(/confirma tu contraseña/i))
                .toBeInTheDocument();
        });

        it("shows password length validation error", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/la contraseña debe tener al menos 6 caracteres/i))
                .toBeInTheDocument();
        });

        it("shows password mismatch validation error", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "password123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "different123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/las contraseñas no coinciden/i))
                .toBeInTheDocument();
        });
    });

    describe("Navigation", () => {
        it("navigates to login from form", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.click(screen.getByRole("button", { name: /volver al login/i }));

            expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
        });

        it("navigates to forgot password for new token", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.click(screen.getByText(/tu enlace ha caducado/i));

            expect(mockNavigate).toHaveBeenCalledWith("/auth/forgot-password");
        });

        it("navigates to login from success view", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            await waitFor(() => {
                expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
            expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
        });
    });

    describe("API Integration - Basic Cases", () => {
        const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
        };

        it("successful request shows success view", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await fillValidForm(user);
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            await waitFor(() => {
                expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/tu contraseña ha sido cambiada exitosamente/i))
                .toBeInTheDocument();
            expect(screen.getByText(/ya puedes iniciar sesión/i))
                .toBeInTheDocument();
        });

        it("displays invalid token error", async () => {
            server.use(resetPasswordInvalidTokenHandler);

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await fillValidForm(user);
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/invalid or expired reset token/i))
                .toBeInTheDocument();
        });

        it("displays server validation errors", async () => {
            server.use(resetPasswordValidationHandler);

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await fillValidForm(user);
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/password must be at least 8 characters/i))
                .toBeInTheDocument();
        });
    });

    describe("API Integration - Advanced Error Recovery", () => {
        const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
        };

        it("handles server error with successful retry", async () => {
            server.use(resetPasswordRetryHandler);

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await fillValidForm(user);

            // First attempt - should show error
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
            expect(await screen.findByText(/service temporarily unavailable/i))
                .toBeInTheDocument();

            // Second attempt - should succeed
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
            await waitFor(() => {
                expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
            });
        });

        it("handles network timeout gracefully", async () => {
            server.use(resetPasswordTimeoutHandler);

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await fillValidForm(user);
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/error de conexión.*intenta de nuevo/i))
                .toBeInTheDocument();
        }, 10000);

        it("handles network error gracefully", async () => {
            server.use(resetPasswordNetworkErrorHandler);

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await fillValidForm(user);
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/error de conexión.*intenta de nuevo/i))
                .toBeInTheDocument();
        });
    });

    describe("Loading States", () => {
        it("shows loading state during submission", async () => {
            // Usar un handler más lento para capturar el estado de loading
            server.use(
                http.post("*/auth/reset-password", async () => {
                    await new Promise((resolve) => setTimeout(resolve, 200)); // Delay para capturar loading
                    return new Response(null, { status: 408 });
                })
            );

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            // Verificar que el botón está deshabilitado durante el loading
            await waitFor(() => {
                const submitButton = screen.getByRole("button", { name: /cambiar contraseña|actualizando contraseña/i });
                expect(submitButton).toBeDisabled();
            }, { timeout: 500 });

            // Verificar que los inputs están deshabilitados
            expect(screen.getByPlaceholderText("Mínimo 6 caracteres")).toBeDisabled();
            expect(screen.getByPlaceholderText("Repite tu nueva contraseña")).toBeDisabled();
        });

        it("disables navigation links during loading", async () => {
            // Usar un handler más lento para capturar el estado de loading
            server.use(
                http.post("*/auth/reset-password", async () => {
                    await new Promise((resolve) => setTimeout(resolve, 200)); // Delay para capturar loading
                    return new Response(null, { status: 408 });
                })
            );

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            // Navigation buttons should be disabled during loading
            await waitFor(() => {
                expect(screen.getByRole("button", { name: /volver al login/i }))
                    .toBeDisabled();
            }, { timeout: 500 });

            expect(screen.getByText(/tu enlace ha caducado/i).closest("button"))
                .toBeDisabled();
        });
    });

    describe("Error Recovery", () => {
        it("clears errors when user starts typing", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            // Trigger validation error first
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));
            expect(await screen.findByText(/la contraseña es obligatoria/i))
                .toBeInTheDocument();

            // Start typing - error should clear
            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "test");
            expect(screen.queryByText(/la contraseña es obligatoria/i))
                .not.toBeInTheDocument();
        });

        it("allows retry after server error", async () => {
            server.use(resetPasswordInvalidTokenHandler);

            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            // First attempt - should show server error
            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            expect(await screen.findByText(/invalid or expired reset token/i))
                .toBeInTheDocument();

            // Clear server error and use default handler for success
            server.resetHandlers();

            // Second attempt - should succeed
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            await waitFor(() => {
                expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
            });
        });
    });

    describe("Success View", () => {
        const triggerSuccessView = async (user: ReturnType<typeof userEvent.setup>) => {
            await user.type(screen.getByPlaceholderText("Mínimo 6 caracteres"), "newpass123");
            await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "newpass123");
            await user.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

            await waitFor(() => {
                expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
            });
        };

        it("shows success view elements correctly", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await triggerSuccessView(user);

            expect(screen.getByRole("heading", { name: /contraseña actualizada/i }))
                .toBeInTheDocument();
            expect(screen.getByText(/tu contraseña ha sido cambiada exitosamente/i))
                .toBeInTheDocument();
            expect(screen.getByText(/ya puedes iniciar sesión con tu nueva contraseña/i))
                .toBeInTheDocument();
            expect(screen.getByRole("button", { name: /iniciar sesión/i }))
                .toBeInTheDocument();
        });

        it("hides form elements in success view", async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm />);

            await triggerSuccessView(user);

            expect(screen.queryByPlaceholderText("Mínimo 6 caracteres"))
                .not.toBeInTheDocument();
            expect(screen.queryByPlaceholderText("Repite tu nueva contraseña"))
                .not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /cambiar contraseña/i }))
                .not.toBeInTheDocument();
        });
    });
});