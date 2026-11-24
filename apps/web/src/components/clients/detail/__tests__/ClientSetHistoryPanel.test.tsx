/**
 * ClientSetHistoryPanel.test.tsx — Filtro por ejercicio del historial por serie (PERF-7 L9).
 *
 * Contexto: sin historial el panel ya no ofrece ejercicios del catálogo para filtrar
 * (ninguno daría resultados). El ejercicio seleccionado que no aparece en el historial
 * se nombra por id con useExerciseNamesByIds.
 *
 * @author Frontend Team
 * @since v6.2.0
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test-utils/render";
import { ClientSetHistoryPanel } from "../ClientSetHistoryPanel";
import { SET_HISTORY_EMPTY_TITLE } from "../clientSetHistoryPresentation";

const useClientSetHistory = vi.fn();
const useExerciseNamesByIds = vi.fn();
const useGetExercisesQuery = vi.fn();

vi.mock("@nexia/shared/hooks/clients/useClientSetHistory", () => ({
    useClientSetHistory: (...args: unknown[]) => useClientSetHistory(...args),
}));

vi.mock("@nexia/shared/hooks/exercises", () => ({
    useExerciseNamesByIds: (...args: unknown[]) => useExerciseNamesByIds(...args),
    useGetExercisesQuery: (...args: unknown[]) => useGetExercisesQuery(...args),
}));

vi.mock("../ClientExerciseLoadPanel", () => ({
    ClientExerciseLoadPanel: ({ exerciseName }: { exerciseName?: string }) => (
        <p data-testid="load-panel">{exerciseName ?? "sin nombre"}</p>
    ),
}));

function historyResult(exerciseOptions: { id: number; name: string }[]) {
    return {
        sessions: [],
        total: 0,
        exerciseOptions,
        isLoading: false,
        isEmpty: true,
        error: undefined,
    };
}

describe("ClientSetHistoryPanel (PERF-7 L9)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useExerciseNamesByIds.mockReturnValue({
            namesById: new Map(),
            exercisesById: new Map(),
            isLoading: false,
            isError: false,
        });
    });

    it("sin historial muestra el estado vacío y no ofrece ejercicios del catálogo", () => {
        useClientSetHistory.mockReturnValue(historyResult([]));

        render(<ClientSetHistoryPanel clientId={390} />);

        expect(screen.getByText(SET_HISTORY_EMPTY_TITLE)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Filtrar por ejercicio" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Filtrar por periodo" })).toBeInTheDocument();
        expect(useGetExercisesQuery).not.toHaveBeenCalled();
        expect(useExerciseNamesByIds).toHaveBeenLastCalledWith([]);
    });

    it("nombra por id el ejercicio seleccionado que no está en el historial", () => {
        useClientSetHistory.mockReturnValue(historyResult([]));
        useExerciseNamesByIds.mockReturnValue({
            namesById: new Map([[42, "Sentadilla trasera"]]),
            exercisesById: new Map(),
            isLoading: false,
            isError: false,
        });

        render(<ClientSetHistoryPanel clientId={390} initialExerciseId={42} />);

        expect(useExerciseNamesByIds).toHaveBeenLastCalledWith([42]);
        expect(screen.getByRole("button", { name: "Filtrar por ejercicio" })).toHaveTextContent(
            "Sentadilla trasera",
        );
        expect(screen.getByTestId("load-panel")).toHaveTextContent("Sentadilla trasera");
    });

    it("con historial no pide nombres: salen del propio historial", () => {
        useClientSetHistory.mockReturnValue(historyResult([{ id: 42, name: "Sentadilla trasera" }]));

        render(<ClientSetHistoryPanel clientId={390} initialExerciseId={42} />);

        expect(useExerciseNamesByIds).toHaveBeenLastCalledWith([]);
        expect(screen.getByTestId("load-panel")).toHaveTextContent("Sentadilla trasera");
    });
});
