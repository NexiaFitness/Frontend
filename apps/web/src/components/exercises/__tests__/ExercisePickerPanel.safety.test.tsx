/**
 * ExercisePickerPanel.safety.test.tsx — Batch safety + flujo alternativas.
 * H4: fila «no verificable» (sin acciones articulares) y fallo del lote (nunca «seguro»).
 * PERF-7: la lista sale del listado completo `view=picker` (sin tope), nunca del lookup
 * por ids (que resuelve ejercicios desactivados); si falla la carga se avisa. FE-2: la
 * lista está virtualizada y solo monta las filas visibles.
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { ExercisePickerPanel } from "../ExercisePickerPanel";
import type { Exercise, ExercisePickerOut } from "@nexia/shared/hooks/exercises";
import type { ExerciseSafetyBatchResponse } from "@nexia/shared/types/engineSafety";

const useGetExercisePickerLibraryQuery = vi.fn();
const useCheckExerciseSafetyBatchMutation = vi.fn();
const useGetSafeAlternativesQuery = vi.fn();
const useGetExercisesQuery = vi.fn();
const useGetExercisesByIdsQuery = vi.fn();
const useExerciseNamesByIds = vi.fn();

vi.mock("@nexia/shared/hooks/exercises", () => ({
    useGetExercisePickerLibraryQuery: (...args: unknown[]) =>
        useGetExercisePickerLibraryQuery(...args),
    useCheckExerciseSafetyBatchMutation: (...args: unknown[]) =>
        useCheckExerciseSafetyBatchMutation(...args),
    useGetSafeAlternativesQuery: (...args: unknown[]) => useGetSafeAlternativesQuery(...args),
    useGetExercisesQuery: (...args: unknown[]) => useGetExercisesQuery(...args),
    useGetExercisesByIdsQuery: (...args: unknown[]) => useGetExercisesByIdsQuery(...args),
    useExerciseNamesByIds: (...args: unknown[]) => useExerciseNamesByIds(...args),
}));

const pickerRow = (id: number, nombre: string): ExercisePickerOut => ({
    id,
    nombre,
    nombre_ingles: nombre,
});

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
        created_at: now,
        updated_at: now,
        is_active: true,
    };
}

const EX_UNSAFE = pickerRow(101, "Press contraindicado");
const EX_SAFE = pickerRow(102, "Curl seguro");
const EX_ALT = minimalExercise(201, "Press alternativa segura");

describe("ExercisePickerPanel — safety batch y alternativas", () => {
    // jsdom no tiene layout y la lista virtualizada no pinta sin alto: el panel mide 600×300
    // y cada fila 46 px.
    const layout = { clientHeight: 600, clientWidth: 300, offsetHeight: 46 } as const;
    const original = Object.fromEntries(
        Object.keys(layout).map((prop) => [
            prop,
            Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop),
        ])
    );
    beforeAll(() => {
        for (const [prop, value] of Object.entries(layout)) {
            Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get: () => value });
        }
    });
    afterAll(() => {
        for (const [prop, descriptor] of Object.entries(original)) {
            if (descriptor) Object.defineProperty(HTMLElement.prototype, prop, descriptor);
        }
    });

    beforeEach(() => {
        vi.clearAllMocks();

        useGetExercisePickerLibraryQuery.mockReturnValue({
            data: { exercises: [EX_UNSAFE, EX_SAFE], equipment_filter_applied: "active" },
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });

        const batchPayload: ExerciseSafetyBatchResponse = {
            results: {
                101: {
                    is_safe: false,
                    status: "unsafe",
                    blocking: false,
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

    /** Espera a que el lote de seguridad pinte sus veredictos (evita updates fuera de act). */
    const waitForSafetyVerdicts = () =>
        waitFor(() =>
            expect(screen.queryAllByLabelText("Seguridad sin comprobar")).toHaveLength(0)
        );

    it("solo lista ejercicios con contrato completo (H1)", async () => {
        render(
            <ExercisePickerPanel
                isOpen={true}
                onClose={vi.fn()}
                onSelect={vi.fn()}
                clientId={1}
                activeInjuries={[]}
            />
        );
        expect(useGetExercisePickerLibraryQuery).toHaveBeenCalledWith(
            expect.objectContaining({ contract: "complete", client_id: 1 })
        );
        await waitForSafetyVerdicts();
    });

    it("PERF-7: catálogo completo del listado, sin tope, y nunca el lookup por ids", async () => {
        render(
            <ExercisePickerPanel isOpen onClose={vi.fn()} onSelect={vi.fn()} clientId={1} />
        );
        expect(useGetExercisePickerLibraryQuery).toHaveBeenCalledWith({
            contract: "complete",
            client_id: 1,
        });
        await waitForSafetyVerdicts();
        expect(useGetExercisesByIdsQuery).not.toHaveBeenCalled();
        expect(useExerciseNamesByIds).not.toHaveBeenCalled();
        expect(useGetExercisesQuery).not.toHaveBeenCalled();
    });

    it("PERF-7 FE-2: con un catálogo grande solo monta las filas visibles", async () => {
        const many = Array.from({ length: 600 }, (_, i) => ({
            id: 1000 + i,
            nombre: `Ejercicio ${String(i).padStart(3, "0")}`,
            nombre_ingles: null,
        }));
        useGetExercisePickerLibraryQuery.mockReturnValue({
            data: { exercises: many, equipment_filter_applied: "none" },
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        });
        render(<ExercisePickerPanel isOpen onClose={vi.fn()} onSelect={vi.fn()} />);

        expect(screen.getByRole("button", { name: "Ejercicio 000" })).toBeInTheDocument();
        const mountedRows = screen.getAllByRole("button", { name: /^Ejercicio \d{3}$/ });
        expect(mountedRows.length).toBeLessThan(50);
    });

    it("PERF-7: si falla la carga del catálogo se avisa y se puede reintentar", async () => {
        const user = userEvent.setup();
        const refetch = vi.fn();
        useGetExercisePickerLibraryQuery.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            refetch,
        });
        render(
            <ExercisePickerPanel isOpen onClose={vi.fn()} onSelect={vi.fn()} clientId={1} />
        );

        expect(screen.getByText(/no se pudo cargar la lista de ejercicios/i)).toBeInTheDocument();
        expect(screen.queryByText(/no se encontraron ejercicios/i)).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /reintentar/i }));
        expect(refetch).toHaveBeenCalledTimes(1);
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

        expect(await screen.findByRole("heading", { name: /alternativas sin hallazgo/i })).toBeInTheDocument();
        expect(screen.getByText("Press contraindicado")).toBeInTheDocument();
        expect(screen.getByText("Con hallazgo")).toBeInTheDocument();

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

    it("H7: un resultado bloqueante no ofrece añadirlo", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const payload: ExerciseSafetyBatchResponse = {
            results: {
                101: {
                    is_safe: false,
                    status: "exceeds_limit",
                    blocking: true,
                    reason: "Supera el tope de carga axial (Media).",
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

        expect(await screen.findByText("TOPE")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /Press contraindicado/i }));
        expect(screen.queryByRole("button", { name: /añadir/i })).not.toBeInTheDocument();
        expect(onSelect).not.toHaveBeenCalled();
    });

    it("H7: un tope no comprobable tampoco ofrece añadirlo", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const payload: ExerciseSafetyBatchResponse = {
            results: {
                101: {
                    is_safe: false,
                    status: "not_verifiable",
                    unverifiable_reason: "axial_review_unchecked",
                    blocking: true,
                    reason: "No se puede comprobar el tope de carga axial.",
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

        await user.click(await screen.findByRole("button", { name: /Press contraindicado/i }));
        expect(screen.queryByRole("button", { name: /añadir/i })).not.toBeInTheDocument();
        expect(onSelect).not.toHaveBeenCalled();
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

    it("sin cliente (plantilla) no hay lote: un clic añade y no se marca sin comprobar", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const checkBatch = vi.fn();
        useCheckExerciseSafetyBatchMutation.mockReturnValue([checkBatch, { isLoading: false }]);
        render(<ExercisePickerPanel isOpen onClose={vi.fn()} onSelect={onSelect} />);

        expect(useGetExercisePickerLibraryQuery).toHaveBeenCalledWith({ contract: "complete" });
        expect(screen.queryAllByLabelText("Seguridad sin comprobar")).toHaveLength(0);
        await user.click(screen.getByRole("button", { name: /Curl seguro/i }));
        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 102 }));
        expect(checkBatch).not.toHaveBeenCalled();
    });

    it("mientras el lote no ha vuelto, ninguna fila se pinta como segura", () => {
        useCheckExerciseSafetyBatchMutation.mockReturnValue([
            vi.fn(() => ({ unwrap: () => new Promise(() => undefined) })),
            { isLoading: true },
        ]);
        const onSelect = vi.fn();
        render(
            <ExercisePickerPanel
                isOpen
                onClose={vi.fn()}
                onSelect={onSelect}
                clientId={1}
                activeInjuries={[]}
            />
        );

        expect(screen.getByText(/verificando seguridad/i)).toBeInTheDocument();
        expect(screen.getAllByLabelText("Seguridad sin comprobar")).toHaveLength(2);
        screen.getAllByRole("button", { name: /Press/i })[0]?.click();
        expect(onSelect).not.toHaveBeenCalled();
        expect(screen.queryByText("LESIÓN")).not.toBeInTheDocument();
    });
});
