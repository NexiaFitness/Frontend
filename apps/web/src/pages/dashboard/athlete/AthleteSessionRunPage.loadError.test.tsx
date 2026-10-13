/**
 * AthleteSessionRunPage.loadError.test.tsx — Error de carga de la sesion en el guiado (DBG-TO-02).
 *
 * Proposito: si la estructura o la sesion no cargan (p. ej. timeout), la pantalla muestra
 * "No pudimos cargar tu registro" con Reintentar en lugar de "no tiene ejercicios" o un skeleton eterno.
 * Contexto: auditoria debug/claude-code-2026-10-13; complementa AthleteSessionRunPage.test.tsx (error de progreso).
 * Notas: mismo patron de mocks que AthleteSessionRunPage.test.tsx; el progreso carga bien.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AthleteSessionRunPage } from "./AthleteSessionRunPage";

const retryLoad = vi.fn();
const refetchRunProgress = vi.fn();

vi.mock("@/components/ui/feedback", async () => {
    const actual = await vi.importActual<typeof import("@/components/ui/feedback")>(
        "@/components/ui/feedback"
    );
    return { ...actual, useToast: () => ({ showToast: vi.fn() }) };
});

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({ id: "42" }) };
});

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteRunProgressQuery: () => ({
        currentData: {
            training_session_id: 42,
            steps: [],
            blocks: [],
            pending_count: 0,
            registration_editable: true,
        },
        isError: false,
        isFetching: false,
        refetch: refetchRunProgress,
    }),
}));

vi.mock("@nexia/shared/hooks/offline/useOnlineStatus", () => ({ useOnlineStatus: () => true }));

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
        loadError: true,
        retryLoad,
        runProgress: null,
        flatExercises: [],
    }),
}));

vi.mock("@/hooks/useMediaQuery", () => ({ useIsAthleteDesktopLayout: () => false }));

vi.mock("@/hooks/athlete/useAthleteSessionInjuryAlerts", () => ({
    useAthleteSessionInjuryAlerts: () => ({ conflictByExerciseId: new Map(), handleConsultTrainer: vi.fn() }),
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

describe("AthleteSessionRunPage — error de carga de la sesion (DBG-TO-02)", () => {
    beforeEach(() => {
        retryLoad.mockClear();
        refetchRunProgress.mockClear();
    });

    it("muestra 'No pudimos cargar tu registro' con Reintentar, no el estado vacio", () => {
        render(
            <MemoryRouter>
                <AthleteSessionRunPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/No pudimos cargar tu registro/i)).toBeInTheDocument();
        expect(screen.queryByText(/no tiene ejercicios configurados/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
        expect(retryLoad).toHaveBeenCalledTimes(1);
    });
});
