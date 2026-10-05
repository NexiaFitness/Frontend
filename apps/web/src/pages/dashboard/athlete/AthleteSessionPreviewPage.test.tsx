import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AthleteSessionPreviewPage } from "./AthleteSessionPreviewPage";

const navigate = vi.fn();
const submit = vi.fn();
const showToast = vi.fn();

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
            status: "planned",
            session_name: "QA Preview",
            notes: null,
        },
        isLoading: false,
    }),
}));

vi.mock("@nexia/shared/hooks/sessionProgramming", () => ({
    useSessionStructureView: () => ({
        view: {
            blocks: [{ id: 1, groups: [] }],
            totalExercises: 2,
            totalSets: 4,
        },
        isLoading: false,
    }),
}));

vi.mock("@nexia/shared/api/clientsApi", () => ({
    useGetClientFeedbackQuery: () => ({ data: [] }),
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
        logMode: false,
        enterLogMode: vi.fn(),
        exitLogMode: vi.fn(),
        logBlocks: [],
        pendingBlockCount: 0,
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
        registrationEditable: false,
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

describe("AthleteSessionPreviewPage wellbeing (B7)", () => {
    beforeEach(() => {
        navigate.mockClear();
        submit.mockClear();
        showToast.mockClear();
    });

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
