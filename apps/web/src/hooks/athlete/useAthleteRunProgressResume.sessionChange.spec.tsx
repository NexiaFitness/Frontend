/**
 * useAthleteRunProgressResume.sessionChange.spec.tsx — Cambio de sesion en la misma pestana (DBG-G-01).
 *
 * Proposito: demostrar que, al pasar de /sessions/1/run a /sessions/2/run sin desmontar, el retomar
 * se calcula con el progreso de la sesion nueva y no con el de la anterior.
 * Contexto: la ruta `sessions/:id/run` no tiene `key`, asi que React Router reutiliza la pagina y el hook.
 * Notas: store RTK real + MSW (no se mockea el query) para observar el `data` que RTK conserva entre args.
 * El harness replica lo que hace useAthleteSessionRun: estado `step` + reset de refs en cambio de sessionId.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse, delay } from "msw";
import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import type { AthleteRunProgress } from "@nexia/shared/types/athleteRunProgress";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { createTestStore } from "@/test-utils/utils/store";
import { server } from "@/test-utils/utils/msw";
import { useAthleteRunProgressResume } from "./useAthleteRunProgressResume";

const singleStep = (stepKey: string): AthleteRunStep =>
    ({
        stepKey,
        kind: "single_set",
        groupKind: "single_set",
        groupId: stepKey.split("-r")[0],
        roundIndex: 1,
        setIndex: 1,
    }) as AthleteRunStep;

const progressFor = (sessionId: number, registered: string[]): AthleteRunProgress => ({
    training_session_id: sessionId,
    steps: registered.map((step_key) => ({ step_key, status: "registered", kind: "execution" })),
    blocks: [],
    pending_count: 0,
    registration_editable: true,
});

const SESSION_1_STEPS = ["a", "b", "c", "d", "e"].map((k) => singleStep(`block-1-single-0-r1-${k}`));
const SESSION_2_STEPS = ["x", "y", "z"].map((k) => singleStep(`block-2-single-0-r1-${k}`));

function useHarness({ sessionId, runSteps }: { sessionId: number; runSteps: AthleteRunStep[] }) {
    const [step, setStep] = useState(0);
    const completedStepKeysRef = useRef<Set<string>>(new Set());
    const touchedWeightStepKeysRef = useRef<Set<string>>(new Set());
    const [, setSavedStepKeys] = useState<ReadonlySet<string>>(new Set());

    useEffect(() => {
        setStep(0);
        completedStepKeysRef.current = new Set();
        touchedWeightStepKeysRef.current = new Set();
    }, [sessionId]);

    useAthleteRunProgressResume({
        sessionId,
        runSteps,
        isOnline: true,
        completedStepKeysRef,
        touchedWeightStepKeysRef,
        setSavedStepKeys,
        setStep,
    });

    return { step, completedStepKeys: completedStepKeysRef };
}

describe("useAthleteRunProgressResume — cambio de sessionId (DBG-G-01)", () => {
    it("retoma la sesion 2 en su primer paso pendiente, no en el indice heredado de la sesion 1", async () => {
        server.use(
            http.get("*/athlete/run-context/sessions/1/progress", () =>
                HttpResponse.json(progressFor(1, SESSION_1_STEPS.slice(0, 4).map((s) => s.stepKey)))
            ),
            http.get("*/athlete/run-context/sessions/2/progress", async () => {
                await delay(80);
                return HttpResponse.json(progressFor(2, [SESSION_2_STEPS[0].stepKey]));
            })
        );

        const store = createTestStore();
        const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
        const { result, rerender } = renderHook(useHarness, {
            wrapper,
            initialProps: { sessionId: 1, runSteps: SESSION_1_STEPS },
        });

        await waitFor(() => expect(result.current.step).toBe(4));

        // Navegacion a la sesion 2: la estructura aun es la de la sesion 1 (RTK `data` de la vista).
        rerender({ sessionId: 2, runSteps: SESSION_1_STEPS });
        // Llega la estructura de la sesion 2.
        rerender({ sessionId: 2, runSteps: SESSION_2_STEPS });

        await waitFor(() =>
            expect(result.current.completedStepKeys.current.has(SESSION_2_STEPS[0].stepKey)).toBe(true)
        );
        expect(result.current.step).toBe(1);
        expect(result.current.step).toBeLessThan(SESSION_2_STEPS.length);
        expect(result.current.completedStepKeys.current.has(SESSION_1_STEPS[0].stepKey)).toBe(false);
    });

    it("si el progreso de la sesion 2 llega antes que su estructura, retoma con la estructura correcta", async () => {
        let session2ProgressRequests = 0;
        server.use(
            http.get("*/athlete/run-context/sessions/1/progress", () =>
                HttpResponse.json(progressFor(1, SESSION_1_STEPS.slice(0, 4).map((s) => s.stepKey)))
            ),
            http.get("*/athlete/run-context/sessions/2/progress", () => {
                session2ProgressRequests += 1;
                return HttpResponse.json(progressFor(2, [SESSION_2_STEPS[0].stepKey]));
            })
        );

        const store = createTestStore();
        const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
        const { result, rerender } = renderHook(useHarness, {
            wrapper,
            initialProps: { sessionId: 1, runSteps: SESSION_1_STEPS },
        });
        await waitFor(() => expect(result.current.step).toBe(4));

        rerender({ sessionId: 2, runSteps: SESSION_1_STEPS });
        await waitFor(() => expect(session2ProgressRequests).toBe(1));
        await new Promise((resolve) => setTimeout(resolve, 50));
        rerender({ sessionId: 2, runSteps: SESSION_2_STEPS });

        await waitFor(() =>
            expect(result.current.completedStepKeys.current.has(SESSION_2_STEPS[0].stepKey)).toBe(true)
        );
        expect(result.current.step).toBe(1);
    });
});
