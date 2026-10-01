/**
 * useAthleteBlockTimer.ts — Cronómetro de bloque V05 Fase C (AMRAP / EMOM / for_time).
 * B6: tiempo real con startedAt + Date.now(); recálculo en visibilitychange.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    elapsedSecondsSince,
    useAthleteWallClockTick,
} from "@/hooks/athlete/athleteWallClock";

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
    const startedAtRef = useRef<number | null>(null);

    useEffect(() => {
        startedAtRef.current = null;
        setElapsedSeconds(0);
    }, [runStep?.stepKey]);

    useEffect(() => {
        if (!active) {
            startedAtRef.current = null;
        } else if (startedAtRef.current === null && runStep?.timedMode) {
            startedAtRef.current = Date.now();
        }
    }, [active, runStep?.timedMode]);

    const tick = useCallback(() => {
        const startedAt = startedAtRef.current;
        if (startedAt == null) return;
        setElapsedSeconds(elapsedSecondsSince(startedAt));
    }, []);

    useAthleteWallClockTick(Boolean(active && runStep?.timedMode), tick);

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
