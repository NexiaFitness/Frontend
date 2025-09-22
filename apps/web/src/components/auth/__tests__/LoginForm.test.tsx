/**
 * LoginForm Test Suite - Professional Coverage
 *
 * Tests de integración con cobertura completa usando handlers MSW híbridos.
 * Combina handlers centralizados + específicos para casos avanzados.
 *
 * @author Frontend Team
 * @since v1.0.1
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { LoginForm } from "../LoginForm";
import { server } from "@/test-utils/utils/msw";
import {
  loginRetryHandler,
  loginRateLimitHandler,
  loginTimeoutHandler,
  emailValidationHandler,
  networkErrorHandler
} from "@/test-utils/mocks/handlers/authHandlers";
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

    it("displays server validation errors", async () => {
      server.use(emailValidationHandler);

      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "valid@email.com");
      await user.type(screen.getByLabelText(/contraseña/i), "password123");
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText(/email format is invalid/i))
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

  describe("API Integration - Basic Cases", () => {
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

  describe("API Integration - Advanced Error Recovery", () => {
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

    it("handles server error with successful retry", async () => {
      server.use(loginRetryHandler);

      const user = userEvent.setup();
      render(<LoginForm />);

      await fillValidForm(user);

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
      expect(await screen.findByText(/service temporarily unavailable/i))
        .toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    it("handles rate limiting with successful retry", async () => {
      server.use(loginRateLimitHandler);

      const user = userEvent.setup();
      render(<LoginForm />);

      await fillValidForm(user);

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
      expect(await screen.findByText(/too many login attempts/i))
        .toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    it("handles network connectivity issues", async () => {
      server.use(networkErrorHandler);

      const user = userEvent.setup();
      render(<LoginForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText(/error de conexión/i))
        .toBeInTheDocument();
    });

    it("handles network timeout gracefully", async () => {
      server.use(loginTimeoutHandler);

      const user = userEvent.setup();
      render(<LoginForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText(/error de conexión/i))
        .toBeInTheDocument();
    }, 10000);
  });

  describe("Loading States", () => {
    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), validLoginCredentials.username);
      await user.type(screen.getByLabelText(/contraseña/i), validLoginCredentials.password);

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      // Buscar directamente el botón en estado de loading
      const submitButton = await screen.findByRole("button", { name: /iniciando sesión/i });

      // Esperar a que se aplique el atributo disabled
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Verificar que los inputs también se deshabilitan
      expect(screen.getByLabelText(/correo electrónico/i)).toBeDisabled();
      expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();
    });

    it("disables navigation links during loading", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        validLoginCredentials.username
      );
      await user.type(
        screen.getByLabelText(/contraseña/i),
        validLoginCredentials.password
      );

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(screen.getByRole("button", { name: /olvidaste tu contraseña/i }))
        .toBeDisabled();
      expect(screen.getByRole("button", { name: /regístrate aquí/i }))
        .toBeDisabled();
    });
  });

  describe("Error Recovery", () => {
    it("clears errors when user starts typing", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));
      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument();

      await user.type(screen.getByLabelText(/correo electrónico/i), "test");
      expect(screen.queryByText("El correo es obligatorio"))
        .not.toBeInTheDocument();
    });

    it("allows retry after server error", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        invalidLoginCredentials.username
      );
      await user.type(
        screen.getByLabelText(/contraseña/i),
        invalidLoginCredentials.password
      );
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      expect(await screen.findByText(/incorrect email or password/i))
        .toBeInTheDocument();

      await user.clear(screen.getByLabelText(/correo electrónico/i));
      await user.clear(screen.getByLabelText(/contraseña/i));
      await user.type(
        screen.getByLabelText(/correo electrónico/i),
        validLoginCredentials.username
      );
      await user.type(
        screen.getByLabelText(/contraseña/i),
        validLoginCredentials.password
      );
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });
  });
});
