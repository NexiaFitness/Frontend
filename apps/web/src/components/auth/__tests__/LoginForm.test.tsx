/**
 * LoginForm Test Suite
 *
 * Tests de integración usando handlers MSW centralizados sin inline overrides.
 * Confía en arquitectura centralizada para consistencia y mantenibilidad.
 *
 * @author Frontend Team
 * @since v1.0.1
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { LoginForm } from "../LoginForm";
import {
  mockNavigate,
  clearRouterMocks,
  clearAuthMocks,
  setMockLocation
} from "@/test-utils/mocks";
import {
  validLoginCredentials,
  invalidLoginCredentials
} from "@/test-utils/fixtures/authFixtures";

describe("LoginForm", () => {
  beforeEach(() => {
    clearRouterMocks();
    clearAuthMocks();
    setMockLocation("/auth/login", {});
  });

  describe("Rendering & Basic UI", () => {
    it("renders all form elements correctly", () => {
      render(<LoginForm />);

      expect(screen.getByRole("heading", { name: /bienvenido de vuelta/i }))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/contraseña/i))
        .toBeInTheDocument();
      expect(screen.getByRole("button", { name: /iniciar sesión/i }))
        .toBeInTheDocument();
    });

    it("displays success message when coming from registration", () => {
      render(<LoginForm />, {
        initialState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          }
        }
      });

      setMockLocation("/auth/login", {
        message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales.",
        email: "test@example.com"
      });

      render(<LoginForm />);

      expect(screen.getByText(/cuenta creada exitosamente/i))
        .toBeInTheDocument();
    });

    it("pre-fills email when coming from registration", () => {
      setMockLocation("/auth/login", {
        email: "new@example.com"
      });

      render(<LoginForm />);

      expect(screen.getByDisplayValue("new@example.com"))
        .toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("shows required field errors for empty form", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument();
    });

    it("shows email format validation error", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "invalid-email");
      await user.type(screen.getByLabelText(/contraseña/i), "password123");
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText("Introduce un correo válido"))
        .toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("navigates to register page", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /regístrate aquí/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/auth/register");
    });

    it("navigates to forgot password page", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /olvidaste tu contraseña/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/auth/forgot-password");
    });
  });

  describe("API Integration (MSW)", () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        validLoginCredentials.username
      );
      await user.type(
        screen.getByLabelText(/contraseña/i),
        validLoginCredentials.password
      );
    };

    const fillInvalidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        invalidLoginCredentials.username
      );
      await user.type(
        screen.getByLabelText(/contraseña/i),
        invalidLoginCredentials.password
      );
    };

    it("successful login redirects to dashboard", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    it("redirects to intended destination from protected route", async () => {
      setMockLocation("/auth/login", {
        from: "/dashboard/clients"
      });

      const user = userEvent.setup();
      render(<LoginForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/clients", { replace: true });
      });
    });

    it("displays server error for invalid credentials", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await fillInvalidForm(user);
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText(/incorrect email or password/i))
        .toBeInTheDocument();
    });
  });
});