/**
 * RegisterForm Test Suite - Unified Version
 *
 * Consolidación de unit tests y MSW tests en un solo archivo.
 * Usa MSW como strategy principal para tests realistas,
 * mantiene validation tests importantes del archivo unit.
 *
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { RegisterForm } from "../RegisterForm"
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"
import { 
  mockNavigate, 
  clearRouterMocks,
  clearAuthMocks 
} from "@/test-utils/mocks"

describe("RegisterForm", () => {
  beforeEach(() => {
    clearRouterMocks()
    clearAuthMocks()
  })

  describe("Rendering & Basic UI", () => {
    it("renders all form elements correctly", () => {
      render(<RegisterForm />)
      
      expect(screen.getByRole("heading", { name: /únete a nexia/i }))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico/i))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/^nombre/i))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/apellidos/i))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/tipo de cuenta/i))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/^contraseña/i))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar contraseña/i))
        .toBeInTheDocument()
      expect(screen.getByRole("button", { name: /crear cuenta/i }))
        .toBeInTheDocument()
      expect(screen.getByRole("button", { name: /inicia sesión/i }))
        .toBeInTheDocument()
    })

    it("has default role selected as trainer", () => {
      render(<RegisterForm />)
      
      const roleSelect = screen.getByLabelText(/tipo de cuenta/i)
      expect(roleSelect).toHaveValue("trainer")
    })

    it("allows typing in all input fields", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)
      
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson")
      await user.type(screen.getByLabelText(/apellidos/i), "Valero")
      await user.type(screen.getByLabelText(/^contraseña/i), "password123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123")
      
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Nelson")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Valero")).toBeInTheDocument()
      expect(screen.getAllByDisplayValue("password123")).toHaveLength(2)
    })
  })

  describe("Form Validation", () => {
    it("shows all required field errors for empty form", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument()
      expect(await screen.findByText("El nombre es obligatorio"))
        .toBeInTheDocument()
      expect(await screen.findByText("Los apellidos es obligatorio"))
        .toBeInTheDocument()
      expect(await screen.findByText("La contraseña es obligatoria"))
        .toBeInTheDocument()
      expect(await screen.findByText("Confirma tu contraseña"))
        .toBeInTheDocument()
    })

    it("shows email format validation error", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "invalid-email")
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson")
      await user.type(screen.getByLabelText(/apellidos/i), "Valero")
      await user.type(screen.getByLabelText(/^contraseña/i), "password123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123")
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText("Introduce un correo válido"))
        .toBeInTheDocument()
    })

    it("shows error when passwords don't match", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson")
      await user.type(screen.getByLabelText(/apellidos/i), "Valero")
      await user.type(screen.getByLabelText(/^contraseña/i), "password123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "different123")
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText("Las contraseñas no coinciden"))
        .toBeInTheDocument()
    })

    it("validates minimum password length", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson")
      await user.type(screen.getByLabelText(/apellidos/i), "Valero")
      await user.type(screen.getByLabelText(/^contraseña/i), "123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "123")
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText(/contraseña debe tener al menos/i))
        .toBeInTheDocument()
    })
  })

  describe("Role Selection", () => {
    it("allows selecting trainer role", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer")
      
      expect(screen.getByLabelText(/tipo de cuenta/i)).toHaveValue("trainer")
    })

    it("allows selecting athlete role", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "athlete")
      
      expect(screen.getByLabelText(/tipo de cuenta/i)).toHaveValue("athlete")
    })

    it("shows role options correctly", () => {
      render(<RegisterForm />)
      
      const trainerOption = screen.getByRole("option", { name: /entrenador personal/i })
      const athleteOption = screen.getByRole("option", { name: /atleta/i })
      const placeholderOption = screen.getByRole("option", { name: /selecciona tu tipo de cuenta/i })
      
      expect(trainerOption).toBeInTheDocument()
      expect(athleteOption).toBeInTheDocument()
      expect(placeholderOption).toBeInTheDocument()
    })
  })

  describe("Navigation", () => {
    it("navigates to login page", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.click(screen.getByRole("button", { name: /inicia sesión/i }))
      
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login")
    })
  })

  describe("API Integration Tests (MSW)", () => {
    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>, role = "athlete") => {
      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/^nombre/i), "Nelson")
      await user.type(screen.getByLabelText(/apellidos/i), "Valero")
      await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), role)
      await user.type(screen.getByLabelText(/^contraseña/i), "password123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123")
    }

    it("successful registration redirects to login with success message", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await fillValidForm(user, "trainer")
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
            email: "test@example.com",
          }),
        })
      })
    })

    it("registers athlete successfully", async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)

      await fillValidForm(user, "athlete")
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
            email: "test@example.com",
          }),
        })
      })
    })

    it("displays error when email already exists (409)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          return HttpResponse.json(
            { message: "Este email ya está registrado" },
            { status: 409 }
          )
        })
      )

      const user = userEvent.setup()
      render(<RegisterForm />)

      await fillValidForm(user)
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText(/este email ya está registrado/i))
        .toBeInTheDocument()
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("displays validation error from server (422)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          return HttpResponse.json(
            { message: "Datos inválidos. Verifica la información" },
            { status: 422 }
          )
        })
      )

      const user = userEvent.setup()
      render(<RegisterForm />)

      await fillValidForm(user)
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText(/datos inválidos.*verifica la información/i))
        .toBeInTheDocument()
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("displays server error (500)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          return HttpResponse.json(
            { detail: "Error interno del servidor" },
            { status: 500 }
          )
        })
      )

      const user = userEvent.setup()
      render(<RegisterForm />)

      await fillValidForm(user)
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText(/error interno del servidor/i))
        .toBeInTheDocument()
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it("handles rate limiting error (429)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          return HttpResponse.json(
            { message: "Demasiados intentos. Espera un momento." },
            { status: 429 }
          )
        })
      )

      const user = userEvent.setup()
      render(<RegisterForm />)

      await fillValidForm(user)
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      expect(await screen.findByText(/demasiados intentos/i))
        .toBeInTheDocument()
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe("Error Recovery", () => {
    it("allows retry after registration failure", async () => {
      let callCount = 0
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json(
              { detail: "Error temporal del servidor" },
              { status: 500 }
            )
          }
          // Second attempt succeeds
          return HttpResponse.json({
            message: "Cuenta creada exitosamente"
          })
        })
      )

      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "retry@example.com")
      await user.type(screen.getByLabelText(/^nombre/i), "Retry")
      await user.type(screen.getByLabelText(/apellidos/i), "User")
      await user.type(screen.getByLabelText(/^contraseña/i), "password123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123")
      
      // First attempt - should fail
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))
      expect(await screen.findByText(/error temporal del servidor/i))
        .toBeInTheDocument()

      // Second attempt - should succeed
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            message: expect.stringMatching(/cuenta creada exitosamente/i),
            email: "retry@example.com",
          }),
        })
      })
    })

    it("clears previous errors when form is resubmitted", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          return HttpResponse.json(
            { detail: "Error inicial" },
            { status: 409 }
          )
        })
      )

      const user = userEvent.setup()
      render(<RegisterForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/^nombre/i), "Test")
      await user.type(screen.getByLabelText(/apellidos/i), "User")
      await user.type(screen.getByLabelText(/^contraseña/i), "password123")
      await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123")
      
      // First submission - should show error
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))
      expect(await screen.findByText(/error inicial/i))
        .toBeInTheDocument()

      // Change server response to success
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
          return HttpResponse.json({
            message: "Cuenta creada exitosamente"
          })
        })
      )

      // Change email and retry
      await user.clear(screen.getByLabelText(/correo electrónico/i))
      await user.type(screen.getByLabelText(/correo electrónico/i), "different@example.com")
      await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

      // Should succeed and error should be cleared
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
          state: expect.objectContaining({
            email: "different@example.com",
          }),
        })
      })
      expect(screen.queryByText(/error inicial/i))
        .not.toBeInTheDocument()
    })
  })
})