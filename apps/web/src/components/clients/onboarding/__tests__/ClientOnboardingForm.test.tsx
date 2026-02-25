/**
 * ClientOnboardingForm Test Suite - Professional Coverage
 *
 * Tests de integración para el wizard de onboarding de clientes (7 pasos).
 * Cubre navegación, validación, submit y manejo de errores.
 *
 * Sigue la arquitectura de testing de NEXIA:
 * - Usa fixtures centralizadas (clientFormData)
 * - Usa handlers MSW específicos (no inline)
 * - Tests de integración (no unitarios)
 * - User-centric testing
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ClientOnboardingForm } from "../ClientOnboardingForm";
import { server } from "@/test-utils/utils/msw";
import {
    createClientErrorHandler,
} from "@/test-utils/mocks/handlers/clients";
import {
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import {
    createEmptyFormData,
    createMinimalValidFormData,
    createCompleteValidFormData,
    createInvalidEmailFormData,
    createMismatchedEmailFormData,
} from "@/test-utils/fixtures/clients";

// Mock useCompleteProfileModal para que no bloquee en tests
vi.mock("@nexia/shared", async () => {
    const actual = await vi.importActual("@nexia/shared");
    return {
        ...actual,
        useCompleteProfileModal: () => ({
            shouldBlock: false,
            isProfileComplete: true,
            missingFields: [],
            missingFieldsLabels: [],
            trainer: null,
            isLoading: false,
        }),
    };
});

describe("ClientOnboardingForm", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validTrainerUser);
    });

    describe("Rendering & Basic UI", () => {
        it("renders form with main title and first section (Información Personal)", { timeout: 10000 }, () => {
            const initialData = createEmptyFormData();
            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            expect(screen.getByRole("heading", { name: /agregar nuevo cliente/i })).toBeInTheDocument();
            expect(screen.getByRole("heading", { name: /información personal/i })).toBeInTheDocument();
            expect(screen.getByText(/nombre/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/ej: juan/i)).toBeInTheDocument();
            expect(screen.getByText(/apellidos/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/ej: pérez/i)).toBeInTheDocument();
            expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/ejemplo@correo.com/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
        });

        it("displays form subtitle", () => {
            const initialData = createEmptyFormData();
            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );
            expect(screen.getByText(/ingresa la información básica/i)).toBeInTheDocument();
        });
    });

    describe("Navigation to Review", () => {
        it("navigates to Review when clicking Siguiente", async () => {
            const user = userEvent.setup();
            const initialData = createMinimalValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            expect(screen.getByRole("heading", { name: /información personal/i })).toBeInTheDocument();
            await user.click(screen.getByRole("button", { name: /siguiente/i }));

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });
            expect(screen.getByRole("button", { name: /crear perfil/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /atrás/i })).toBeInTheDocument();
        });

        it("navigates back to form from Review when clicking Atrás", async () => {
            const user = userEvent.setup();
            const initialData = createMinimalValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /atrás/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /agregar nuevo cliente/i })).toBeInTheDocument();
            });
        });

        it("shows Review with Crear Perfil button after Siguiente", async () => {
            const user = userEvent.setup();
            const initialData = createCompleteValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });
            expect(screen.getByRole("button", { name: /crear perfil/i })).toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        it("allows opening Review with empty form (validation on Crear Perfil)", async () => {
            const user = userEvent.setup();
            const initialData = createEmptyFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });
        });

        it("allows opening Review with invalid email (validation on submit)", async () => {
            const user = userEvent.setup();
            const initialData = createInvalidEmailFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });
        });

        it("allows opening Review with mismatched email (validation on submit)", async () => {
            const user = userEvent.setup();
            const initialData = createMismatchedEmailFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });
        });
    });

    describe("API Integration", () => {
        it("successfully creates client and calls onSubmitSuccess", async () => {
            const user = userEvent.setup();
            const onSubmitSuccess = vi.fn();
            const initialData = createCompleteValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={onSubmitSuccess}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });

            const createButton = screen.getByRole("button", { name: /crear perfil/i });
            await user.click(createButton);

            await waitFor(() => {
                expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
            }, { timeout: 5000 });
        });

        it("shows loading state during submission", async () => {
            const user = userEvent.setup();
            const initialData = createCompleteValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });

            const createButton = screen.getByRole("button", { name: /crear perfil/i });
            await user.click(createButton);

            await waitFor(() => {
                expect(screen.getByText(/creando/i)).toBeInTheDocument();
            });
        });

        it("handles API error during submission", async () => {
            server.use(createClientErrorHandler);

            const user = userEvent.setup();
            const onSubmitSuccess = vi.fn();
            const initialData = createCompleteValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={onSubmitSuccess}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /revisar perfil del cliente/i })).toBeInTheDocument();
            });

            const createButton = screen.getByRole("button", { name: /crear perfil/i });
            await user.click(createButton);

            await waitFor(() => {
                const btn = screen.getByRole("button", { name: /crear perfil/i });
                expect(btn).not.toBeDisabled();
            }, { timeout: 3000 });

            expect(onSubmitSuccess).not.toHaveBeenCalled();
        });
    });
});
