import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AthleteSessionRunPage } from "./AthleteSessionRunPage";

const navigate = vi.fn();
const refetchRunProgress = vi.fn();
const showToast = vi.fn();

vi.mock("@/components/ui/feedback", async () => {
    const actual = await vi.importActual<typeof import("@/components/ui/feedback")>(
        "@/components/ui/feedback"
    );
    return {
        ...actual,
        useToast: () => ({ showToast }),
    };
});

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigate,
        useParams: () => ({ id: "42" }),
    };
});

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteRunProgressQuery: () => ({
        data: undefined,
        isSuccess: false,
        isError: true,
        isFetching: false,
        refetch: refetchRunProgress,
    }),
}));

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
        runSteps: [{ stepKey: "s1", kind: "single_set" }],
        step: 0,
        currentRunStep: { stepKey: "s1", kind: "single_set" },
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

describe("AthleteSessionRunPage progress error (RM-04 / D3)", () => {
    beforeEach(() => {
        navigate.mockClear();
        refetchRunProgress.mockClear();
    });

    it("muestra error de progreso y reintentar en lugar de cargar indefinidamente", () => {
        render(
            <MemoryRouter>
                <AthleteSessionRunPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/No pudimos cargar tu registro/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
        expect(screen.queryByRole("status", { name: /Cargando/i })).not.toBeInTheDocument();
    });
});
