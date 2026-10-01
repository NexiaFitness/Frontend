/**
 * useAthleteForTimeFlow.ts — Flujo FOR TIME (B4): cronó global + «Terminar» sin splits por ronda.
 * B6: wall clock con pausa acumulada; congela al finishBlock.
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { AthleteForTimeRound } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { formatForTimeRoundLabel } from "@nexia/shared/utils/athlete/forTimeResult";
import {
    flushWallClockSegmentMs,
    useAthleteWallClockTick,
    wallClockElapsedSeconds,
} from "@/hooks/athlete/athleteWallClock";

function forTimeFlowHaptic(ms: number) {
    if (typeof navigator === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(ms);
}

export interface UseAthleteForTimeFlowResult {
    currentRound: AthleteForTimeRound | null;
    roundTotal: number;
    roundLabel: string | null;
    elapsedSeconds: number;
    allRoundsComplete: boolean;
    /** B4: un solo toque — detiene cronó y abre cierre (sin splits por ronda). */
    finishBlock: () => void;
}

export function useAthleteForTimeFlow(
    stepKey: string | null,
    rounds: readonly AthleteForTimeRound[],
    active: boolean
): UseAthleteForTimeFlowResult {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [allRoundsComplete, setAllRoundsComplete] = useState(false);
    const accumulatedMsRef = useRef(0);
    const segmentStartedAtRef = useRef<number | null>(null);
    const frozenElapsedRef = useRef<number | null>(null);
    const elapsedRef = useRef(0);

    useEffect(() => {
        setElapsedSeconds(0);
        setAllRoundsComplete(false);
        accumulatedMsRef.current = 0;
        segmentStartedAtRef.current = null;
        frozenElapsedRef.current = null;
        elapsedRef.current = 0;
    }, [stepKey]);

    useEffect(() => {
        elapsedRef.current = elapsedSeconds;
    }, [elapsedSeconds]);

    const running =
        active && !allRoundsComplete && rounds.length > 0;

    const syncElapsedFromRefs = useCallback(() => {
        setElapsedSeconds(
            wallClockElapsedSeconds(accumulatedMsRef.current, segmentStartedAtRef.current)
        );
    }, []);

    useEffect(() => {
        if (allRoundsComplete) return;

        if (running) {
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
    }, [allRoundsComplete, running, syncElapsedFromRefs]);

    const tick = useCallback(() => {
        if (!running || segmentStartedAtRef.current == null) return;
        syncElapsedFromRefs();
    }, [running, syncElapsedFromRefs]);

    useAthleteWallClockTick(running, tick);

    const finishBlock = useCallback(() => {
        if (allRoundsComplete || rounds.length === 0) return;
        forTimeFlowHaptic(200);
        if (segmentStartedAtRef.current != null) {
            accumulatedMsRef.current = flushWallClockSegmentMs(
                accumulatedMsRef.current,
                segmentStartedAtRef.current
            );
            segmentStartedAtRef.current = null;
        }
        const frozen = wallClockElapsedSeconds(accumulatedMsRef.current, null);
        frozenElapsedRef.current = frozen;
        setElapsedSeconds(frozen);
        elapsedRef.current = frozen;
        setAllRoundsComplete(true);
    }, [allRoundsComplete, rounds.length]);

    const currentRound = rounds[0] ?? null;
    const roundLabel = currentRound
        ? formatForTimeRoundLabel(currentRound.roundIndex, currentRound.roundTotal)
        : null;

    const displayElapsed =
        allRoundsComplete && frozenElapsedRef.current != null
            ? frozenElapsedRef.current
            : elapsedSeconds;

    return {
        currentRound,
        roundTotal: rounds.length,
        roundLabel,
        elapsedSeconds: displayElapsed,
        allRoundsComplete,
        finishBlock,
    };
}
