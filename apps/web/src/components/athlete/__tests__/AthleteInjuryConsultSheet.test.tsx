/**
 * AthleteInjuryConsultSheet.test.tsx — El panel no promete un mensaje.
 * Antes de completar cierra con «Entendido». Después abre el feedback existente.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { AthleteInjuryConsultSheet } from "@/components/athlete/AthleteInjuryConsultSheet";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const injury: InjuryWithDetails = {
    id: 8,
    client_id: 1,
    joint_id: 7,
    painful_movement_id: 1,
    pain_level: 3,
    severity: "moderate",
    is_active: true,
    start_date: "2026-11-06",
    created_at: "2026-11-06T00:00:00Z",
    updated_at: "2026-11-06T00:00:00Z",
    joint_name_es: "Columna Lumbar",
    movement_name_es: "Flexión",
};

describe("AthleteInjuryConsultSheet", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    it("sin sesión completada cierra con Entendido y no navega", async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(
            <AthleteInjuryConsultSheet
                isOpen
                onClose={onClose}
                injuries={[injury]}
                sessionId={1}
                sessionCompleted={false}
            />
        );

        expect(
            screen.getByText(/Consultar no envía un mensaje/i)
        ).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "Entendido" }));
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("con la sesión completada abre el feedback de esa sesión", async () => {
        const user = userEvent.setup();
        render(
            <AthleteInjuryConsultSheet
                isOpen
                onClose={vi.fn()}
                injuries={[injury]}
                sessionId={4}
                sessionCompleted
                hasSessionFeedback={false}
            />
        );

        await user.click(screen.getByRole("button", { name: "Cuéntale en el feedback" }));
        expect(mockNavigate).toHaveBeenCalledWith(
            "/dashboard/sessions/4/feedback?focus=pain"
        );
    });

    it("si ya hay feedback abre las notas enviadas", async () => {
        const user = userEvent.setup();
        render(
            <AthleteInjuryConsultSheet
                isOpen
                onClose={vi.fn()}
                injuries={[injury]}
                sessionId={4}
                sessionCompleted
                hasSessionFeedback
            />
        );

        await user.click(screen.getByRole("button", { name: "Ver mis notas de esta sesión" }));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/feedback");
    });
});
