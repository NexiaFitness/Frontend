/**
 * RegisterForm Test Suite - Professional Coverage
 *
 * Tests usando handlers MSW centralizados + específicos para casos avanzados.
 * Arquitectura validada siguiendo pattern LoginForm exitoso (19/19 tests).
 *
 * @author Frontend Team
 * @since v1.0.1
 * @updated v4.3.2 - Fixed role selection behavior (starts empty, requires explicit selection)
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { RegisterForm } from "../RegisterForm";
import { server } from "@/test-utils/utils/msw";
import {
  registerRetryHandler,
  registerRateLimitHandler,
  registerTimeoutHandler,
  passwordValidationHandler,
  registerMalformedResponseHandler
} from "@/test-utils/mocks/handlers/auth";
import {
  mockNavigate,
  clearRouterMocks,
  clearAuthMocks
} from "@/test-utils/mocks";

// No mocks inline - usar MSW para interceptar llamadas reales

describe("RegisterForm", () => {
  beforeEach(() => {
    clearRouterMocks();
    clearAuthMocks();
    vi.clearAllMocks();
  });

  describe("Rendering & Basic UI", () => {
    it("renders all form elements correctly", () => {
      render(<RegisterForm />);
      
      expect(screen.getByRole("heading", { name: /únete a nexia/i }))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/^nombre/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/apellidos/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de cuenta/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i))
        .toBeInTheDocument();
      expect(screen.getByRole("button", { name: /crear cuenta/i }))
        .toBeInTheDocument();
    });

    it("has no default role selected (starts empty)", () => {
      render(<RegisterForm />);
      
      const roleSelect = screen.getByLabelText(/tipo de cuenta/i);
      expect(roleSelect).toHaveValue("");
    });
  });

  describe("Form Validation", () => {
    it("shows all required field errors for empty form including role", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument();
      expect(await screen.findByText("El nombre es obligatorio"))
        .toBeInTheDocument();
      expect(await screen.findByText("Los apellidos es obligatorio"))
        .toBeInTheDocument();
      expect(await screen.findByText("La contraseña es obligatoria"))
        .toBeInTheDocument();
      expect(await screen.findByText("Confirma tu contraseña"))
        .toBeInTheDocument();
      // Should also show role selection error (look for error message, not placeholder)
      expect(await screen.findByText((content, element) => {
        return content === "Selecciona tu tipo de cuenta" && element?.tagName === 'P';
      })).toBeInTheDocument();
    });

    it("shows email format validation error", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "invalid-email");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText("Introduce un correo válido", {}, { timeout: 10000 }))
        .toBeInTheDocument();
    }, 15000);

    it("shows error when passwords don't match", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "different123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText("Las contraseñas no coinciden"))
        .toBeInTheDocument();
    });

    it("validates minimum password length", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText(/contraseña debe tener al menos/i))
        .toBeInTheDocument();
    });

    it("shows role selection error when no role selected", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      // Fill all fields except role
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText((content, element) => {
        return content === "Selecciona tu tipo de cuenta" && element?.tagName === 'P';
      })).toBeInTheDocument();
    });
  });

  describe("Role Selection", () => {
    it("allows selecting trainer role", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      
      expect(screen.getByLabelText(/tipo de cuenta/i)).toHaveValue("trainer");
    });

    it("allows selecting athlete role", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "athlete");
      
      expect(screen.getByLabelText(/tipo de cuenta/i)).toHaveValue("athlete");
    });
  });

  describe("Navigation", () => {
    it("navigates to login page", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole("button", { name: /inicia sesión/i }));
      
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("API Integration - Basic Cases", () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>, role = "trainer") => {
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), role);
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
    };

    const fillExistingEmailForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/correo electrónico/i), "existing@test.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
    };

    it("successful registration redirects to trainer dashboard", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user, "trainer");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      // MSW intercepta la llamada real y devuelve respuesta exitosa
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/trainer", { replace: true });
      });
    });

    it("registers athlete successfully", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user, "athlete");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      // MSW intercepta la llamada real y devuelve respuesta exitosa
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/athlete", { replace: true });
      });
    });

    it("displays error when email already exists", async () => {
      const user = userEvent.setup();
      // MSW ya tiene handler para email duplicado
      render(<RegisterForm />);

      await fillExistingEmailForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      // Verificar que se muestra el error específico del handler
      expect(await screen.findByText(/email already registered/i))
        .toBeInTheDocument();

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("displays server validation errors", async () => {
      server.use(passwordValidationHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "weakpass");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "weakpass");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText(/password must be at least 8 characters/i))
        .toBeInTheDocument();
    });
  });

  describe("API Integration - Advanced Error Recovery", () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
    };

    it("handles server error with successful retry", async () => {
      server.use(registerRetryHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);

      // First attempt - should show error
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText(/service temporarily unavailable/i))
        .toBeInTheDocument();

      // Second attempt - should succeed
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/trainer", { replace: true });
      });
    });

    it("handles rate limiting with successful retry", async () => {
      server.use(registerRateLimitHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);

      // First attempt - should show rate limit error
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText(/too many registration attempts/i))
        .toBeInTheDocument();

      // Second attempt - should succeed
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/trainer", { replace: true });
      });
    });

    it("handles network timeout gracefully", async () => {
      server.use(registerTimeoutHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText(/error de conexión.*intenta de nuevo/i))
        .toBeInTheDocument();
    }, 10000);

    it("handles malformed server response", async () => {
      server.use(registerMalformedResponseHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText(/error de conexión.*intenta de nuevo/i))
        .toBeInTheDocument();
    });
  });

  describe("Loading States", () => {
    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      // Verificar que se muestra estado de loading (simplificado)
      expect(screen.getByRole("button", { name: /creando cuenta/i }))
        .toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    it("clears errors when user starts typing", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      // Trigger validation error first
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument();

      // Start typing - error should clear
      await user.type(screen.getByLabelText(/correo electrónico/i), "test");
      expect(screen.queryByText("El correo es obligatorio"))
        .not.toBeInTheDocument();
    });

    it("allows retry after server error", async () => {
      server.use(registerRetryHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      // Fill form with valid data
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");

      // First attempt - should show 503 error
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText(/service temporarily unavailable/i))
        .toBeInTheDocument();

      // Second attempt - should succeed
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/trainer", { replace: true });
      });
    });
  });
});