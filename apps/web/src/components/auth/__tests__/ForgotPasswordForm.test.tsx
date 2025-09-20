/**
 * ForgotPasswordForm Test Suite
 *
 * Tests usando handlers MSW centralizados sin inline overrides.
 * Confía en arquitectura centralizada para consistencia.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ForgotPasswordForm } from "../ForgotPasswordForm";
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

            // Usar email que definitivamente falle regex /\S+@\S+\.\S+/
            await user.type(screen.getByLabelText(/correo electrónico/i), "notanemail");
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

            expect(await screen.findByText("Introduce un correo válido"))
                .toBeInTheDocument();
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

    describe("API Integration (MSW)", () => {
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