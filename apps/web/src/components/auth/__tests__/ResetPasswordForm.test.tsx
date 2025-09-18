/**
 * ResetPasswordForm Test Suite - Unified Version
 *
 * Consolidación de unit tests y MSW tests en un solo archivo.
 * Usa MSW como strategy principal para tests realistas,
 * incluye validation tests y URL token handling del archivo unit.
 *
 * @since v1.0.0
 */

import React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { ResetPasswordForm } from "../ResetPasswordForm"
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"
import {
    mockNavigate,
    clearRouterMocks,
    clearAuthMocks,
} from "@/test-utils/mocks"

// Helper para crear searchParams mockeados
const createMockSearchParams = (token: string | null = "valid-token-123") => {
    const searchParams = new URLSearchParams()
    if (token !== null) {
        searchParams.set("token", token)
    }
    return searchParams
}

let mockSearchParams = createMockSearchParams()

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    )
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [mockSearchParams],
    }
})

describe("ResetPasswordForm", () => {
    beforeEach(() => {
        clearRouterMocks()
        clearAuthMocks()
        mockSearchParams = createMockSearchParams("valid-token-123")
    })

    describe("Rendering & Basic UI", () => {
        it("renders form elements correctly", () => {
            render(<ResetPasswordForm />)

            expect(
                screen.getByRole("heading", { name: /nueva contraseña/i })
            ).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText(/mínimo 6 caracteres/i)
            ).toBeInTheDocument()
            expect(
                screen.getByPlaceholderText(/repite tu nueva contraseña/i)
            ).toBeInTheDocument()
            expect(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            ).toBeInTheDocument()
        })

        it("renders navigation links", () => {
            render(<ResetPasswordForm />)

            expect(
                screen.getByRole("button", { name: /tu enlace ha caducado/i })
            ).toBeInTheDocument()
            expect(
                screen.getByRole("button", { name: /volver al login/i })
            ).toBeInTheDocument()
        })
    })

    describe("URL Token Handling", () => {
        it("shows error when no token in URL", () => {
            mockSearchParams = createMockSearchParams(null)
            render(<ResetPasswordForm />)

            expect(
                screen.getByText(/el enlace de recuperación no es válido/i)
            ).toBeInTheDocument()
        })

        it("handles empty token in URL", () => {
            mockSearchParams = createMockSearchParams("")
            render(<ResetPasswordForm />)

            expect(
                screen.getByText(/el enlace de recuperación no es válido/i)
            ).toBeInTheDocument()
        })
    })

    describe("Form Validation", () => {
        it("shows error when fields are empty", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(await screen.findByText(/la contraseña es obligatoria/i))
                .toBeInTheDocument()
        })

        it("shows error when confirmation missing", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await user.type(
                screen.getByPlaceholderText(/mínimo 6 caracteres/i),
                "password123"
            )
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(await screen.findByText(/confirma tu contraseña/i))
                .toBeInTheDocument()
        })

        it("shows error when passwords don't match", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await user.type(
                screen.getByPlaceholderText(/mínimo 6 caracteres/i),
                "password123"
            )
            await user.type(
                screen.getByPlaceholderText(/repite tu nueva contraseña/i),
                "different123"
            )
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(await screen.findByText(/las contraseñas no coinciden/i))
                .toBeInTheDocument()
        })

        it("shows error when password too short", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await user.type(
                screen.getByPlaceholderText(/mínimo 6 caracteres/i),
                "123"
            )
            await user.type(
                screen.getByPlaceholderText(/repite tu nueva contraseña/i),
                "123"
            )
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(
                await screen.findByText(/la contraseña debe tener al menos 6 caracteres/i)
            ).toBeInTheDocument()
        })
    })

    describe("Navigation", () => {
        it("navigates to forgot-password", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await user.click(
                screen.getByRole("button", { name: /tu enlace ha caducado/i })
            )
            expect(mockNavigate).toHaveBeenCalledWith("/auth/forgot-password")
        })

        it("navigates to login from form", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await user.click(
                screen.getByRole("button", { name: /volver al login/i })
            )
            expect(mockNavigate).toHaveBeenCalledWith("/auth/login")
        })
    })

    describe("API Integration (MSW)", () => {
        const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
            await user.type(
                screen.getByPlaceholderText(/mínimo 6 caracteres/i),
                "newPassword123"
            )
            await user.type(
                screen.getByPlaceholderText(/repite tu nueva contraseña/i),
                "newPassword123"
            )
        }

        it("success shows confirmation view", async () => {
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await fillValidForm(user)
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(await screen.findByText(/contraseña actualizada/i))
                .toBeInTheDocument()
        })

        it("invalid token error (401)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/reset-password", () =>
                    HttpResponse.json(
                        { detail: "Invalid or expired token" },
                        { status: 401 }
                    )
                )
            )
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await fillValidForm(user)
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(await screen.findByText(/invalid or expired token/i))
                .toBeInTheDocument()
        })

        it("expired link error (400)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/reset-password", () =>
                    HttpResponse.json(
                        { detail: "El enlace ha caducado. Solicita uno nuevo." },
                        { status: 400 }
                    )
                )
            )
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await fillValidForm(user)
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(
                await screen.findByText(/el enlace ha caducado\. solicita uno nuevo\./i)
            ).toBeInTheDocument()
        })

        it("server error (500)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/reset-password", () =>
                    HttpResponse.json(
                        { detail: "Error interno del servidor" },
                        { status: 500 }
                    )
                )
            )
            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            await fillValidForm(user)
            await user.click(
                screen.getByRole("button", { name: /cambiar contraseña/i })
            )

            expect(await screen.findByText(/error interno del servidor/i))
                .toBeInTheDocument()
        })
    })

    describe("Loading States", () => {
        it("disables form during password reset", async () => {
            /**
             * Mantenemos la request en pending para observar el estado de loading real.
             */
            let resolveRequest: (value: unknown) => void
            const requestPromise = new Promise((resolve) => { resolveRequest = resolve })

            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/reset-password", async () => {
                    await requestPromise!
                    return HttpResponse.json({ message: "Success" }, { status: 200 })
                })
            )

            const user = userEvent.setup()
            render(<ResetPasswordForm />)

            // Rellenamos con valores válidos
            await user.type(screen.getByPlaceholderText(/mínimo 6 caracteres/i), "loading123")
            await user.type(screen.getByPlaceholderText(/repite tu nueva contraseña/i), "loading123")

            // Capturamos el botón por su label inicial (estable) antes de click
            const submitBtn = screen.getByRole("button", { name: /cambiar contraseña/i })

            // Disparamos submit
            await user.click(submitBtn)

            // Comprobamos estado de loading sin depender del texto de loading
            await waitFor(() => {
                expect(submitBtn).toBeDisabled()
                expect(screen.getByPlaceholderText(/mínimo 6 caracteres/i)).toBeDisabled()
                expect(screen.getByPlaceholderText(/repite tu nueva contraseña/i)).toBeDisabled()
            })

            // Liberamos la request y validamos vista de éxito para limpiar
            resolveRequest!({})
            expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument()
        })
    })

})
