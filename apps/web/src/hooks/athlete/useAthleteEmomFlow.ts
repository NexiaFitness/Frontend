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
    /** Intervalos completados al 100 % (reloj) antes del cierre; P1-7 si finishEarly. */
    completedIntervalCount: number;
    finishedEarly: boolean;
    /** P1-7: cerrar EMOM antes de que acabe el último intervalo. */
    finishEarly: () => void;
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
    const [finishedEarly, setFinishedEarly] = useState(false);
    const intervalStartedAtRef = useRef<number | null>(null);
    const handledExpiryKeyRef = useRef<string | null>(null);

    useEffect(() => {
        setIntervalIndex(0);
        setElapsedSeconds(0);
        setAllIntervalsComplete(false);
        setFinishedEarly(false);
        intervalStartedAtRef.current = null;
        handledExpiryKeyRef.current = null;
    }, [stepKey]);

    const finishEarly = useCallback(() => {
        if (allIntervalsComplete || intervals.length === 0) return;
        emomFlowHaptic(200);
        setFinishedEarly(true);
        setAllIntervalsComplete(true);
    }, [allIntervalsComplete, intervals.length]);

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

    const completedIntervalCount = allIntervalsComplete
        ? finishedEarly
            ? Math.min(intervalIndex, intervals.length)
            : intervals.length
        : intervalIndex;

    return {
        currentInterval,
        intervalIndex,
        intervalTotal: intervals.length,
        intervalLabel,
        displaySeconds,
        totalSeconds,
        allIntervalsComplete,
        completedIntervalCount,
        finishedEarly,
        finishEarly,
    };
}
