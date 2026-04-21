/**
 * ProgressForm Test Suite - Professional Coverage
 *
 * Tests de integración para el formulario de progreso del cliente.
 * Cubre rendering, validación, submit, prellenado y manejo de estados.
 *
 * Sigue la arquitectura de testing de NEXIA:
 * - Usa fixtures centralizadas
 * - Usa handlers MSW específicos (no inline)
 * - Tests de integración (no unitarios)
 * - User-centric testing
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { render } from "@/test-utils/render";
import { ProgressForm } from "../ProgressForm";
import { server } from "@/test-utils/utils/msw";
import {
    getClientHandler,
} from "@/test-utils/mocks/handlers/clients/list";
import {
    createProgressRecordHandler,
    createProgressRecordErrorHandler,
    createProgressRecordFromRequest,
} from "@/test-utils/mocks/handlers/clients/progress";
import {
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";

describe("ProgressForm", () => {

    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validTrainerUser);
        
        // Configurar handlers por defecto
        server.use(
            getClientHandler,
            createProgressRecordHandler
        );
    });

    describe("Rendering & Basic UI", () => {
        it("renders form with all fields correctly", async () => {
            render(<ProgressForm clientId={1} />);

            // Esperar a que cargue el cliente
            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Secciones del formulario (FormSection)
            expect(screen.getByRole("heading", { name: /mediciones corporales/i })).toBeInTheDocument();
            expect(screen.getByRole("heading", { name: /fecha y observaciones/i })).toBeInTheDocument();

            // Campos (placeholders sin unidad en el input; kg/cm están como sufijo)
            expect(screen.getByPlaceholderText(/^20-300$/)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/^100-250$/)).toBeInTheDocument();
            expect(screen.getByText(/fecha de medición/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/observaciones sobre este registro/i)).toBeInTheDocument();

            // Botón de submit
            expect(screen.getByRole("button", { name: /guardar registro/i })).toBeInTheDocument();
        });

        it("prefills height from client profile", async () => {
            render(<ProgressForm clientId={1} />);

            // Esperar a que cargue el cliente y se prellene la altura
            await waitFor(() => {
                const alturaInput = screen.getByPlaceholderText(/^100-250$/) as HTMLInputElement;
                expect(alturaInput.value).toBe("180");
            });
        });

        it("prefills date with today's date", async () => {
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Buscar el input de fecha por su tipo y max attribute
            const fechaInput = screen.getByDisplayValue(new Date().toISOString().split("T")[0]) as HTMLInputElement;
            expect(fechaInput.type).toBe("date");
        });
    });

    describe("Form Validation", () => {
        // Mock para verificar que createProgressRecord NO se llama cuando hay errores
        const mockCreateProgressRecord = vi.fn();

        beforeEach(() => {
            mockCreateProgressRecord.mockClear();
            // Restaurar handler por defecto y luego añadir el mock
            server.use(
                getClientHandler,
                http.post("*/progress/", async ({ request }) => {
                    mockCreateProgressRecord();
                    return createProgressRecordFromRequest(request);
                })
            );
        });

        it("prevents submission when peso is missing", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Limpiar peso si está prellenado
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);

            // Intentar submit
            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que NO se muestra mensaje de éxito y NO se llamó a la API
            await waitFor(() => {
                expect(screen.queryByText(/registro creado correctamente/i)).not.toBeInTheDocument();
            });
            expect(mockCreateProgressRecord).not.toHaveBeenCalled();
        });

        it("prevents submission when peso is out of range", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Esperar a que se prellene la altura desde el cliente
            await waitFor(() => {
                const alturaInput = screen.getByPlaceholderText(/^100-250$/) as HTMLInputElement;
                expect(alturaInput.value).toBe("180");
            });

            // Llenar peso con valor fuera de rango
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "15");

            // Submit
            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que NO se muestra mensaje de éxito y NO se llamó a la API
            await waitFor(() => {
                expect(screen.queryByText(/registro creado correctamente/i)).not.toBeInTheDocument();
            });
            expect(mockCreateProgressRecord).not.toHaveBeenCalled();
        });

        it("prevents submission when altura is missing", async () => {
            // Usar un cliente sin altura para este test
            server.use(
                http.get("*/clients/1", () => {
                    return HttpResponse.json({
                        id: 1,
                        nombre: "Juan",
                        apellidos: "Pérez",
                        altura: null, // Sin altura
                        fecha_alta: "2025-01-01",
                    });
                })
            );

            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Llenar peso pero dejar altura vacía
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "80");

            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que NO se muestra mensaje de éxito y NO se llamó a la API
            await waitFor(() => {
                expect(screen.queryByText(/registro creado correctamente/i)).not.toBeInTheDocument();
            });
            expect(mockCreateProgressRecord).not.toHaveBeenCalled();
        });

        it("prevents submission when altura is out of range", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Llenar peso primero (requerido)
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "80");

            // Establecer altura fuera de rango
            const alturaInput = screen.getByPlaceholderText(/^100-250$/);
            await user.clear(alturaInput);
            await user.type(alturaInput, "90");

            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que NO se muestra mensaje de éxito y NO se llamó a la API
            await waitFor(() => {
                expect(screen.queryByText(/registro creado correctamente/i)).not.toBeInTheDocument();
            });
            expect(mockCreateProgressRecord).not.toHaveBeenCalled();
        });

        it("prevents submission when fecha_registro is in the future", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Establecer fecha futura
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const fechaInput = screen.getByDisplayValue(new Date().toISOString().split("T")[0]) as HTMLInputElement;
            await user.clear(fechaInput);
            await user.type(fechaInput, tomorrow.toISOString().split("T")[0]);

            // Llenar otros campos válidos
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "80");

            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que NO se muestra mensaje de éxito y NO se llamó a la API
            await waitFor(() => {
                expect(screen.queryByText(/registro creado correctamente/i)).not.toBeInTheDocument();
            });
            expect(mockCreateProgressRecord).not.toHaveBeenCalled();
        });

        it("prevents submission when fecha_registro is before fecha_alta", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Establecer fecha anterior a fecha_alta
            const fechaInput = screen.getByDisplayValue(new Date().toISOString().split("T")[0]) as HTMLInputElement;
            await user.clear(fechaInput);
            await user.type(fechaInput, "2024-12-31"); // Antes de fecha_alta (2025-01-01)

            // Llenar otros campos válidos
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "80");

            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que NO se muestra mensaje de éxito y NO se llamó a la API
            await waitFor(() => {
                expect(screen.queryByText(/registro creado correctamente/i)).not.toBeInTheDocument();
            });
            expect(mockCreateProgressRecord).not.toHaveBeenCalled();
        });
    });

    describe("Form Submission", () => {
        beforeEach(() => {
            // Restaurar handlers por defecto para este bloque
            server.use(
                getClientHandler,
                createProgressRecordHandler
            );
        });

        it("successfully submits form with valid data", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Esperar a que se prellene la altura desde el cliente
            await waitFor(() => {
                const alturaInput = screen.getByPlaceholderText(/^100-250$/) as HTMLInputElement;
                expect(alturaInput.value).toBe("180");
            });

            // Llenar formulario
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "82");

            // Submit
            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar que se muestra mensaje de éxito
            await waitFor(() => {
                expect(screen.getByText(/registro creado correctamente/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });

        it("shows loading state during submission", async () => {
            // Usar un handler más lento para capturar el estado de loading
            server.use(
                http.post("*/progress/", async ({ request }) => {
                    await new Promise((res) => setTimeout(res, 200)); // Delay para capturar loading
                    return createProgressRecordFromRequest(request);
                })
            );

            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Esperar a que se prellene la altura
            await waitFor(() => {
                const alturaInput = screen.getByPlaceholderText(/^100-250$/) as HTMLInputElement;
                expect(alturaInput.value).toBe("180");
            });

            // Llenar formulario
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "82");

            // Submit
            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar loading (el botón debe estar deshabilitado o mostrar "Guardando...")
            await waitFor(() => {
                const button = screen.getByRole("button", { name: /guardar registro|guardando/i });
                expect(button).toBeDisabled();
            }, { timeout: 1000 });
        });

        it("resets form after successful submission", async () => {
            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Esperar altura prefilled (evita flakiness en CI donde el mock puede ser más lento)
            await waitFor(() => {
                const alturaInput = screen.getByPlaceholderText(/^100-250$/) as HTMLInputElement;
                expect(alturaInput.value).toBe("180");
            });

            // Llenar formulario
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "82");

            // Agregar notas
            const notasInput = screen.getByPlaceholderText(/observaciones sobre este registro/i);
            await user.type(notasInput, "Test notes");

            // Submit
            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Esperar a que termine el submit
            await waitFor(() => {
                expect(screen.getByText(/registro creado correctamente/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verificar que el formulario se reseteó (peso y notas vacíos, fecha de hoy)
            await waitFor(() => {
                const pesoInputAfter = screen.getByPlaceholderText(/^20-300$/) as HTMLInputElement;
                expect(pesoInputAfter.value).toBe("");
                
                const notasInputAfter = screen.getByPlaceholderText(/observaciones sobre este registro/i) as HTMLTextAreaElement;
                expect(notasInputAfter.value).toBe("");
            });
        });

        it("handles API error during submission", async () => {
            server.use(getClientHandler, createProgressRecordErrorHandler);

            const user = userEvent.setup();
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Esperar a que altura se prellene desde el perfil del cliente
            await waitFor(() => {
                const alturaInput = screen.getByPlaceholderText(/^100-250$/) as HTMLInputElement;
                expect(alturaInput.value).toBe("180");
            });

            // Llenar peso (altura ya viene prefilled)
            const pesoInput = screen.getByPlaceholderText(/^20-300$/);
            await user.clear(pesoInput);
            await user.type(pesoInput, "82");

            // Submit
            const submitButton = screen.getByRole("button", { name: /guardar registro/i });
            await user.click(submitButton);

            // Verificar mensaje de error de API
            await waitFor(() => {
                expect(screen.getByText(/error al guardar el registro/i)).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe("Date Input Constraints", () => {
        beforeEach(() => {
            // Sobrescribir handler MSW solo para este bloque
            server.use(
                http.get("*/clients/1", () => {
                    return HttpResponse.json({
                        id: 1,
                        nombre: "Juan",
                        apellidos: "Pérez",
                        altura: 180,
                        fecha_alta: "2025-01-01",
                    });
                })
            );
        });

        it("max date is today", async () => {
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Buscar input de fecha por su tipo
            const fechaInput = screen.getByDisplayValue(new Date().toISOString().split("T")[0]) as HTMLInputElement;
            expect(fechaInput.type).toBe("date");
            const today = new Date().toISOString().split("T")[0];
            expect(fechaInput.max).toBe(today);
        });

        it("min date is fecha_alta when client has fecha_alta", async () => {
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            // Esperar a que el cliente se cargue y el min se establezca
            await waitFor(() => {
                const fechaInput = screen.getByDisplayValue(new Date().toISOString().split("T")[0]) as HTMLInputElement;
                expect(fechaInput.type).toBe("date");
                expect(fechaInput.min).toBe("2025-01-01");
            });
        });
    });

    describe("Form sections", () => {
        it("renders mediciones and fecha sections with weight/height inputs", async () => {
            render(<ProgressForm clientId={1} />);

            await waitFor(() => {
                expect(screen.queryByRole("status", { name: /cargando/i })).not.toBeInTheDocument();
            });

            expect(screen.getByRole("heading", { name: /mediciones corporales/i })).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/^20-300$/)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/^100-250$/)).toBeInTheDocument();
        });
    });
});

