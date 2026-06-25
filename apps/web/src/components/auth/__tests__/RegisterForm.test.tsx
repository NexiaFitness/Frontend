/**
 * RegisterForm Test Suite - Professional Coverage
 *
 * Tests usando handlers MSW centralizados + específicos para casos avanzados.
 * Registro público solo entrenador (atletas vía invitación).
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

describe("RegisterForm", () => {
  beforeEach(() => {
    clearRouterMocks();
    clearAuthMocks();
    vi.clearAllMocks();
  });

  describe("Rendering & Basic UI", () => {
    it("renders trainer registration form elements", () => {
      render(<RegisterForm />);

      expect(screen.getByRole("heading", { name: /únete a nexia/i }))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/correo electrónico/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/^nombre/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/apellidos/i))
        .toBeInTheDocument();
      expect(screen.queryByLabelText(/tipo de cuenta/i))
        .not.toBeInTheDocument();
      expect(screen.getByLabelText(/^contraseña/i))
        .toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar contraseña/i))
        .toBeInTheDocument();
      expect(screen.getByRole("button", { name: /crear cuenta/i }))
        .toBeInTheDocument();
      expect(screen.getByText(/eres atleta\? tu entrenador te enviará una invitación/i))
        .toBeInTheDocument();
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

      expect(await screen.findByText("Introduce un correo válido", {}, { timeout: 10000 }))
        .toBeInTheDocument();
    }, 15000);

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

  describe("Navigation", () => {
    it("navigates to login page", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole("button", { name: /inicia sesión/i }));

      expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("API Integration - Basic Cases", () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
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

    it("successful registration redirects to dashboard", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
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

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText(/service temporarily unavailable/i))
        .toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    it("handles rate limiting with successful retry", async () => {
      server.use(registerRateLimitHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText(/too many registration attempts/i))
        .toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });

    it("handles network timeout gracefully", async () => {
      server.use(registerTimeoutHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      }, { timeout: 5000 });
    }, 10000);

    it("handles malformed server response", async () => {
      server.use(registerMalformedResponseHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await fillValidForm(user);
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      }, { timeout: 5000 });
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

      expect(screen.getByRole("button", { name: /creando cuenta/i }))
        .toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    it("clears errors when user starts typing", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument();

      await user.type(screen.getByLabelText(/correo electrónico/i), "test");
      expect(screen.queryByText("El correo es obligatorio"))
        .not.toBeInTheDocument();
    });

    it("allows retry after server error", async () => {
      server.use(registerRetryHandler);

      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com");
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson");
      await user.type(screen.getByLabelText(/apellidos/i), "Valero");
      await user.type(screen.getByLabelText(/^contraseña/i), "password123");
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123");

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      expect(await screen.findByText(/service temporarily unavailable/i))
        .toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
      });
    });
  });
});
