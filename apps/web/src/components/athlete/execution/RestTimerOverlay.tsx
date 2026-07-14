/**
 * RestTimerOverlay.tsx — Cuenta atrás fullscreen post-serie (DESIGN §7.4, §5a/§5b.1).
 * Glass premium + anillo de progreso; mismo remaining que el chip.
 */

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { formatAthleteRestCountdown } from "@/hooks/athlete/useAthleteRunRestFlow";
import {
    ATHLETE_RUN_REST_OVERLAY_BACKDROP,
    ATHLETE_RUN_REST_OVERLAY_CARD,
    ATHLETE_RUN_REST_OVERLAY_GLOW,
    ATHLETE_RUN_REST_OVERLAY_HINT,
    ATHLETE_RUN_REST_OVERLAY_LABEL,
    ATHLETE_RUN_REST_OVERLAY_RING,
    ATHLETE_RUN_REST_OVERLAY_RING_PROGRESS,
    ATHLETE_RUN_REST_OVERLAY_RING_TRACK,
    ATHLETE_RUN_REST_OVERLAY_RING_URGENT,
    ATHLETE_RUN_REST_OVERLAY_SKIP,
    ATHLETE_RUN_REST_OVERLAY_TIME,
    ATHLETE_RUN_REST_OVERLAY_TIME_PULSE,
    ATHLETE_RUN_REST_OVERLAY_TIME_URGENT,
} from "./athleteRunPresentation";

export interface RestTimerOverlayProps {
    remainingSeconds: number;
    /** Descanso prescrito total — base del anillo (puede ser > remaining si hubo logging_rest). */
    totalSeconds: number;
    onSkip: () => void;
}

const RING_RADIUS = 78;
const RING_STROKE = 5;

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
    remainingSeconds,
    totalSeconds,
    onSkip,
}) => {
    const display = Math.max(0, remainingSeconds);
    const urgent = display > 0 && display <= 10;
    const pulse = display > 0 && display <= 3;
    const total = Math.max(totalSeconds, display, 1);
    const progress = display / total;
    const circumference = 2 * Math.PI * RING_RADIUS;
    const dashOffset = circumference * (1 - progress);

    const [ringRevealed, setRingRevealed] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setRingRevealed(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div
            className={ATHLETE_RUN_REST_OVERLAY_BACKDROP}
            role="dialog"
            aria-modal="true"
            aria-label="Descanso entre series"
        >
            <div className={ATHLETE_RUN_REST_OVERLAY_GLOW} aria-hidden />

            <div className={ATHLETE_RUN_REST_OVERLAY_CARD}>
                <NexiaGlassAccentRim />

                <div className="relative z-[1] flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <Timer
                            className={cn(
                                "size-4 shrink-0",
                                urgent ? "text-warning" : "text-primary"
                            )}
                            aria-hidden
                        />
                        <p className={ATHLETE_RUN_REST_OVERLAY_LABEL}>Descanso</p>
                    </div>

                    <div className={cn(ATHLETE_RUN_REST_OVERLAY_RING, "mt-6")}>
                        <svg
                            className="size-full -rotate-90"
                            viewBox="0 0 176 176"
                            aria-hidden
                        >
                            <circle
                                cx="88"
                                cy="88"
                                r={RING_RADIUS}
                                fill="none"
                                className={ATHLETE_RUN_REST_OVERLAY_RING_TRACK}
                                strokeWidth={RING_STROKE}
                            />
                            <circle
                                cx="88"
                                cy="88"
                                r={RING_RADIUS}
                                fill="none"
                                className={cn(
                                    ATHLETE_RUN_REST_OVERLAY_RING_PROGRESS,
                                    urgent && ATHLETE_RUN_REST_OVERLAY_RING_URGENT
                                )}
                                strokeWidth={RING_STROKE}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={ringRevealed ? dashOffset : circumference}
                            />
                        </svg>

                        <p
                            className={cn(
                                ATHLETE_RUN_REST_OVERLAY_TIME,
                                urgent && ATHLETE_RUN_REST_OVERLAY_TIME_URGENT,
                                pulse && ATHLETE_RUN_REST_OVERLAY_TIME_PULSE
                            )}
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {formatAthleteRestCountdown(display)}
                        </p>
                    </div>

                    <p className={ATHLETE_RUN_REST_OVERLAY_HINT}>
                        Recupera antes del siguiente paso
                    </p>

                    <button
                        type="button"
                        className={ATHLETE_RUN_REST_OVERLAY_SKIP}
                        onClick={onSkip}
                    >
                        Saltar descanso
                    </button>
                </div>
            </div>
        </div>
    );
};
