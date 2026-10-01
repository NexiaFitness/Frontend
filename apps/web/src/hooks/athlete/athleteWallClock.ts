/**
 * athleteWallClock.ts — Tiempo real para cronómetros atleta (B6).
 * Contexto: evita deriva en pestaña oculta; pausa acumulada cuando `active` es false.
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import { useEffect } from "react";

export function elapsedSecondsSince(startedAtMs: number, nowMs: number = Date.now()): number {
    return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
}

/** Cierra el tramo en curso y devuelve ms acumulados (pausa). */
export function flushWallClockSegmentMs(
    accumulatedMs: number,
    segmentStartedAtMs: number | null,
    nowMs: number = Date.now()
): number {
    if (segmentStartedAtMs == null) return accumulatedMs;
    return accumulatedMs + Math.max(0, nowMs - segmentStartedAtMs);
}

export function wallClockElapsedSeconds(
    accumulatedMs: number,
    segmentStartedAtMs: number | null,
    nowMs: number = Date.now()
): number {
    return Math.max(0, Math.floor(flushWallClockSegmentMs(accumulatedMs, segmentStartedAtMs, nowMs) / 1000));
}

export function remainingSecondsUntil(deadlineMs: number, nowMs: number = Date.now()): number {
    return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

const TICK_MS = 250;

/** Intervalo liviano + recálculo al volver visible (visibilitychange). */
export function subscribeAthleteWallClockTick(
    active: boolean,
    onTick: () => void
): () => void {
    if (!active) {
        return () => undefined;
    }

    onTick();

    const intervalId = window.setInterval(onTick, TICK_MS);

    const onVisibility = (): void => {
        if (document.visibilityState === "visible") {
            onTick();
        }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
        window.clearInterval(intervalId);
        document.removeEventListener("visibilitychange", onVisibility);
    };
}

export function useAthleteWallClockTick(active: boolean, onTick: () => void): void {
    useEffect(() => subscribeAthleteWallClockTick(active, onTick), [active, onTick]);
}
