/**
 * ClientInjuriesTab — B-09: marcar como resuelta, historial, sin borrado.
 */

import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { ClientInjuriesTab } from "../ClientInjuriesTab/ClientInjuriesTab";
import { server } from "@/test-utils/utils/msw";
import {
    clearRouterMocks,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";
import { CLIENT_INJURIES_RESOLVE_COPY } from "../ClientInjuriesTab/clientInjuriesTabPresentation";

const CLIENT_ID = 391;

function mockInjury(overrides: Partial<InjuryWithDetails> = {}): InjuryWithDetails {
    return {
        id: 11,
        client_id: CLIENT_ID,
        joint_id: 2,
        painful_movement_id: 4,
        pain_level: 3,
        severity: "moderate",
        is_active: true,
        start_date: "2026-11-01",
        created_at: "2026-11-01T10:00:00",
        updated_at: "2026-11-01T10:00:00",
        joint_name: "Knee",
        joint_name_es: "Rodilla",
        movement_name: "Flexion",
        movement_name_es: "Flexión",
        notes: null,
        ...overrides,
    };
}

describe("ClientInjuriesTab B-09", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validTrainerUser);
    });

    it("no ofrece eliminar: marca como resuelta y conserva el historial", async () => {
        const user = userEvent.setup();
        let stored = mockInjury();

        server.use(
            http.get("*/injuries/clients/:clientId", () => {
                return HttpResponse.json([stored], { status: 200 });
            }),
            http.put("*/injuries/:injuryId", async ({ request }) => {
                const body = (await request.json()) as { is_active?: boolean };
                stored = { ...stored, is_active: body.is_active === false ? false : stored.is_active };
                return HttpResponse.json(stored, { status: 200 });
            }),
        );

        render(<ClientInjuriesTab clientId={CLIENT_ID} />);

        expect(await screen.findByText("Rodilla")).toBeInTheDocument();
        expect(screen.getByText("Activa")).toBeInTheDocument();
        expect(screen.queryByLabelText("Eliminar")).not.toBeInTheDocument();
        expect(screen.queryByText(/eliminará permanentemente/i)).not.toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: CLIENT_INJURIES_RESOLVE_COPY.ariaLabel }),
        );

        const confirmModal = await screen.findByTestId("injury-resolve-confirm");
        expect(
            await screen.findByRole("heading", { name: CLIENT_INJURIES_RESOLVE_COPY.title }),
        ).toBeInTheDocument();
        expect(screen.getByText(CLIENT_INJURIES_RESOLVE_COPY.historyHint)).toBeInTheDocument();

        await user.click(
            within(confirmModal).getByRole("button", {
                name: CLIENT_INJURIES_RESOLVE_COPY.confirmLabel,
            }),
        );

        await waitFor(() => {
            expect(screen.getByText("Resuelta")).toBeInTheDocument();
        });
        expect(screen.getByText("Rodilla")).toBeInTheDocument();
        expect(screen.queryByText("Activa")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Resueltas" }));
        expect(await screen.findByText("Rodilla")).toBeInTheDocument();
        expect(screen.getByText("Resuelta")).toBeInTheDocument();
    });
});
