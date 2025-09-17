/**
 * LoginForm Test Suite - Unified Version
 *
 * Consolidación de unit tests y MSW tests en un solo archivo.
 * Usa MSW como strategy principal para tests realistas,
 * y unit mocks solo para casos específicos donde sea más simple.
 *
 * @since v1.0.0
 */

import React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { LoginForm } from "../LoginForm"
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"
import { 
  setMockLocation, 
  mockNavigate, 
  clearRouterMocks,
  clearAuthMocks 
} from "@/test-utils/mocks"

describe("LoginForm", () => {
  beforeEach(() => {
    clearRouterMocks()
    clearAuthMocks()
    setMockLocation("/", {})
  })

  describe("Rendering & Basic UI", () => {
    it("renders all form elements correctly", () => {
      render(<LoginForm />)
      
      expect(screen.getByRole("heading", { name: /bienvenido de vuelta/i }))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico/i))
        .toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i))
        .toBeInTheDocument()
      expect(screen.getByRole("button", { name: /iniciar sesión/i }))
        .toBeInTheDocument()
      expect(screen.getByRole("button", { name: /regístrate aquí/i }))
        .toBeInTheDocument()
      expect(screen.getByRole("button", { name: /olvidaste tu contraseña/i }))
        .toBeInTheDocument()
    })

    it("displays success message when coming from registration", () => {
      setMockLocation("/auth/login", {
        message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales.",
      })

      render(<LoginForm />)

      expect(screen.getByText(/cuenta creada exitosamente/i))
        .toBeInTheDocument()
      expect(screen.getByText(/inicia sesión con tus credenciales/i))
        .toBeInTheDocument()
    })

    it("pre-fills email when coming from registration with email state", () => {
      setMockLocation("/auth/login", {
        email: "new@example.com",
        message: "Cuenta creada exitosamente"
      })

      render(<LoginForm />)

      expect(screen.getByDisplayValue("new@example.com"))
        .toBeInTheDocument()
    })
  })

  describe("Form Validation", () => {
    it("shows required field errors for empty form", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      expect(await screen.findByText("El correo es obligatorio"))
        .toBeInTheDocument()
    })

    it("shows password required error when email is filled but password is empty", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      expect(await screen.findByText("La contraseña es obligatoria"))
        .toBeInTheDocument()
    })

    it("shows email format validation error", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "invalid-email")
      await user.type(screen.getByLabelText(/contraseña/i), "password123")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      expect(await screen.findByText("Introduce un correo válido"))
        .toBeInTheDocument()
    })
  })

  describe("Navigation", () => {
    it("navigates to register page", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("button", { name: /regístrate aquí/i }))
      
      expect(mockNavigate).toHaveBeenCalledWith("/auth/register")
    })

    it("navigates to forgot password page", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("button", { name: /olvidaste tu contraseña/i }))
      
      expect(mockNavigate).toHaveBeenCalledWith("/auth/forgot-password")
    })
  })

  describe("API Integration Tests (MSW)", () => {
    it("successful login redirects to dashboard", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "password123")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
      })
    })

    it("successful login redirects to intended destination when coming from protected route", async () => {
      setMockLocation("/auth/login", {
        from: "/dashboard/clients"
      })

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "password123")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/clients", { replace: true })
      })
    })

    it("displays server error for invalid credentials (401)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
          return HttpResponse.json(
            { detail: "Correo o contraseña incorrectos" },
            { status: 401 }
          )
        })
      )

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "wrong@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "wrongpassword")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      expect(await screen.findByText(/correo o contraseña incorrectos/i))
        .toBeInTheDocument()
    })

    it("displays server error for account locked (423)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
          return HttpResponse.json(
            { detail: "Cuenta bloqueada. Contacta con soporte." },
            { status: 423 }
          )
        })
      )

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "locked@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "password123")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      expect(await screen.findByText(/cuenta bloqueada/i))
        .toBeInTheDocument()
    })

    it("displays generic server error (500)", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
          return HttpResponse.json(
            { detail: "Error interno del servidor" },
            { status: 500 }
          )
        })
      )

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "password123")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      expect(await screen.findByText(/error interno del servidor/i))
        .toBeInTheDocument()
    })

    // Network errors are handled by RTK Query and browser, 
    // testing this specific scenario is complex and not critical for core functionality
  })

  describe("Error Recovery", () => {
    it("allows retry after login failure", async () => {
      let callCount = 0
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
          callCount++
          if (callCount === 1) {
            return HttpResponse.json(
              { detail: "Error temporal del servidor" },
              { status: 500 }
            )
          }
          // Second attempt succeeds
          return HttpResponse.json({
            access_token: "success-token",
            user: { id: 1, email: "test@example.com" }
          })
        })
      )

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "retry@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "password123")
      
      // First attempt - should fail
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))
      expect(await screen.findByText(/error temporal del servidor/i))
        .toBeInTheDocument()

      // Second attempt - should succeed
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
      })
    })

    it("clears previous errors when form is resubmitted", async () => {
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
          return HttpResponse.json(
            { detail: "Error inicial" },
            { status: 401 }
          )
        })
      )

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
      await user.type(screen.getByLabelText(/contraseña/i), "wrongpass")
      
      // First submission - should show error
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))
      expect(await screen.findByText(/error inicial/i))
        .toBeInTheDocument()

      // Change server response to success
      server.use(
        http.post("https://nexiaapp.com/api/v1/auth/login", async () => {
          return HttpResponse.json({
            access_token: "success-token",
            user: { id: 1, email: "test@example.com" }
          })
        })
      )

      // Fix password and retry
      await user.clear(screen.getByLabelText(/contraseña/i))
      await user.type(screen.getByLabelText(/contraseña/i), "correctpass")
      await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

      // Should succeed and error should be cleared
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
      })
      expect(screen.queryByText(/error inicial/i))
        .not.toBeInTheDocument()
    })
  })
})