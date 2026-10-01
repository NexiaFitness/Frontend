/**
 * useAthleteForTimeFlow.ts — Flujo continuo FOR TIME: cronó global + splits por ronda (V05).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { AthleteForTimeRound } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import {
    buildForTimeSplitViews,
    formatForTimeRoundLabel,
    type ForTimeSplitView,
} from "@nexia/shared/utils/athlete/forTimeResult";

export interface ForTimeRoundAdvanceCue {
    completedRoundIndex: number;
    cumulativeSeconds: number;
    segmentSeconds: number;
    isLastRound: boolean;
}

function forTimeFlowHaptic(ms: number) {
    if (typeof navigator === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(ms);
}

export interface UseAthleteForTimeFlowResult {
    currentRound: AthleteForTimeRound | null;
    roundIndex: number;
    roundTotal: number;
    roundLabel: string | null;
    elapsedSeconds: number;
    cumulativeSplits: readonly number[];
    splitViews: readonly ForTimeSplitView[];
    allRoundsComplete: boolean;
    roundAdvanceCue: ForTimeRoundAdvanceCue | null;
    /** B4: un solo toque — detiene cronó y abre cierre (sin splits por ronda). */
    finishBlock: () => void;
}

export function useAthleteForTimeFlow(
    stepKey: string | null,
    rounds: readonly AthleteForTimeRound[],
    active: boolean
): UseAthleteForTimeFlowResult {
    const [roundIndex, setRoundIndex] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [cumulativeSplits, setCumulativeSplits] = useState<number[]>([]);
    const [allRoundsComplete, setAllRoundsComplete] = useState(false);
    const [roundAdvanceCue, setRoundAdvanceCue] = useState<ForTimeRoundAdvanceCue | null>(
        null
    );
    const elapsedRef = useRef(0);
    const splitsRef = useRef<number[]>([]);

    useEffect(() => {
        setRoundIndex(0);
        setElapsedSeconds(0);
        setCumulativeSplits([]);
        setAllRoundsComplete(false);
        setRoundAdvanceCue(null);
        elapsedRef.current = 0;
        splitsRef.current = [];
    }, [stepKey]);

    useEffect(() => {
        splitsRef.current = [...cumulativeSplits];
    }, [cumulativeSplits]);

    useEffect(() => {
        if (!roundAdvanceCue) return undefined;
        const timer = window.setTimeout(() => setRoundAdvanceCue(null), 5000);
        return () => window.clearTimeout(timer);
    }, [roundAdvanceCue]);

    useEffect(() => {
        elapsedRef.current = elapsedSeconds;
    }, [elapsedSeconds]);

    useEffect(() => {
        if (!active || allRoundsComplete || rounds.length === 0) return undefined;

        const timer = window.setInterval(() => {
            setElapsedSeconds((value) => value + 1);
        }, 1000);

        return () => window.clearInterval(timer);
    }, [active, allRoundsComplete, rounds.length, stepKey]);

    const finishBlock = useCallback(() => {
        if (allRoundsComplete || rounds.length === 0) return;
        forTimeFlowHaptic(200);
        setAllRoundsComplete(true);
    }, [allRoundsComplete, rounds.length]);

    const currentRound = rounds[roundIndex] ?? null;
    const roundLabel = currentRound
        ? formatForTimeRoundLabel(currentRound.roundIndex, currentRound.roundTotal)
        : null;

    const splitViews = buildForTimeSplitViews(cumulativeSplits);

    return {
        currentRound,
        roundIndex,
        roundTotal: rounds.length,
        roundLabel,
        elapsedSeconds,
        cumulativeSplits,
        splitViews,
        allRoundsComplete,
        roundAdvanceCue,
        finishBlock,
    };
}
