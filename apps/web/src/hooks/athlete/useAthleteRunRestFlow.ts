/**
 * useAthleteRunRestFlow.ts — Máquina de descanso V05 (§5a spec).
 * B6: countdown por deadline Date.now(); recálculo en visibilitychange.
 * D-REST-01: «Empezar descanso» manual; D-REST-02: overlay tras «Guardar» (single_set) con timer activo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
    remainingSecondsUntil,
    useAthleteWallClockTick,
} from "@/hooks/athlete/athleteWallClock";
import type { AthleteRunRestPhase } from "@nexia/shared/utils/athlete/athleteRunRestPhase";
import {
    restPhaseAfterConfirmSaved,
    shouldShowRestChip,
    shouldShowRestOverlay,
    shouldShowRunLogger,
} from "@nexia/shared/utils/athlete/athleteRunRestPhase";

export type { AthleteRunRestPhase } from "@nexia/shared/utils/athlete/athleteRunRestPhase";

export interface UseAthleteRunRestFlowOptions {
    /** Segundos prescritos tras confirmar; null/0 = sin chip ni overlay */
    restAfterSeconds: number | null;
    /** Tap 2: «Guardar» (single_set), «Ronda completada», etc. */
    confirmLabel: string;
    /** Estable entre pasos — reinicia fase al cambiar */
    stepKey: string | null;
    /** Guardar serie(s) — async. Devuelve true para avanzar, false para abortar. */
    onConfirm: () => Promise<boolean>;
    /** Tras overlay o si no hay descanso restante */
    onRestComplete: () => void;
    /** Deshabilitar confirm si faltan datos */
    isConfirmValid?: boolean;
    /** Dropset: exige tap antes de mostrar logger aunque no haya descanso prescrito */
    requireStartBeforeLog?: boolean;
    /** Copy tap 1 — default «Empezar descanso» */
    startRestLabel?: string;
}

function restFlowHaptic(ms: number) {
    if (typeof navigator === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    navigator.vibrate?.(ms);
}

export function useAthleteRunRestFlow({
    restAfterSeconds,
    confirmLabel,
    stepKey,
    onConfirm,
    onRestComplete,
    isConfirmValid = true,
    requireStartBeforeLog = false,
    startRestLabel = "Empezar descanso",
}: UseAthleteRunRestFlowOptions) {
    const [phase, setPhase] = useState<AthleteRunRestPhase>("doing");
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const restDeadlineMsRef = useRef<number | null>(null);

    const onRestCompleteRef = useRef(onRestComplete);
    onRestCompleteRef.current = onRestComplete;

    const hasRestTimer =
        restAfterSeconds != null && restAfterSeconds > 0;

    useEffect(() => {
        setPhase("doing");
        setRemainingSeconds(0);
        setConfirmLoading(false);
        restDeadlineMsRef.current = null;
    }, [stepKey]);

    const restCountdownActive =
        hasRestTimer &&
        (phase === "logging_rest" || phase === "rest_overlay") &&
        restDeadlineMsRef.current != null;

    const tickRest = useCallback(() => {
        const deadline = restDeadlineMsRef.current;
        if (deadline == null) return;
        setRemainingSeconds(remainingSecondsUntil(deadline));
    }, []);

    useAthleteWallClockTick(restCountdownActive, tickRest);

    useEffect(() => {
        const inRestCountdown =
            phase === "rest_overlay" || phase === "logging_rest";
        if (!inRestCountdown || remainingSeconds > 0) return;
        if (restDeadlineMsRef.current == null) return;
        restFlowHaptic(200);
        restDeadlineMsRef.current = null;
        setPhase("doing");
        onRestCompleteRef.current();
    }, [phase, remainingSeconds]);

    const startRest = useCallback(() => {
        restFlowHaptic(20);
        if (hasRestTimer) {
            restDeadlineMsRef.current = Date.now() + restAfterSeconds! * 1000;
            setRemainingSeconds(restAfterSeconds!);
            setPhase("logging_rest");
            return;
        }
        setPhase("logging_rest");
    }, [hasRestTimer, restAfterSeconds]);

    const confirmAndRest = useCallback(async () => {
        if (!isConfirmValid || confirmLoading) return;
        setConfirmLoading(true);
        let shouldAdvance = false;
        try {
            shouldAdvance = await onConfirm();
        } catch {
            return;
        } finally {
            setConfirmLoading(false);
        }
        if (!shouldAdvance) return;
        restFlowHaptic(20);

        const deadline = restDeadlineMsRef.current;
        const remainingNow =
            deadline != null ? remainingSecondsUntil(deadline) : 0;
        setRemainingSeconds(remainingNow);

        const restWasActive =
            deadline != null &&
            (phase === "logging_rest" || phase === "rest_overlay");

        const next = restPhaseAfterConfirmSaved({
            hasRestTimer,
            remainingSeconds: remainingNow,
            restCountdownWasActive: restWasActive,
        });

        if (next === "rest_overlay") {
            setPhase("rest_overlay");
            return;
        }

        restDeadlineMsRef.current = null;
        setPhase("doing");
        onRestCompleteRef.current();
    }, [confirmLoading, hasRestTimer, isConfirmValid, onConfirm, phase]);

    const skipRest = useCallback(() => {
        restDeadlineMsRef.current = null;
        setRemainingSeconds(0);
        setPhase("doing");
        onRestCompleteRef.current();
    }, []);

    const editRestFromOverlay = useCallback(() => {
        if (phase !== "rest_overlay") return;
        setPhase("logging_rest");
        tickRest();
    }, [phase, tickRest]);

    const showLogger = shouldShowRunLogger(phase, requireStartBeforeLog);
    const showRestChip = shouldShowRestChip(phase, hasRestTimer, remainingSeconds);
    const showRestOverlay = shouldShowRestOverlay(phase, remainingSeconds);

    let stickyPrimaryLabel: string | undefined;
    let stickyPrimaryAction: (() => void) | undefined;

    if (phase === "doing" && (hasRestTimer || requireStartBeforeLog)) {
        stickyPrimaryLabel = startRestLabel;
        stickyPrimaryAction = startRest;
    } else if (showLogger) {
        stickyPrimaryLabel = confirmLabel;
        stickyPrimaryAction = () => {
            void confirmAndRest();
        };
    }

    return {
        phase,
        remainingSeconds,
        restTotalSeconds: restAfterSeconds ?? 0,
        hasRestTimer,
        showLogger,
        showRestChip,
        showRestOverlay,
        stickyPrimaryLabel,
        stickyPrimaryAction,
        stickyPrimaryDisabled: showLogger ? !isConfirmValid : false,
        stickyPrimaryLoading: confirmLoading,
        skipRest,
        startRest,
        editRestFromOverlay,
    };
}

/** Formato m:ss para chip y UI compacta */
export function formatAthleteRestCountdown(totalSeconds: number): string {
    const safe = Math.max(0, totalSeconds);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
