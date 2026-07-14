/**
 * useAthleteBlockTimer.ts — Cronómetro de bloque V05 Fase C (AMRAP / EMOM / for_time).
 * Distinto del chip de descanso §5a — solo fase doing.
 */

import { useEffect, useMemo, useState } from "react";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";

export interface UseAthleteBlockTimerResult {
    displaySeconds: number;
    elapsedSeconds: number;
    totalSeconds: number | null;
    isExpired: boolean;
    isCountup: boolean;
}

export function useAthleteBlockTimer(
    runStep: AthleteRunStep | undefined,
    active: boolean
): UseAthleteBlockTimerResult {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        setElapsedSeconds(0);
    }, [runStep?.stepKey]);

    useEffect(() => {
        if (!active || !runStep?.timedMode) return undefined;
        const timer = window.setInterval(() => {
            setElapsedSeconds((value) => value + 1);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [active, runStep?.stepKey, runStep?.timedMode]);

    const totalSeconds = useMemo(() => {
        if (!runStep?.timedMode) return null;
        if (runStep.timedMode === "countdown_block") {
            return Math.max(0, (runStep.timeCapMinutes ?? 0) * 60);
        }
        if (runStep.timedMode === "countdown_interval") {
            return Math.max(1, runStep.intervalSeconds ?? 60);
        }
        return null;
    }, [runStep]);

    const isCountup = runStep?.timedMode === "countup";

    const displaySeconds = isCountup
        ? elapsedSeconds
        : Math.max(0, (totalSeconds ?? 0) - elapsedSeconds);

    const isExpired =
        !isCountup && totalSeconds != null && totalSeconds > 0 && elapsedSeconds >= totalSeconds;

    return {
        displaySeconds,
        elapsedSeconds,
        totalSeconds,
        isExpired,
        isCountup,
    };
}
