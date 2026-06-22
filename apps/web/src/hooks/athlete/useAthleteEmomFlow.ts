/**
 * useAthleteEmomFlow.ts — Flujo continuo EMOM: auto-avance entre intervalos (V05).
 */

import { useEffect, useRef, useState } from "react";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { formatEmomMinuteLabel } from "@nexia/shared/utils/athlete/emomResult";

function emomFlowHaptic(ms: number) {
    if (typeof navigator === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(ms);
}

export interface UseAthleteEmomFlowResult {
    currentInterval: AthleteEmomInterval | null;
    intervalIndex: number;
    intervalTotal: number;
    minuteLabel: string | null;
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
    const advancedForExpiryRef = useRef(false);

    useEffect(() => {
        setIntervalIndex(0);
        setElapsedSeconds(0);
        setAllIntervalsComplete(false);
        advancedForExpiryRef.current = false;
    }, [stepKey]);

    useEffect(() => {
        setElapsedSeconds(0);
        advancedForExpiryRef.current = false;
    }, [intervalIndex, stepKey]);

    useEffect(() => {
        if (!active || allIntervalsComplete || intervals.length === 0) return undefined;
        const timer = window.setInterval(() => {
            setElapsedSeconds((value) => value + 1);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [active, allIntervalsComplete, intervalIndex, intervals.length, stepKey]);

    const totalSeconds = Math.max(1, intervalSeconds);
    const displaySeconds = Math.max(0, totalSeconds - elapsedSeconds);
    const isExpired = elapsedSeconds >= totalSeconds;

    useEffect(() => {
        if (!active || !isExpired || allIntervalsComplete) return;
        if (advancedForExpiryRef.current) return;
        advancedForExpiryRef.current = true;
        emomFlowHaptic(200);

        if (intervalIndex < intervals.length - 1) {
            setIntervalIndex((value) => value + 1);
            return;
        }
        setAllIntervalsComplete(true);
    }, [active, allIntervalsComplete, intervalIndex, intervals.length, isExpired]);

    const currentInterval = intervals[intervalIndex] ?? null;
    const minuteLabel = currentInterval
        ? formatEmomMinuteLabel(
              intervalSeconds,
              currentInterval.minuteIndex,
              currentInterval.minuteTotal
          )
        : null;

    return {
        currentInterval,
        intervalIndex,
        intervalTotal: intervals.length,
        minuteLabel,
        displaySeconds,
        totalSeconds,
        allIntervalsComplete,
    };
}
