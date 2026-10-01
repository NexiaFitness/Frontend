/**
 * athleteWallClock.ts — Tiempo real para cronómetros atleta (B6).
 * Contexto: evita deriva cuando el navegador estrangula setInterval en pestaña oculta.
 */

import { useEffect } from "react";

export function elapsedSecondsSince(startedAtMs: number, nowMs: number = Date.now()): number {
    return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
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
