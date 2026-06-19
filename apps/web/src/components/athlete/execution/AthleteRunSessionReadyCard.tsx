/**
 * AthleteRunSessionReadyCard.tsx — Puente pre-resumen (layout paridad RestTimerOverlay).
 */

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PostSessionCompletionRing } from "@/components/athlete/postSession/PostSessionCompletionRing";
import {
    ATHLETE_RUN_REST_OVERLAY_RING_TRACK,
    ATHLETE_RUN_SESSION_READY_CARD,
    ATHLETE_RUN_SESSION_READY_GLOW,
    ATHLETE_RUN_SESSION_READY_HEADLINE,
    ATHLETE_RUN_SESSION_READY_HINT,
    ATHLETE_RUN_SESSION_READY_LABEL,
    ATHLETE_RUN_SESSION_READY_RING_PROGRESS,
    ATHLETE_RUN_SESSION_READY_RING_VALUE,
    ATHLETE_RUN_SESSION_READY_STAGE,
} from "./athleteRunPresentation";

export const AthleteRunSessionReadyCard: React.FC = () => {
    return (
        <div className={ATHLETE_RUN_SESSION_READY_STAGE} role="status" aria-live="polite">
            <div className={ATHLETE_RUN_SESSION_READY_GLOW} aria-hidden />

            <div className={ATHLETE_RUN_SESSION_READY_CARD}>
                <NexiaGlassAccentRim />

                <div className="relative z-[1] flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                        <p className={ATHLETE_RUN_SESSION_READY_LABEL}>Sesión completa</p>
                    </div>

                    <div className="mt-6">
                        <PostSessionCompletionRing
                            percent={100}
                            strokeClass={ATHLETE_RUN_SESSION_READY_RING_PROGRESS}
                            trackClass={ATHLETE_RUN_REST_OVERLAY_RING_TRACK}
                            valueClass={ATHLETE_RUN_SESSION_READY_RING_VALUE}
                            size="lg"
                        />
                    </div>

                    <h2 className={ATHLETE_RUN_SESSION_READY_HEADLINE}>¡Trabajo hecho!</h2>
                    <p className={ATHLETE_RUN_SESSION_READY_HINT}>
                        Cuéntale cómo te sentiste y luego verás tu resumen.
                    </p>
                </div>
            </div>
        </div>
    );
};
