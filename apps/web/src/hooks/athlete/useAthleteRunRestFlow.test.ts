/**
 * useAthleteRunRestFlow.test.ts — Bug 7: formulario visible con descanso prescrito.
 */

import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAthleteRunRestFlow } from "./useAthleteRunRestFlow";

describe("useAthleteRunRestFlow", () => {
    it("muestra el logger en doing aunque haya temporizador de descanso", () => {
        const onConfirm = vi.fn(async () => true);
        const onRestComplete = vi.fn();

        const { result } = renderHook(() =>
            useAthleteRunRestFlow({
                restAfterSeconds: 90,
                confirmLabel: "Serie completada",
                stepKey: "step-1",
                onConfirm,
                onRestComplete,
                isConfirmValid: true,
            })
        );

        expect(result.current.phase).toBe("doing");
        expect(result.current.showLogger).toBe(true);
        expect(result.current.stickyPrimaryLabel).toBe("Empezar descanso");

        act(() => {
            result.current.startRest();
        });

        expect(result.current.showLogger).toBe(true);
        expect(result.current.stickyPrimaryLabel).toBe("Serie completada");
    });

    it("oculta el logger en doing cuando requireStartBeforeLog (bloques)", () => {
        const { result } = renderHook(() =>
            useAthleteRunRestFlow({
                restAfterSeconds: null,
                confirmLabel: "Bloque completado",
                stepKey: "emom-1",
                onConfirm: vi.fn(async () => true),
                onRestComplete: vi.fn(),
                requireStartBeforeLog: true,
            })
        );

        expect(result.current.showLogger).toBe(false);
    });
});
