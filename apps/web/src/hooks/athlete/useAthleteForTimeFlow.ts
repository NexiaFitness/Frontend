/**
 * useAthleteForTimeFlow.ts — Flujo FOR TIME (B4): cronó global + «Terminar» sin splits por ronda.
 * B6: wall clock; deja de contar tras finishBlock / allRoundsComplete.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { AthleteForTimeRound } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { formatForTimeRoundLabel } from "@nexia/shared/utils/athlete/forTimeResult";
import {
    elapsedSecondsSince,
    useAthleteWallClockTick,
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
    const startedAtRef = useRef<number | null>(null);
    const frozenElapsedRef = useRef<number | null>(null);
    const elapsedRef = useRef(0);

    useEffect(() => {
        setElapsedSeconds(0);
        setAllRoundsComplete(false);
        startedAtRef.current = null;
        frozenElapsedRef.current = null;
        elapsedRef.current = 0;
    }, [stepKey]);

    useEffect(() => {
        elapsedRef.current = elapsedSeconds;
    }, [elapsedSeconds]);

    const running =
        active && !allRoundsComplete && rounds.length > 0;

    useEffect(() => {
        if (!running) return;
        if (startedAtRef.current === null) {
            startedAtRef.current = Date.now();
        }
    }, [running]);

    const tick = useCallback(() => {
        if (!running || startedAtRef.current == null) return;
        const next = elapsedSecondsSince(startedAtRef.current);
        setElapsedSeconds(next);
    }, [running]);

    useAthleteWallClockTick(running, tick);

    const finishBlock = useCallback(() => {
        if (allRoundsComplete || rounds.length === 0) return;
        forTimeFlowHaptic(200);
        const startedAt = startedAtRef.current ?? Date.now();
        const frozen = elapsedSecondsSince(startedAt);
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
