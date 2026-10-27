/**
 * ExercisePickerPanel.safety.test.tsx — Batch safety + flujo alternativas.
 * H4: fila «no verificable» (sin acciones articulares) y fallo del lote (nunca «seguro»).
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
        tipo: "multiarticular",
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
                    status: "unsafe",
                    blocking: true,
                    reason: "Lesión activa de rodilla",
                    suggested_alternatives: [],
                },
                102: {
                    is_safe: true,
                    status: "safe",
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

    it("solo lista ejercicios con contrato completo (H1)", () => {
        render(
            <ExercisePickerPanel
                isOpen={true}
                onClose={vi.fn()}
                onSelect={vi.fn()}
                clientId={1}
                activeInjuries={[]}
            />
        );
        expect(useGetExercisesQuery).toHaveBeenCalledWith(
            expect.objectContaining({ contract: "complete", client_id: 1 })
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
    it("H4: no verificable se marca y se añade solo con «Añadir sin verificar»", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const payload: ExerciseSafetyBatchResponse = {
            results: {
                101: {
                    is_safe: false,
                    status: "not_verifiable",
                    unverifiable_reason: "no_joint_actions",
                    blocking: false,
                    reason: "No se puede comprobar con la lesión activa.",
                    suggested_alternatives: [],
                },
                102: { is_safe: true, status: "safe", blocking: false, suggested_alternatives: [] },
            },
        };
        useCheckExerciseSafetyBatchMutation.mockReturnValue([
            vi.fn(() => ({ unwrap: () => Promise.resolve(payload) })),
            { isLoading: false },
        ]);
        render(
            <ExercisePickerPanel isOpen onClose={vi.fn()} onSelect={onSelect} clientId={1} activeInjuries={[]} />
        );

        expect(await screen.findByText("SIN VERIFICAR")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /Press contraindicado/i }));
        expect(onSelect).not.toHaveBeenCalled();
        await user.click(screen.getByRole("button", { name: /añadir sin verificar/i }));
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 101 }));
    });

    it("H4: si falla el lote se avisa, se puede reintentar y nada aparece como seguro", async () => {
        const user = userEvent.setup();
        const checkBatch = vi.fn(() => ({ unwrap: () => Promise.reject(new Error("network")) }));
        useCheckExerciseSafetyBatchMutation.mockReturnValue([checkBatch, { isLoading: false }]);
        render(
            <ExercisePickerPanel isOpen onClose={vi.fn()} onSelect={vi.fn()} clientId={1} activeInjuries={[]} />
        );

        expect(await screen.findByText(/no se pudo comprobar la seguridad/i)).toBeInTheDocument();
        expect(screen.getAllByLabelText("Seguridad sin comprobar")).toHaveLength(2);
        await user.click(screen.getByRole("button", { name: /reintentar/i }));
        await waitFor(() => expect(checkBatch).toHaveBeenCalledTimes(2));
    });
});
