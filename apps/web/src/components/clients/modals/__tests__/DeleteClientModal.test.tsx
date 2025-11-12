/**
 * DeleteClientModal.test.tsx — Test suite para modal de eliminación de cliente.
 *
 * Se valida:
 * - Render condicional (isOpen).
 * - Muestra título y descripción con nombre del cliente.
 * - Botón "Cancelar" ejecuta onClose.
 * - Botón "Desvincular cliente" dispara mutación y onDeleteSuccess.
 * - Mensaje de advertencia consistente con TYPOGRAPHY.errorText.
 *
 * Usa MSW para interceptar requests de eliminación de clientes.
 *
 * @since v4.3.9
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { DeleteClientModal } from "../DeleteClientModal";
import { createMockClient } from "@/test-utils/fixtures/clientFixture";
// Mock inline para este test específico
const mockUnlinkClient = vi.fn(() => ({
    unwrap: () => Promise.resolve({ message: "Client unlinked successfully" })
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
        mockUnlinkClient.mockClear();
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
            screen.getByRole("heading", { name: "Desvincular Cliente" })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                `¿Estás seguro de que deseas desvincular a ${mockClient.nombre} ${mockClient.apellidos}?`
            )
        ).toBeInTheDocument();
    });

    it("muestra la descripción del modal con el nombre del cliente", () => {
        render(<DeleteClientModal {...defaultProps} />);
        expect(
            screen.getByText(
                `¿Estás seguro de que deseas desvincular a ${mockClient.nombre} ${mockClient.apellidos}?`
            )
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
        await user.click(screen.getByRole("button", { name: /Desvincular cliente/i }));
        expect(mockUnlinkClient).toHaveBeenCalledTimes(1);
        expect(defaultProps.onDeleteSuccess).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("muestra mensaje de advertencia irreversible", () => {
        render(<DeleteClientModal {...defaultProps} />);
        expect(
            screen.getByText("Esta acción es irreversible.")
        ).toBeInTheDocument();
    });
});
