import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AthleteSessionPreviewPage } from "./AthleteSessionPreviewPage";

const navigate = vi.fn();
const submit = vi.fn();
const showToast = vi.fn();

const previewSessionMock = vi.hoisted(() => ({
    status: "planned" as "planned" | "completed",
}));

const sessionLogMock = vi.hoisted(() => ({
    logMode: false,
    pendingBlockCount: 0,
    logBlocks: [] as {
        sessionBlockId: number;
        status: string;
        hasRegisterableSteps: boolean;
    }[],
    registrationEditable: false,
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>(
        "react-router-dom"
    );
    return {
        ...actual,
        useNavigate: () => navigate,
        useParams: () => ({ id: "42" }),
    };
});

vi.mock("@/hooks/athlete/useWellbeingCheckIn", () => ({
    useWellbeingCheckIn: () => ({ submit, isLoading: false }),
}));

vi.mock("@/components/ui/feedback", async () => {
    const actual = await vi.importActual<typeof import("@/components/ui/feedback")>(
        "@/components/ui/feedback"
    );
    return {
        ...actual,
        useToast: () => ({ showToast }),
    };
});

vi.mock("@nexia/shared/hooks/athlete/useAthleteContext", () => ({
    useAthleteContext: () => ({ clientId: 7 }),
}));

vi.mock("@nexia/shared/api/trainingSessionsApi", () => ({
    useGetTrainingSessionQuery: () => ({
        data: {
            id: 42,
            status: previewSessionMock.status,
            session_name: "QA Preview",
            notes: null,
            session_date: "2026-10-05",
            planned_volume: 8,
            planned_intensity: 3,
        },
        isLoading: false,
    }),
    useGetWellbeingCheckInQuery: () => ({
        data: undefined,
        isFetching: false,
    }),
}));

vi.mock("@nexia/shared/hooks/sessionProgramming", () => ({
    useSessionStructureView: () => ({
        view: {
            blocks: [{ blockId: 1, blockTypeName: "Fuerza", groups: [] }],
            totalExercises: 2,
            totalSets: 4,
        },
        isLoading: false,
    }),
}));

vi.mock("@nexia/shared/api/clientsApi", () => ({
    useGetClientFeedbackQuery: () => ({ data: [] }),
}));

vi.mock("@nexia/shared/api/trainingPlansApi", () => ({
    useGetTrainingPlanQuery: () => ({ data: undefined }),
}));

vi.mock("@nexia/shared/api/athleteApi", () => ({
    useGetAthleteExerciseLastPerformanceQuery: () => ({
        data: undefined,
        isFetching: false,
        isError: false,
    }),
    useGetAthleteRunProgressQuery: () => ({
        data: undefined,
        isFetching: false,
    }),
}));

vi.mock("@/hooks/athlete/useAthleteInjuries", () => ({
    useAthleteInjuries: () => ({ activeInjuries: [], isLoading: false }),
}));

vi.mock("@/hooks/athlete/useAthleteSessionInjuryAlerts", () => ({
    useAthleteSessionInjuryAlerts: () => ({
        conflicts: [],
        conflictByExerciseId: {},
        isChecking: false,
    }),
}));

vi.mock("@/hooks/athlete/useAthleteSessionLoads", () => ({
    useAthleteSessionLoads: () => ({ loads: [], previousSession: null }),
}));

vi.mock("@/hooks/useMediaQuery", () => ({
    useIsAthleteDesktopLayout: () => false,
}));

vi.mock("@/hooks/athlete/useAthleteSessionLog", () => ({
    useAthleteSessionLog: () => ({
        logMode: sessionLogMock.logMode,
        enterLogMode: vi.fn(),
        exitLogMode: vi.fn(),
        logBlocks: sessionLogMock.logBlocks,
        pendingBlockCount: sessionLogMock.pendingBlockCount,
        isProgressLoading: false,
        isOnline: true,
        syncPendingCount: 0,
        activeBlock: null,
        blockDraft: null,
        setBlockDraft: vi.fn(),
        openBlock: vi.fn(),
        closeBlock: vi.fn(),
        saveActiveBlock: vi.fn(),
        markBlockNotPerformed: vi.fn(),
        saveError: null,
        isSavingBlock: false,
        registrationEditable: sessionLogMock.registrationEditable,
        forceCompleteSession: vi.fn().mockResolvedValue(true),
        completeSessionIfReady: vi.fn(),
        refetchProgress: vi.fn(),
    }),
}));

function renderPage() {
    return render(
        <MemoryRouter>
            <AthleteSessionPreviewPage />
        </MemoryRouter>
    );
}

beforeEach(() => {
    navigate.mockClear();
    submit.mockClear();
    showToast.mockClear();
    previewSessionMock.status = "planned";
    sessionLogMock.logMode = false;
    sessionLogMock.pendingBlockCount = 0;
    sessionLogMock.logBlocks = [];
    sessionLogMock.registrationEditable = false;
});

describe("AthleteSessionPreviewPage wellbeing (B7)", () => {

    it("Omitir navega al run sin llamar a la API", () => {
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Empezar entrenamiento/i }));
        fireEvent.click(screen.getByRole("button", { name: /^Omitir$/i }));

        expect(submit).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions/42/run");
    });

    it("si el check-in falla, muestra aviso y navega igual", async () => {
        submit.mockResolvedValueOnce("failed");
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Empezar entrenamiento/i }));
        const energyGroup = screen.getByRole("radiogroup", {
            name: /Nivel de energía/i,
            hidden: true,
        });
        fireEvent.click(energyGroup.querySelectorAll("button")[0]!);
        fireEvent.click(
            screen.getAllByRole("button", { name: /Empezar entrenamiento/i })[1]!
        );

        await waitFor(() => {
            expect(submit).toHaveBeenCalledWith(1);
        });
        expect(showToast).toHaveBeenCalledWith(
            "warning",
            expect.stringContaining("No se pudo guardar")
        );
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions/42/run");
    });

    it("si guarda, navega sin aviso", async () => {
        submit.mockResolvedValueOnce("saved");
        renderPage();
        fireEvent.click(screen.getByRole("button", { name: /Empezar entrenamiento/i }));
        const energyGroup = screen.getByRole("radiogroup", {
            name: /Nivel de energía/i,
            hidden: true,
        });
        fireEvent.click(energyGroup.querySelectorAll("button")[1]!);
        fireEvent.click(
            screen.getAllByRole("button", { name: /Empezar entrenamiento/i })[1]!
        );

        await waitFor(() => {
            expect(submit).toHaveBeenCalledWith(2);
        });
        expect(showToast).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith("/dashboard/sessions/42/run");
    });
});

describe("AthleteSessionPreviewPage planned load (AGENDA spec)", () => {
    it("muestra barritas VOL/INT en la cabecera de la sesión", () => {
        renderPage();
        expect(
            screen.getByRole("button", { name: /Volumen 8 de 10, intensidad 3 de 10/i })
        ).toBeInTheDocument();
    });
});

describe("AthleteSessionPreviewPage registro FE-9", () => {
    it("sesión completada con bloques pendientes muestra Completar registro, no solo feedback", () => {
        previewSessionMock.status = "completed";
        sessionLogMock.logMode = true;
        sessionLogMock.pendingBlockCount = 2;
        sessionLogMock.registrationEditable = true;
        sessionLogMock.logBlocks = [
            { sessionBlockId: 1, status: "registered", hasRegisterableSteps: true },
            { sessionBlockId: 2, status: "pending", hasRegisterableSteps: true },
        ];

        renderPage();

        expect(
            screen.getByRole("button", { name: /Completar registro \(2\)/i })
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /Enviar feedback/i })
        ).not.toBeInTheDocument();
    });
});
