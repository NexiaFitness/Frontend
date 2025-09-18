/**
 * ForgotPasswordForm Test Suite - Unified Version
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
import { ForgotPasswordForm } from "../ForgotPasswordForm"
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"
import {
    mockNavigate,
    clearRouterMocks,
    clearAuthMocks
} from "@/test-utils/mocks"

describe("ForgotPasswordForm", () => {
    beforeEach(() => {
        clearRouterMocks()
        clearAuthMocks()
    })

    describe("Rendering & Basic UI", () => {
        it("renders form elements correctly", () => {
            render(<ForgotPasswordForm />)

            expect(screen.getByRole("heading", { name: /recuperar contraseña/i }))
                .toBeInTheDocument()
            expect(screen.getByLabelText(/correo electrónico/i))
                .toBeInTheDocument()
            expect(screen.getByRole("button", { name: /enviar enlace de recuperación/i }))
                .toBeInTheDocument()
            expect(screen.getByRole("button", { name: /volver al login/i }))
                .toBeInTheDocument()
        })

        it("allows typing in email field", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")

            expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument()
        })
    })

    describe("Form Validation", () => {
        it("shows required field error for empty email", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            expect(await screen.findByText(/el correo es obligatorio/i))
                .toBeInTheDocument()
        })

        // Email format validation covered by shared validation utils
        // Specific error text testing not critical for consolidation goal
    })

    describe("Navigation", () => {
        it("navigates to login from initial form", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.click(screen.getByRole("button", { name: /volver al login/i }))

            expect(mockNavigate).toHaveBeenCalledWith("/login")
        })

        it("navigates to login from success view", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "navigate@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument()
            })

            await user.click(screen.getByRole("button", { name: /volver al login/i }))
            expect(mockNavigate).toHaveBeenCalledWith("/login")
        })
    })

    describe("API Integration Tests (MSW)", () => {
        it("successful request shows confirmation view with email", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "success@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument()
            })

            expect(screen.getByText(/success@example\.com/i)).toBeInTheDocument()
            expect(screen.getByText(/te hemos enviado un enlace/i)).toBeInTheDocument()
        })

        it("handles successful response with no content (204)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return new HttpResponse(null, { status: 204 })
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "nocontent@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            expect(await screen.findByText(/correo enviado/i)).toBeInTheDocument()
        })

        it("displays user not found error (404)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return HttpResponse.json(
                        { message: "Usuario no encontrado" },
                        { status: 404 }
                    )
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "missing@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            expect(await screen.findByText(/usuario no encontrado/i))
                .toBeInTheDocument()

            // Should stay on form view, not show success view
            expect(screen.queryByText(/correo enviado/i)).not.toBeInTheDocument()
        })

        it("displays validation error from server (422)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return HttpResponse.json(
                        { detail: "Datos inválidos. Verifica la información" },
                        { status: 422 }
                    )
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "invalid@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            expect(await screen.findByText(/datos inválidos/i))
                .toBeInTheDocument()
        })

        it("displays rate limiting error (429)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return HttpResponse.json(
                        { message: "Demasiados intentos. Espera un momento." },
                        { status: 429 }
                    )
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "ratelimit@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            expect(await screen.findByText(/demasiados intentos/i))
                .toBeInTheDocument()
        })

        it("displays server error (500)", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return HttpResponse.json(
                        { message: "Error interno" },
                        { status: 500 }
                    )
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "serverfail@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            expect(await screen.findByText(/error interno/i))
                .toBeInTheDocument()
        })
    })

    describe("Success View", () => {
        const triggerSuccessView = async (user: ReturnType<typeof userEvent.setup>, email = "test@example.com") => {
            await user.type(screen.getByLabelText(/correo electrónico/i), email)
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument()
            })
        }

        it("shows success view elements correctly", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await triggerSuccessView(user, "success-view@example.com")

            expect(screen.getByRole("heading", { name: /correo enviado/i }))
                .toBeInTheDocument()
            expect(screen.getByText(/revisa tu bandeja de entrada/i))
                .toBeInTheDocument()
            expect(screen.getByText(/success-view@example\.com/i))
                .toBeInTheDocument()
            expect(screen.getByRole("button", { name: /volver al login/i }))
                .toBeInTheDocument()
        })

        it("hides form elements in success view", async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await triggerSuccessView(user)

            expect(screen.queryByLabelText(/correo electrónico/i))
                .not.toBeInTheDocument()
            expect(screen.queryByRole("button", { name: /enviar enlace de recuperación/i }))
                .not.toBeInTheDocument()
        })
    })

    describe("Error Recovery", () => {
        it("allows retry after temporary server error", async () => {
            let callCount = 0
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    callCount++
                    if (callCount === 1) {
                        return HttpResponse.json({ message: "Error temporal" }, { status: 500 })
                    }
                    return HttpResponse.json({ message: "Éxito en reintento" }, { status: 200 })
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "retry@example.com")

            // First attempt - should fail
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))
            expect(await screen.findByText(/error temporal/i)).toBeInTheDocument()

            // Second attempt - should succeed
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))
            expect(await screen.findByText(/correo enviado/i)).toBeInTheDocument()
        })

        it("clears previous errors when form is resubmitted", async () => {
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return HttpResponse.json(
                        { detail: "Error inicial" },
                        { status: 404 }
                    )
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "error@example.com")

            // First submission - should show error
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))
            expect(await screen.findByText(/error inicial/i))
                .toBeInTheDocument()

            // Change server response to success
            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    return HttpResponse.json({ message: "Éxito" }, { status: 200 })
                })
            )

            // Change email and retry
            await user.clear(screen.getByLabelText(/correo electrónico/i))
            await user.type(screen.getByLabelText(/correo electrónico/i), "success@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            // Should succeed and error should be cleared
            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument()
            })
            expect(screen.queryByText(/error inicial/i))
                .not.toBeInTheDocument()
        })
    })

    describe("Loading States", () => {
        it("shows loading state during API request", async () => {
            let resolveRequest: (value: any) => void
            const requestPromise = new Promise((resolve) => {
                resolveRequest = resolve
            })

            server.use(
                http.post("https://nexiaapp.com/api/v1/auth/forgot-password", async () => {
                    await requestPromise
                    return HttpResponse.json({ message: "Success" }, { status: 200 })
                })
            )

            const user = userEvent.setup()
            render(<ForgotPasswordForm />)

            await user.type(screen.getByLabelText(/correo electrónico/i), "loading@example.com")
            await user.click(screen.getByRole("button", { name: /enviar enlace/i }))

            // Should show loading state  
            expect(screen.getByText(/cargando.../i))
                .toBeInTheDocument()
            expect(screen.getByRole("button", { name: /cargando.../i }))
                .toBeDisabled()

            // Should disable form elements during loading
            expect(screen.getByLabelText(/correo electrónico/i))
                .toBeDisabled()

            // Resolve request to cleanup
            resolveRequest!({ message: "Success" })

            await waitFor(() => {
                expect(screen.getByText(/correo enviado/i)).toBeInTheDocument()
            })
        })
    })
})