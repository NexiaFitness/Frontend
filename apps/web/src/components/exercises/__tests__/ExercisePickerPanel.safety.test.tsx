/**
 * ExercisePickerPanel.safety.test.tsx — Batch safety + flujo alternativas.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ExercisePickerPanel } from "../ExercisePickerPanel";
import type { Exercise } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyBatchResponse } from "@nexia/shared/types/engineSafety";

const useGetExercisesQuery = vi.fn();
const useCheckExerciseSafetyBatchMutation = vi.fn();
const useGetSafeAlternativesQuery = vi.fn();

vi.mock("@nexia/shared/hooks/exercises", () => ({
    useGetExercisesQuery: (...args: unknown[]) => useGetExercisesQuery(...args),
    useCheckExerciseSafetyBatchMutation: (...args: unknown[]) =>
        useCheckExerciseSafetyBatchMutation(...args),
    useGetSafeAlternativesQuery: (...args: unknown[]) => useGetSafeAlternativesQuery(...args),
}));

function minimalExercise(id: number, nombre: string): Exercise {
    const now = new Date().toISOString();
    return {
        id,
        exercise_id: `ex-${id}`,
        nombre,
        nombre_ingles: nombre,
        tipo: "fuerza",
        categoria: "compound",
        nivel: "intermediate",
        equipo: "barra",
        patron_movimiento: "empuje",
        tipo_carga: "externa",
        musculatura_principal: "cuádriceps",
        musculatura_secundaria: null,
        descripcion: null,
        instrucciones: null,
        notas: null,
        created_at: now,
        updated_at: now,
        is_active: true,
    };
}

const EX_UNSAFE = minimalExercise(101, "Press contraindicado");
const EX_SAFE = minimalExercise(102, "Curl seguro");
const EX_ALT = minimalExercise(201, "Press alternativa segura");

describe("ExercisePickerPanel — safety batch y alternativas", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useGetExercisesQuery.mockReturnValue({
            data: {
                exercises: [EX_UNSAFE, EX_SAFE],
                total: 2,
                skip: 0,
                limit: 500,
                has_more: false,
            },
            isLoading: false,
        });

        const batchPayload: ExerciseSafetyBatchResponse = {
            results: {
                101: {
                    is_safe: false,
                    blocking: true,
                    reason: "Lesión activa de rodilla",
                    suggested_alternatives: [],
                },
                102: {
                    is_safe: true,
                    blocking: false,
                    suggested_alternatives: [],
                },
            },
        };

        const checkBatch = vi.fn(() => ({
            unwrap: () => Promise.resolve(batchPayload),
        }));

        useCheckExerciseSafetyBatchMutation.mockReturnValue([checkBatch, { isLoading: false }]);

        useGetSafeAlternativesQuery.mockImplementation(
            (
                _params: { exerciseId: number; clientId: number },
                opts?: { skip?: boolean }
            ) => {
                if (opts?.skip) {
                    return { data: undefined, isLoading: false, isError: false };
                }
                return {
                    data: {
                        original_exercise_id: 101,
                        client_id: 1,
                        is_original_safe: false,
                        alternatives: [EX_ALT],
                        safety_results: [],
                        match_scores: {},
                        no_alternatives_found: false,
                        empty_reason: "none",
                    },
                    isLoading: false,
                    isError: false,
                };
            }
        );
    });

    it("ejercicio seguro: un clic llama onSelect", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <ExercisePickerPanel
                isOpen={true}
                onClose={vi.fn()}
                onSelect={onSelect}
                clientId={1}
                activeInjuries={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Curl seguro")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /Curl seguro/i }));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 102, nombre: "Curl seguro" })
        );
    });

    it("ejercicio inseguro: expande, abre alternativas y onSelect al elegir una", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <ExercisePickerPanel
                isOpen={true}
                onClose={vi.fn()}
                onSelect={onSelect}
                clientId={1}
                activeInjuries={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Press contraindicado")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /Press contraindicado/i }));

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /ver alternativas/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /ver alternativas/i }));

        expect(await screen.findByRole("heading", { name: /alternativas seguras/i })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /Press alternativa segura/i }));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 201, nombre: "Press alternativa segura" })
        );
    });

    it("ejercicio inseguro: Añadir con precaución llama onSelect con el ejercicio original", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <ExercisePickerPanel
                isOpen={true}
                onClose={vi.fn()}
                onSelect={onSelect}
                clientId={1}
                activeInjuries={[]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Press contraindicado")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /Press contraindicado/i }));

        await user.click(screen.getByRole("button", { name: /añadir con precaución/i }));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 101, nombre: "Press contraindicado" })
        );
    });
});
