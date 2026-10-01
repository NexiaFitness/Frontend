/**
 * useAthleteEmomFlow.ts — Flujo continuo EMOM: auto-avance entre intervalos (V05).
 * B6: wall clock por intervalo; recálculo en visibilitychange.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { formatEmomIntervalLabel } from "@nexia/shared/utils/athlete/emomResult";
import {
    elapsedSecondsSince,
    useAthleteWallClockTick,
} from "@/hooks/athlete/athleteWallClock";

function emomFlowHaptic(ms: number) {
    if (typeof navigator === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(ms);
}

export interface UseAthleteEmomFlowResult {
    currentInterval: AthleteEmomInterval | null;
    intervalIndex: number;
    intervalTotal: number;
    intervalLabel: string | null;
    displaySeconds: number;
    totalSeconds: number;
    allIntervalsComplete: boolean;
}

export function useAthleteEmomFlow(
    stepKey: string | null,
    intervals: readonly AthleteEmomInterval[],
    intervalSeconds: number,
    active: boolean
): UseAthleteEmomFlowResult {
    const [intervalIndex, setIntervalIndex] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [allIntervalsComplete, setAllIntervalsComplete] = useState(false);
    const intervalStartedAtRef = useRef<number | null>(null);
    const handledExpiryKeyRef = useRef<string | null>(null);

    useEffect(() => {
        setIntervalIndex(0);
        setElapsedSeconds(0);
        setAllIntervalsComplete(false);
        intervalStartedAtRef.current = null;
        handledExpiryKeyRef.current = null;
    }, [stepKey]);

    const totalSeconds = Math.max(1, intervalSeconds);
    const running = active && !allIntervalsComplete && intervals.length > 0;

    useEffect(() => {
        if (!running) {
            intervalStartedAtRef.current = null;
            return;
        }
        if (intervalStartedAtRef.current === null) {
            intervalStartedAtRef.current = Date.now();
            setElapsedSeconds(0);
        }
    }, [running, stepKey]);

    const tick = useCallback(() => {
        const startedAt = intervalStartedAtRef.current;
        if (!running || startedAt == null) return;
        setElapsedSeconds(Math.min(totalSeconds, elapsedSecondsSince(startedAt)));
    }, [running, totalSeconds]);

    useAthleteWallClockTick(running, tick);

    const displaySeconds = Math.max(0, totalSeconds - elapsedSeconds);

    useEffect(() => {
        if (!running || intervals.length === 0) return;
        if (elapsedSeconds < totalSeconds) return;

        const expiryKey = `${intervalIndex}:${totalSeconds}`;
        if (handledExpiryKeyRef.current === expiryKey) return;
        handledExpiryKeyRef.current = expiryKey;

        emomFlowHaptic(200);
        if (intervalIndex < intervals.length - 1) {
            intervalStartedAtRef.current = Date.now();
            setElapsedSeconds(0);
            handledExpiryKeyRef.current = null;
            setIntervalIndex((current) => current + 1);
            return;
        }
        setAllIntervalsComplete(true);
    }, [
        elapsedSeconds,
        intervalIndex,
        intervals.length,
        running,
        totalSeconds,
    ]);

    const currentInterval = intervals[intervalIndex] ?? null;
    const intervalLabel = currentInterval
        ? formatEmomIntervalLabel(
              intervalSeconds,
              currentInterval.minuteIndex,
              currentInterval.minuteTotal
          )
        : null;

    return {
        currentInterval,
        intervalIndex,
        intervalTotal: intervals.length,
        intervalLabel,
        displaySeconds,
        totalSeconds,
        allIntervalsComplete,
    };
}
