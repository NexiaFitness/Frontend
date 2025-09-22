/**
 * RegisterForm Test Suite - Professional Coverage
 *
 * Tests usando handlers MSW centralizados + específicos para casos avanzados.
 * Arquitectura validada siguiendo pattern LoginForm exitoso (19/19 tests).
 *
 * @author Frontend Team
 * @since v1.0.1
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
} from "@/test-utils/mocks/handlers/authHandlers";
import {
  mockNavigate,
  clearRouterMocks,
  clearAuthMocks
} from "@/test-utils/mocks";

describe("RegisterForm", () => {
  beforeEach(() => {
    clearRouterMocks();
    clearAuthMocks();
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

    it("has default role selected as trainer", () => {
      render(<RegisterForm />);
      
      const roleSelect = screen.getByLabelText(/tipo de cuenta/i);
      expect(roleSelect).toHaveValue("trainer");
    });
  });

  describe("Form Validation", () => {
    it("shows all required field errors for empty form", async () => {
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
    });

    it("shows email format validation error", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "invalid-email");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText("Introduce un correo válido"))
        .toBeInTheDocument();
    });

    it("shows error when passwords don't match", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
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
      await user.type(screen.getByLabelText(/^contraseña/i), "123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText(/contraseña debe tener al menos/i))
        .toBeInTheDocument();
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
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
    };

    it("successful registration redirects to login with success message", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user, "trainer");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
            email: "test@example.com",
          }),
        });
      });
    });

    it("registers athlete successfully", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user, "athlete");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
            email: "test@example.com",
          }),
        });
      });
    });

    it("displays error when email already exists", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillExistingEmailForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

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
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
          }),
        });
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
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
          }),
        });
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
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      // Should show loading text and disabled state
      expect(screen.getByRole("button", { name: /creando cuenta/i }))
        .toBeInTheDocument();
      expect(screen.getByRole("button", { name: /creando cuenta/i }))
        .toBeDisabled();
      expect(screen.getByLabelText(/correo electrónico/i))
        .toBeDisabled();
      expect(screen.getByLabelText(/^contraseña/i))
        .toBeDisabled();
    });

    it("disables navigation links during loading", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      // Navigation button should be disabled during loading
      expect(screen.getByRole("button", { name: /inicia sesión/i }))
        .toBeDisabled();
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
      const user = userEvent.setup();
      render(<RegisterForm />);

      // First attempt with existing email
      await user.type(screen.getByLabelText(/correo electrónico/i), "existing@test.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      expect(await screen.findByText(/email already registered/i))
        .toBeInTheDocument();

      // Fix email and retry
      await user.clear(screen.getByLabelText(/correo electrónico/i));
      await user.type(screen.getByLabelText(/correo electrónico/i), "new@example.com");
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
          }),
        });
      });
    });
  });
});