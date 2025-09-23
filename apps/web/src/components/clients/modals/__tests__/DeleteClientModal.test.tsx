/**
 * DeleteClientModal.test.tsx — Test suite para modal de eliminación de cliente.
 *
 * Se valida:
 * - Render condicional (isOpen).
 * - Muestra título, descripción y datos del cliente.
 * - Botón "Cancelar" ejecuta onClose.
 * - Botón "Eliminar cliente" dispara mutación y onDeleteSuccess.
 * - Mensaje de advertencia consistente con TYPOGRAPHY.errorText.
 *
 * @since v4.3.9
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { DeleteClientModal } from "../DeleteClientModal";
import { createMockClient } from "@/test-utils/fixtures/clientFixture";

// Mock de la mutation hook
vi.mock("@shared/api/clientsApi", () => ({
    useDeleteClientMutation: () => [
        vi.fn(() => ({ unwrap: () => Promise.resolve() })),
        { isLoading: false },
    ],
}));

const mockClient = createMockClient();

describe("DeleteClientModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        client: mockClient,
        onDeleteSuccess: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("no renderiza nada si isOpen=false", () => {
        const { container } = render(
            <DeleteClientModal {...defaultProps} isOpen={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it("renderiza título y descripción", () => {
        render(<DeleteClientModal {...defaultProps} />);
        expect(
            screen.getByRole("heading", { name: "Eliminar Cliente" })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                `¿Estás seguro de que deseas eliminar a ${mockClient.nombre} ${mockClient.apellidos}?`
            )
        ).toBeInTheDocument();
    });

    it("muestra los datos del cliente (email y objetivo)", () => {
        render(<DeleteClientModal {...defaultProps} />);
        expect(screen.getByText("Email:")).toBeInTheDocument();
        expect(screen.getByText(mockClient.email)).toBeInTheDocument();
        expect(screen.getByText("Objetivo:")).toBeInTheDocument();
        expect(
            screen.getByText(mockClient.objetivo.replace("_", " "))
        ).toBeInTheDocument();
    });

    it("ejecuta onClose al pulsar 'Cancelar'", async () => {
        const user = userEvent.setup();
        render(<DeleteClientModal {...defaultProps} />);
        await user.click(screen.getByRole("button", { name: "Cancelar" }));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("ejecuta onDeleteSuccess tras confirmar eliminación", async () => {
        const user = userEvent.setup();
        render(<DeleteClientModal {...defaultProps} />);
        await user.click(screen.getByRole("button", { name: "Eliminar cliente" }));
        expect(defaultProps.onDeleteSuccess).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra mensaje de advertencia irreversible", () => {
        render(<DeleteClientModal {...defaultProps} />);
        expect(
            screen.getByText("Esta acción no se puede deshacer.")
        ).toBeInTheDocument();
    });
});
