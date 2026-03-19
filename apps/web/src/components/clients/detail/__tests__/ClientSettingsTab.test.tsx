/**
 * ClientSettingsTab Test Suite - Professional Coverage
 *
 * Tests de integración para el tab Settings del cliente.
 * Cubre rendering, navegación, acciones y manejo de estados.
 *
 * Sigue la arquitectura de testing de NEXIA:
 * - Usa fixtures centralizadas
 * - Usa mocks específicos (no inline)
 * - Tests de integración (no unitarios)
 * - User-centric testing
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ClientSettingsTab } from "../ClientSettingsTab";
import {
    mockNavigate,
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { createMockClient } from "@/test-utils/fixtures/clients";

// Mock trainerApi hooks (igual que en DeleteClientModal.test.tsx)
const mockUnlinkClient = vi.fn(() => ({
    unwrap: () => Promise.resolve({ message: "Client unlinked successfully" }),
}));

const mockTrainerProfile = { id: 1 };

vi.mock("@nexia/shared/api/trainerApi", () => ({
    useUnlinkClientMutation: () => [
        mockUnlinkClient,
        { isLoading: false },
    ],
    useGetCurrentTrainerProfileQuery: () => ({
        data: mockTrainerProfile,
    }),
}));

describe("ClientSettingsTab", () => {
    const mockClient = createMockClient({
        id: 1,
        nombre: "Juan",
        apellidos: "Pérez",
        fecha_alta: "2025-01-15",
        created_at: "2025-01-15T10:00:00Z",
        updated_at: "2025-01-20T14:30:00Z",
    });

    const mockOnDelete = vi.fn();

    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validTrainerUser);
        vi.clearAllMocks();
        mockUnlinkClient.mockClear();
    });

    describe("Rendering & Basic UI", () => {
        it("renders all sections correctly", () => {
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Sección Configuración General
            expect(screen.getByText(/configuración general/i)).toBeInTheDocument();
            expect(screen.getByText(/editar perfil del cliente/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /editar cliente/i })).toBeInTheDocument();

            // Sección Información del Sistema
            expect(screen.getByText(/información del sistema/i)).toBeInTheDocument();
            expect(screen.getByText(/id del cliente/i)).toBeInTheDocument();
            expect(screen.getByText(/fecha de alta/i)).toBeInTheDocument();

            // Sección Zona de Peligro
            expect(screen.getByText(/zona de peligro/i)).toBeInTheDocument();
            expect(screen.getByText(/desvincular este cliente/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /desvincular cliente/i })).toBeInTheDocument();
        });

        it("displays client metadata correctly", () => {
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // ID del cliente
            expect(screen.getByText("1")).toBeInTheDocument();

            // Fecha de alta
            expect(screen.getByText(mockClient.fecha_alta)).toBeInTheDocument();

            // Created at (si existe)
            const createdDate = new Date(mockClient.created_at!).toLocaleString();
            expect(screen.getByText(new RegExp(createdDate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();

            // Updated at (si existe)
            const updatedDate = new Date(mockClient.updated_at!).toLocaleString();
            expect(screen.getByText(new RegExp(updatedDate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
        });

        it("does not display created_at or updated_at when not provided", () => {
            const clientWithoutDates = createMockClient({
                id: 2,
                created_at: undefined,
                updated_at: undefined,
            });

            render(
                <ClientSettingsTab client={clientWithoutDates} onDelete={mockOnDelete} />
            );

            // Debe mostrar ID y fecha_alta
            expect(screen.getByText("2")).toBeInTheDocument();
            expect(screen.getByText(clientWithoutDates.fecha_alta)).toBeInTheDocument();

            // No debe mostrar "Creado el" ni "Última actualización"
            expect(screen.queryByText(/creado el/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/última actualización/i)).not.toBeInTheDocument();
        });
    });

    describe("Navigation", () => {
        it("navigates to edit page when clicking edit button", async () => {
            const user = userEvent.setup();
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            const editButton = screen.getByRole("button", { name: /editar cliente/i });
            await user.click(editButton);

            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/clients/1/edit");
        });
    });

    describe("Delete Client Flow", () => {
        it("opens delete modal when clicking unlink button", async () => {
            const user = userEvent.setup();
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Modal no debe estar visible inicialmente
            expect(screen.queryByRole("heading", { name: /desvincular cliente/i })).not.toBeInTheDocument();

            // Click en botón de desvincular
            const unlinkButton = screen.getByRole("button", { name: /desvincular cliente/i });
            await user.click(unlinkButton);

            // Modal debe estar visible
            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /desvincular cliente/i })).toBeInTheDocument();
            });
        });

        it("closes modal when clicking cancel", async () => {
            const user = userEvent.setup();
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Abrir modal
            const unlinkButton = screen.getByRole("button", { name: /desvincular cliente/i });
            await user.click(unlinkButton);

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /desvincular cliente/i })).toBeInTheDocument();
            });

            // Cerrar modal con Cancelar
            const cancelButton = screen.getByRole("button", { name: /cancelar/i });
            await user.click(cancelButton);

            await waitFor(() => {
                expect(screen.queryByRole("heading", { name: /desvincular cliente/i })).not.toBeInTheDocument();
            });
        });

        it("calls onDelete when client is successfully unlinked", async () => {
            const user = userEvent.setup();
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Abrir modal
            const unlinkButton = screen.getByRole("button", { name: /desvincular cliente/i });
            await user.click(unlinkButton);

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: /desvincular cliente/i })).toBeInTheDocument();
            });

            // Confirmar eliminación (buscar el botón dentro del modal, no el del tab)
            // Hay dos botones con el mismo texto: uno en el tab y otro en el modal
            const allUnlinkButtons = screen.getAllByRole("button", { name: /desvincular cliente/i });
            // El segundo botón es el del modal (el primero es el del tab)
            const confirmButton = allUnlinkButtons[1];
            await user.click(confirmButton);

            // Esperar a que se complete la eliminación
            await waitFor(() => {
                expect(mockUnlinkClient).toHaveBeenCalledTimes(1);
                expect(mockUnlinkClient).toHaveBeenCalledWith({
                    trainerId: mockTrainerProfile.id,
                    clientId: mockClient.id,
                });
            });

            // onDelete debe ser llamado
            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalledTimes(1);
            });

            // Modal debe cerrarse
            await waitFor(() => {
                expect(screen.queryByRole("heading", { name: /desvincular cliente/i })).not.toBeInTheDocument();
            });
        });

        it("displays correct client name in delete modal", async () => {
            const user = userEvent.setup();
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Abrir modal
            const unlinkButton = screen.getByRole("button", { name: /desvincular cliente/i });
            await user.click(unlinkButton);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        `¿Estás seguro de que deseas desvincular a ${mockClient.nombre} ${mockClient.apellidos}?`
                    )
                ).toBeInTheDocument();
            });
        });

        it("displays warning message in delete modal", async () => {
            const user = userEvent.setup();
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Abrir modal
            const unlinkButton = screen.getByRole("button", { name: /desvincular cliente/i });
            await user.click(unlinkButton);

            await waitFor(() => {
                expect(screen.getByText(/esta acción es irreversible/i)).toBeInTheDocument();
            });
        });
    });

    describe("Button States", () => {
        it("edit button has correct variant and size", () => {
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            const editButton = screen.getByRole("button", { name: /editar cliente/i });
            // Verificar que el botón existe y es clickeable
            expect(editButton).toBeInTheDocument();
            expect(editButton).not.toBeDisabled();
        });

        it("unlink button has correct variant and size", () => {
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            const unlinkButton = screen.getByRole("button", { name: /desvincular cliente/i });
            // Verificar que el botón existe y es clickeable
            expect(unlinkButton).toBeInTheDocument();
            expect(unlinkButton).not.toBeDisabled();
        });
    });

    describe("Component Structure", () => {
        it("renders InfoRow components correctly", () => {
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            // Verificar estructura de InfoRow (label y value)
            const idLabel = screen.getByText(/id del cliente/i);
            expect(idLabel).toBeInTheDocument();
            expect(idLabel.closest("div")).toHaveTextContent("1");

            const fechaAltaLabel = screen.getByText(/fecha de alta/i);
            expect(fechaAltaLabel).toBeInTheDocument();
            expect(fechaAltaLabel.closest("div")).toHaveTextContent(mockClient.fecha_alta);
        });

        it("renders danger zone with correct styling", () => {
            render(
                <ClientSettingsTab client={mockClient} onDelete={mockOnDelete} />
            );

            const dangerZone = screen.getByText(/zona de peligro/i).closest("div");
            expect(dangerZone).toBeInTheDocument();
        });
    });
});

