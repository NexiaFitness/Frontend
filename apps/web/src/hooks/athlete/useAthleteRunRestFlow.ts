/**
 * useAthleteRunRestFlow.ts — Máquina de descanso V05 (§5a spec).
 * Un hook compartido: doing → logging_rest → rest_overlay.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type AthleteRunRestPhase = "doing" | "logging_rest" | "rest_overlay";

export interface UseAthleteRunRestFlowOptions {
    /** Segundos prescritos tras confirmar; null/0 = sin chip ni overlay */
    restAfterSeconds: number | null;
    /** Tap 2: «Serie completada», «Ronda completada», etc. */
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

    const onRestCompleteRef = useRef(onRestComplete);
    onRestCompleteRef.current = onRestComplete;

    const hasRestTimer =
        restAfterSeconds != null && restAfterSeconds > 0;

    useEffect(() => {
        setPhase("doing");
        setRemainingSeconds(0);
        setConfirmLoading(false);
    }, [stepKey]);

    useEffect(() => {
        if (phase !== "logging_rest" && phase !== "rest_overlay") return undefined;
        if (remainingSeconds <= 0) return undefined;

        const timer = window.setTimeout(() => {
            setRemainingSeconds((value) => value - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [phase, remainingSeconds]);

    useEffect(() => {
        if (phase !== "rest_overlay" || remainingSeconds > 0) return;
        restFlowHaptic(200);
        setPhase("doing");
        onRestCompleteRef.current();
    }, [phase, remainingSeconds]);

    const startRest = useCallback(() => {
        restFlowHaptic(20);
        if (hasRestTimer) {
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
        if (hasRestTimer && remainingSeconds > 0) {
            setPhase("rest_overlay");
        } else {
            setPhase("doing");
            onRestCompleteRef.current();
        }
    }, [confirmLoading, hasRestTimer, isConfirmValid, onConfirm, remainingSeconds]);

    const skipRest = useCallback(() => {
        setRemainingSeconds(0);
        setPhase("doing");
        onRestCompleteRef.current();
    }, []);

    const showLogger =
        phase === "logging_rest" ||
        (phase === "doing" && !hasRestTimer && !requireStartBeforeLog);

    const showRestChip = phase === "logging_rest" && hasRestTimer && remainingSeconds > 0;

    const showRestOverlay = phase === "rest_overlay" && remainingSeconds > 0;

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
    };
}

/** Formato m:ss para chip y UI compacta */
export function formatAthleteRestCountdown(totalSeconds: number): string {
    const safe = Math.max(0, totalSeconds);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
