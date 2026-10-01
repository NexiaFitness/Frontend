/**
 * useAthleteBlockTimer.ts — Cronómetro de bloque V05 Fase C (AMRAP / EMOM / for_time).
 * B6: wall clock con pausa acumulada cuando `active` es false (p. ej. logging_rest).
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AthleteRunStep } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    useAthleteWallClockTick,
    wallClockElapsedSeconds,
    flushWallClockSegmentMs,
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
    const accumulatedMsRef = useRef(0);
    const segmentStartedAtRef = useRef<number | null>(null);

    useEffect(() => {
        accumulatedMsRef.current = 0;
        segmentStartedAtRef.current = null;
        setElapsedSeconds(0);
    }, [runStep?.stepKey]);

    const syncElapsedFromRefs = useCallback(() => {
        setElapsedSeconds(
            wallClockElapsedSeconds(accumulatedMsRef.current, segmentStartedAtRef.current)
        );
    }, []);

    useEffect(() => {
        const timed = Boolean(runStep?.timedMode);
        if (!timed) return;

        if (active) {
            if (segmentStartedAtRef.current === null) {
                segmentStartedAtRef.current = Date.now();
            }
            syncElapsedFromRefs();
            return;
        }

        if (segmentStartedAtRef.current != null) {
            accumulatedMsRef.current = flushWallClockSegmentMs(
                accumulatedMsRef.current,
                segmentStartedAtRef.current
            );
            segmentStartedAtRef.current = null;
            syncElapsedFromRefs();
        }
    }, [active, runStep?.stepKey, runStep?.timedMode, syncElapsedFromRefs]);

    const tick = useCallback(() => {
        if (!active || segmentStartedAtRef.current == null) return;
        syncElapsedFromRefs();
    }, [active, syncElapsedFromRefs]);

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
