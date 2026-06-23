/**
 * useAthleteEmomFlow.ts — Flujo continuo EMOM: auto-avance entre intervalos (V05).
 */

import { useEffect, useRef, useState } from "react";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { formatEmomIntervalLabel } from "@nexia/shared/utils/athlete/emomResult";

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
    const handledExpiryKeyRef = useRef<string | null>(null);

    useEffect(() => {
        setIntervalIndex(0);
        setElapsedSeconds(0);
        setAllIntervalsComplete(false);
        handledExpiryKeyRef.current = null;
    }, [stepKey]);

    const totalSeconds = Math.max(1, intervalSeconds);
    const displaySeconds = Math.max(0, totalSeconds - elapsedSeconds);

    useEffect(() => {
        if (!active || allIntervalsComplete || intervals.length === 0) return undefined;

        const timer = window.setInterval(() => {
            setElapsedSeconds((value) => Math.min(value + 1, totalSeconds));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [active, allIntervalsComplete, intervals.length, stepKey, totalSeconds]);

    useEffect(() => {
        if (!active || allIntervalsComplete || intervals.length === 0) return;
        if (elapsedSeconds !== totalSeconds) return;

        const expiryKey = `${intervalIndex}:${totalSeconds}`;
        if (handledExpiryKeyRef.current === expiryKey) return;
        handledExpiryKeyRef.current = expiryKey;

        emomFlowHaptic(200);
        if (intervalIndex < intervals.length - 1) {
            setIntervalIndex((current) => current + 1);
            setElapsedSeconds(0);
            return;
        }
        setAllIntervalsComplete(true);
    }, [
        active,
        allIntervalsComplete,
        elapsedSeconds,
        intervalIndex,
        intervals.length,
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
