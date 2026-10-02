/**
 * ScreenStateCard.test.tsx — tarjeta de estado de pantalla (B2).
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { ScreenStateCard } from "../ScreenStateCard";
import { Button } from "@/components/ui/buttons";

describe("ScreenStateCard", () => {
    it("renderiza código, título, body y acciones", () => {
        render(
            <ScreenStateCard
                code="404"
                title="No encontramos esta página"
                body="La dirección no existe."
                actions={<Button variant="primary">Ir al inicio</Button>}
            />,
        );

        expect(screen.getByText("404")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: /no encontramos esta página/i }),
        ).toBeInTheDocument();
        expect(screen.getByText(/la dirección no existe/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ir al inicio/i })).toBeInTheDocument();
    });

    it("usa role=status por defecto y role=alert cuando se pide", () => {
        const { rerender } = render(
            <ScreenStateCard title="Aviso" body="Cuerpo" />,
        );
        expect(screen.getByRole("status")).toBeInTheDocument();

        rerender(
            <ScreenStateCard title="Crash" body="Error" role="alert" aria-live="assertive" />,
        );
        expect(screen.getByRole("alert")).toBeInTheDocument();
    });
});
