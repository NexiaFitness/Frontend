/**
 * LoginForm Test Suite (MSW)
 *
 * Tests de integración de LoginForm usando Mock Service Worker (MSW)
 * para interceptar llamadas reales a la API de autenticación.
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
import { setMockLocation, mockNavigate, clearRouterMocks } from "@/test-utils/mocks"

describe("LoginForm (con MSW)", () => {
  beforeEach(() => {
    clearRouterMocks()
    setMockLocation("/", {})
  })

  it("renderiza inputs y botón", () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it("muestra error de correo obligatorio si se envía vacío", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))
    expect(await screen.findByText("El correo es obligatorio")).toBeInTheDocument()
  })

  it("muestra error de contraseña obligatoria si se envía vacía", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    expect(await screen.findByText("La contraseña es obligatoria")).toBeInTheDocument()
  })

  it("login exitoso redirige al dashboard", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
    await user.type(screen.getByLabelText(/contraseña/i), "password123")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true })
    })
  })

  it("muestra error de servidor si la API devuelve 401", async () => {
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
    await user.type(screen.getByLabelText(/contraseña/i), "badpassword")
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }))

    // Buscar el mensaje definido en el handler (detalle del backend)
    expect(await screen.findByText(/correo o contraseña incorrectos/i)).toBeInTheDocument()
  })

  it("redirige al registro", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /regístrate aquí/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/auth/register")
  })

  it("redirige a recuperar contraseña", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /olvidaste tu contraseña/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/auth/forgot-password")
  })

  it("muestra mensaje de éxito si viene de registro", () => {
    setMockLocation("/auth/login", {
      message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales.",
    })

    render(<LoginForm />)

    expect(screen.getByText(/cuenta creada exitosamente/i)).toBeInTheDocument()
    expect(screen.getByText(/inicia sesión con tus credenciales/i)).toBeInTheDocument()
  })
})
