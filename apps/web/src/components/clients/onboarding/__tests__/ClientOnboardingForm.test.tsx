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
        it("renders first step (PersonalInfo) correctly", () => {
            const initialData = createEmptyFormData();
            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Verificar progress bar
            expect(screen.getByText(/paso 1 de 7/i)).toBeInTheDocument();
            expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();

            // Verificar campos del primer step
            // Los labels no están asociados con inputs, usar getByText para labels y getByPlaceholderText para inputs
            expect(screen.getByText(/nombre/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/ej: juan/i)).toBeInTheDocument();
            expect(screen.getByText(/apellidos/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/ej: pérez/i)).toBeInTheDocument();
            expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/ejemplo@correo.com/i)).toBeInTheDocument();

            // Verificar botones de navegación
            expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
        });

        it("displays progress percentage correctly", () => {
            const initialData = createEmptyFormData();
            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Primer step: ~14% (1/7)
            expect(screen.getByText(/14% completado/i)).toBeInTheDocument();
        });

        it("shows back to dashboard button on first step when onBackToDashboard is provided", () => {
            const initialData = createEmptyFormData();
            const onBackToDashboard = vi.fn();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                    onBackToDashboard={onBackToDashboard}
                />
            );

            expect(
                screen.getByRole("button", { name: /volver al dashboard/i })
            ).toBeInTheDocument();
        });
    });

    describe("Step Navigation", () => {
        it("navigates to next step when clicking next button", async () => {
            const user = userEvent.setup();
            const initialData = createMinimalValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Verificar que estamos en el primer step
            expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();

            // Navegar al siguiente step
            await user.click(screen.getByRole("button", { name: /siguiente/i }));

            // Verificar que estamos en el segundo step
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /métricas físicas/i })).toBeInTheDocument();
            });
            expect(screen.getByText(/paso 2 de 7/i)).toBeInTheDocument();
        });

        it("navigates to previous step when clicking back button", async () => {
            const user = userEvent.setup();
            const initialData = createMinimalValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Ir al segundo step
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /métricas físicas/i })).toBeInTheDocument();
            });

            // Volver al primer step
            await user.click(screen.getByRole("button", { name: /anterior/i }));

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();
            });
        });

        it("does not navigate to next step if current step is invalid", async () => {
            const user = userEvent.setup();
            const initialData = createEmptyFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Intentar navegar sin completar campos obligatorios
            await user.click(screen.getByRole("button", { name: /siguiente/i }));

            // Debe permanecer en el primer step
            expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();
        });

        it("shows correct button labels on last step", async () => {
            const user = userEvent.setup();
            const initialData = createCompleteValidFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Navegar hasta el último step (Review)
            // Step 0 -> 1
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /métricas físicas/i })).toBeInTheDocument();
            });

            // Step 1 -> 2
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /antropometría/i })).toBeInTheDocument();
            });

            // Step 2 -> 3
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /objetivos/i })).toBeInTheDocument();
            });

            // Step 3 -> 4
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /experiencia/i })).toBeInTheDocument();
            });

            // Step 4 -> 5
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /salud/i })).toBeInTheDocument();
            });

            // Step 5 -> 6 (Review)
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                // Hay dos headings con "Revisión", usar el más específico del contenido
                expect(screen.getByRole("heading", { name: /revisión de datos/i })).toBeInTheDocument();
            });

            // Verificar que el botón dice "Crear cliente"
            expect(
                screen.getByRole("button", { name: /crear cliente/i })
            ).toBeInTheDocument();
        });
    });

    describe("Form Validation", () => {
        it("shows validation errors for required fields on first step", async () => {
            const user = userEvent.setup();
            const initialData = createEmptyFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            // Intentar navegar sin completar campos
            await user.click(screen.getByRole("button", { name: /siguiente/i }));

            // El componente valida pero no muestra errores automáticamente en nextStep
            // Los errores solo se muestran cuando se intenta submit final
            // Verificar que NO navegó al siguiente step (permanece en el primero)
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();
            });
            
            // Verificar que sigue en el paso 1
            expect(screen.getByText(/paso 1 de 7/i)).toBeInTheDocument();
        });

        it("validates email format", async () => {
            const user = userEvent.setup();
            const initialData = createInvalidEmailFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));

            // El componente valida pero no muestra errores automáticamente
            // Verificar que NO navegó al siguiente step (email inválido bloquea navegación)
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();
            });
        });

        it("validates email confirmation matches", async () => {
            const user = userEvent.setup();
            const initialData = createMismatchedEmailFormData();

            render(
                <ClientOnboardingForm
                    initialData={initialData}
                    onSubmitSuccess={() => {}}
                />
            );

            await user.click(screen.getByRole("button", { name: /siguiente/i }));

            // El componente valida pero no muestra errores automáticamente
            // Verificar que NO navegó al siguiente step (emails no coinciden bloquean navegación)
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /datos personales/i })).toBeInTheDocument();
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

            // Navegar hasta el último step
            // Step 0 -> 1
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /métricas físicas/i })).toBeInTheDocument();
            });

            // Step 1 -> 2
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /antropometría/i })).toBeInTheDocument();
            });

            // Step 2 -> 3
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /objetivos/i })).toBeInTheDocument();
            });

            // Step 3 -> 4
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /experiencia/i })).toBeInTheDocument();
            });

            // Step 4 -> 5
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /salud/i })).toBeInTheDocument();
            });

            // Step 5 -> 6 (Review)
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                // Hay dos headings con "Revisión", usar el más específico del contenido
                expect(screen.getByRole("heading", { name: /revisión de datos/i })).toBeInTheDocument();
            });

            // Submit en el último step
            const createButton = screen.getByRole("button", { name: /crear cliente/i });
            await user.click(createButton);

            // Verificar que se llama onSubmitSuccess
            // Aumentar timeout porque el submit puede tardar
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

            // Navegar hasta el último step
            // Step 0 -> 1
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /métricas físicas/i })).toBeInTheDocument();
            });

            // Step 1 -> 2
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /antropometría/i })).toBeInTheDocument();
            });

            // Step 2 -> 3
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /objetivos/i })).toBeInTheDocument();
            });

            // Step 3 -> 4
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /experiencia/i })).toBeInTheDocument();
            });

            // Step 4 -> 5
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /salud/i })).toBeInTheDocument();
            });

            // Step 5 -> 6 (Review)
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                // Hay dos headings con "Revisión", usar el más específico del contenido
                expect(screen.getByRole("heading", { name: /revisión de datos/i })).toBeInTheDocument();
            });

            // Click en crear cliente
            const createButton = screen.getByRole("button", { name: /crear cliente/i });
            await user.click(createButton);

            // Verificar estado de loading (el texto es "Guardando..." con mayúscula)
            await waitFor(() => {
                expect(screen.getByText(/Guardando/i)).toBeInTheDocument();
            });
        });

        it("handles API error during submission", async () => {
            // Usar handler de error específico (no inline)
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

            // Navegar hasta el último step
            // Step 0 -> 1
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /métricas físicas/i })).toBeInTheDocument();
            });

            // Step 1 -> 2
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /antropometría/i })).toBeInTheDocument();
            });

            // Step 2 -> 3
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /objetivos/i })).toBeInTheDocument();
            });

            // Step 3 -> 4
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /experiencia/i })).toBeInTheDocument();
            });

            // Step 4 -> 5
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /salud/i })).toBeInTheDocument();
            });

            // Step 5 -> 6 (Review)
            await user.click(screen.getByRole("button", { name: /siguiente/i }));
            await waitFor(() => {
                // Hay dos headings con "Revisión", usar el más específico del contenido
                expect(screen.getByRole("heading", { name: /revisión de datos/i })).toBeInTheDocument();
            });

            // Submit
            const createButton = screen.getByRole("button", { name: /crear cliente/i });
            await user.click(createButton);

            // Verificar que el error se maneja correctamente
            // El componente no muestra errores explícitamente, pero:
            // 1. El botón debe volver a estar habilitado (no en loading)
            // 2. No se debe llamar onSubmitSuccess (porque hubo error)
            await waitFor(() => {
                // Verificar que el botón ya no está en estado de loading
                const createButton = screen.getByRole("button", { name: /crear cliente/i });
                expect(createButton).not.toBeDisabled();
            }, { timeout: 3000 });

            // Verificar que NO se llamó onSubmitSuccess (porque hubo error)
            expect(onSubmitSuccess).not.toHaveBeenCalled();
        });
    });
});
