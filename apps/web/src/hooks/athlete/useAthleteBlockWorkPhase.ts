/**
 * useAthleteBlockWorkPhase.ts — Fase ready/running del cronómetro de bloque V05 Fase C.
 * Distinto de useAthleteRunRestFlow (§5a descanso post-trabajo).
 */

import { useCallback, useEffect, useState } from "react";

export type AthleteBlockWorkPhase = "ready" | "running";

function blockWorkHaptic(ms: number) {
    if (typeof navigator === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(ms);
}

export interface UseAthleteBlockWorkPhaseResult {
    phase: AthleteBlockWorkPhase;
    isReady: boolean;
    isRunning: boolean;
    start: () => void;
}

export function useAthleteBlockWorkPhase(
    stepKey: string | null,
    enabled: boolean
): UseAthleteBlockWorkPhaseResult {
    const [phase, setPhase] = useState<AthleteBlockWorkPhase>("ready");

    useEffect(() => {
        setPhase("ready");
    }, [stepKey, enabled]);

    const start = useCallback(() => {
        if (!enabled) return;
        blockWorkHaptic(20);
        setPhase("running");
    }, [enabled]);

    return {
        phase,
        isReady: enabled && phase === "ready",
        isRunning: enabled && phase === "running",
        start,
    };
}
