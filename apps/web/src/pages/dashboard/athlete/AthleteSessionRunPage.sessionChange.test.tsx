/**
 * AthleteSessionRunPage.sessionChange.test.tsx — Sesion cerrada tras cambio de sesion en la misma pestana (DBG-F-01).
 *
 * Proposito: la pagina no debe pasar la puerta de progreso (registration_editable) con el progreso de
 * la sesion anterior mientras carga el de la sesion nueva.
 * Contexto: la ruta sessions/:id/run reutiliza el componente; RTK conserva `data` (y `isSuccess`) del arg previo.
 * Notas: store RTK real + MSW para el progreso; el resto de hooks se mockean como en AthleteSessionRunPage.test.tsx.
 * Marcador de "puerta superada": con runSteps vacios la pagina pinta "no tiene ejercicios configurados".
 * useParams se mockea con un id mutable: en este entorno vitest, useParams devuelve {} incluso dentro de una
 * ruta casada (verificado con createMemoryRouter y con MemoryRouter+Routes); la navegacion real se observa con useLocation.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse, delay } from "msw";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { AthleteRunProgress } from "@nexia/shared/types/athleteRunProgress";
import { createTestStore } from "@/test-utils/utils/store";
import { server } from "@/test-utils/utils/msw";
import { AthleteSessionRunPage } from "./AthleteSessionRunPage";

let routeId = "1";

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useParams: () => ({ id: routeId }) };
});

function LocationProbe() {
    return <p data-testid="pathname">{useLocation().pathname}</p>;
}

vi.mock("@/components/ui/feedback", async () => {
    const actual = await vi.importActual<typeof import("@/components/ui/feedback")>(
        "@/components/ui/feedback"
    );
    return { ...actual, useToast: () => ({ showToast: vi.fn() }) };
});

vi.mock("@nexia/shared/hooks/offline/useOnlineStatus", () => ({
    useOnlineStatus: () => true,
}));

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 7 }),
}));

vi.mock("@/hooks/athlete/useAthleteInjuries", () => ({
    useAthleteInjuries: () => ({ activeInjuries: [], hasActiveInjuries: false }),
}));

vi.mock("@/hooks/athlete/useAthleteRunExerciseNotes", () => ({
    useAthleteRunExerciseNotes: () => ({
        persistSlots: vi.fn(),
        getDraftForSlot: vi.fn(),
        setDraftForSlot: vi.fn(),
        registrationEditable: true,
    }),
}));

vi.mock("@/hooks/athlete/useAthleteSessionRun", () => ({
    useAthleteSessionRun: () => ({
        isOnline: true,
        pendingCount: 0,
        runSteps: [],
        step: 0,
        currentRunStep: undefined,
        isGroupRound: false,
        isTimedBlock: false,
        isLoading: false,
        runProgress: null,
        flatExercises: [],
    }),
}));

vi.mock("@/hooks/useMediaQuery", () => ({
    useIsAthleteDesktopLayout: () => false,
}));

vi.mock("@/hooks/athlete/useAthleteSessionInjuryAlerts", () => ({
    useAthleteSessionInjuryAlerts: () => ({
        conflictByExerciseId: new Map(),
        handleConsultTrainer: vi.fn(),
    }),
}));

vi.mock("@/hooks/athlete/useAthleteRunSessionMenu", () => ({
    useAthleteRunSessionMenu: () => ({
        menuOpen: false,
        setMenuOpen: vi.fn(),
        menuItems: [],
        terminateOpen: false,
        setTerminateOpen: vi.fn(),
        onConfirmTerminate: vi.fn(),
        isTerminating: false,
    }),
}));

const progress = (sessionId: number, editable: boolean): AthleteRunProgress => ({
    training_session_id: sessionId,
    steps: [],
    blocks: [],
    pending_count: 0,
    registration_editable: editable,
});

describe("AthleteSessionRunPage — cambio a una sesion cerrada (DBG-F-01)", () => {
    it("no pinta el guiado de la sesion 2 con el progreso editable de la sesion 1", async () => {
        server.use(
            http.get("*/athlete/run-context/sessions/1/progress", () =>
                HttpResponse.json(progress(1, true))
            ),
            http.get("*/athlete/run-context/sessions/2/progress", async () => {
                await delay(200);
                return HttpResponse.json(progress(2, false));
            })
        );

        routeId = "1";
        const store = createTestStore();
        const tree = () => (
            <Provider store={store}>
                <MemoryRouter initialEntries={["/dashboard/sessions/1/run"]}>
                    <AthleteSessionRunPage />
                    <LocationProbe />
                </MemoryRouter>
            </Provider>
        );
        const { rerender } = render(tree());

        await screen.findByText(/no tiene ejercicios configurados/i);

        routeId = "2";
        rerender(tree());

        expect(screen.queryByText(/no tiene ejercicios configurados/i)).not.toBeInTheDocument();
        expect(screen.getByRole("status", { name: /Cargando/i })).toBeInTheDocument();

        await waitFor(() =>
            expect(screen.getByTestId("pathname")).toHaveTextContent("/dashboard/sessions/2")
        );
    });
});
