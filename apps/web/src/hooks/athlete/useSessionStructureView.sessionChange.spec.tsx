/**
 * useSessionStructureView.sessionChange.spec.tsx — Estructura de la sesion anterior tras cambiar sessionId (DBG-G-02).
 *
 * Proposito: mientras carga la sesion 2, la vista no debe contener bloques/ejercicios de la sesion 1 ni
 * declararse cargada; si no, useAthleteSessionRun construye runSteps de la sesion 1 y los guarda con sessionId=2.
 * Contexto: RTK conserva `data` del arg anterior e `isLoading` es false si hay datos (aunque sean de otro arg);
 * el mapa local blockExercisesByBlock no se reinicia y areBlockExercisesLoaded solo compara recuentos.
 * Notas: store RTK real + MSW; el test vive en apps/web por la infraestructura MSW compartida.
 * En este entorno vitest la carga imperativa de ejercicios por bloque (dispatch(initiate)) no resuelve datos,
 * asi que aqui solo se observa la fuga de bloques; la parte de "listo sin ejercicios" se cubre en
 * sessionStructureLoading.spec.ts (funcion pura).
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse, delay } from "msw";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { useSessionStructureView } from "@nexia/shared/hooks/sessionProgramming";
import type { SessionBlock, SessionBlockExercise } from "@nexia/shared/types/sessionProgramming";
import { createTestStore } from "@/test-utils/utils/store";
import { server } from "@/test-utils/utils/msw";

const block = (id: number, sessionId: number): SessionBlock =>
    ({
        id,
        training_session_id: sessionId,
        block_type_id: 1,
        order_in_session: 1,
        set_type: null,
        rounds: null,
        time_cap: null,
        interval_seconds: null,
    }) as SessionBlock;

const blockExercise = (id: number, blockId: number, exerciseId: number): SessionBlockExercise =>
    ({
        id,
        session_block_id: blockId,
        exercise_id: exerciseId,
        order_in_block: 1,
        superset_group_id: null,
        dropset_sequence: null,
        planned_sets: 1,
        planned_reps: "8",
        planned_weight: null,
        planned_rest: 60,
        is_active: true,
    }) as SessionBlockExercise;

const blockIdsOf = (view: ReturnType<typeof useSessionStructureView>["view"]) =>
    view.blocks.map((b) => b.blockId);

describe("useSessionStructureView — cambio de sessionId (DBG-G-02)", () => {
    it("no expone la estructura de la sesion 1 como cargada mientras llega la de la sesion 2", async () => {
        server.use(
            http.get("*/session-programming/sessions/1/blocks", () => HttpResponse.json([block(101, 1), block(102, 1)])),
            http.get("*/session-programming/sessions/2/blocks", async () => {
                await delay(150);
                return HttpResponse.json([block(201, 2)]);
            }),
            http.get("*/session-programming/blocks/101/exercises", () =>
                HttpResponse.json([blockExercise(1001, 101, 5)])
            ),
            http.get("*/session-programming/blocks/102/exercises", () =>
                HttpResponse.json([blockExercise(1002, 102, 6)])
            ),
            http.get("*/session-programming/blocks/201/exercises", async () => {
                await delay(150);
                return HttpResponse.json([blockExercise(2001, 201, 9)]);
            }),
            http.get("*/session-programming/training-block-types", () => HttpResponse.json([])),
            http.get("*/exercises/", () => HttpResponse.json({ exercises: [], total: 0, skip: 0, limit: 500 })),
            http.get("*/training-sessions/:id/exercises", () => HttpResponse.json([]))
        );

        const store = createTestStore();
        const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
        const seen: Array<{ sessionId: number; blockIds: number[]; isLoading: boolean }> = [];
        const { result, rerender } = renderHook(
            ({ sessionId }: { sessionId: number }) => {
                const out = useSessionStructureView(sessionId);
                seen.push({ sessionId, blockIds: blockIdsOf(out.view), isLoading: out.isLoading });
                return out;
            },
            { wrapper, initialProps: { sessionId: 1 } }
        );

        await waitFor(() => expect(blockIdsOf(result.current.view)).toEqual([101, 102]));

        rerender({ sessionId: 2 });

        await waitFor(() => expect(blockIdsOf(result.current.view)).toEqual([201]));

        const leaked = seen.filter(
            (r) => r.sessionId === 2 && r.blockIds.some((id) => id === 101 || id === 102)
        );
        expect(leaked).toEqual([]);
    });
});
