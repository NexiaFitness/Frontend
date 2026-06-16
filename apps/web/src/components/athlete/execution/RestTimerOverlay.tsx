/**
 * RestTimerOverlay.tsx — Cuenta atrás fullscreen post-serie (DESIGN §7.4).
 */

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/buttons";

export interface RestTimerOverlayProps {
    seconds: number;
    onComplete: () => void;
    onSkip: () => void;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
    seconds,
    onComplete,
    onSkip,
}) => {
    const [remaining, setRemaining] = useState(seconds);

    useEffect(() => {
        setRemaining(seconds);
    }, [seconds]);

    useEffect(() => {
        if (remaining <= 0) {
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(200);
            }
            onComplete();
            return undefined;
        }

        const timer = window.setTimeout(() => {
            setRemaining((r) => r - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [remaining, onComplete]);

    const pulse = remaining > 0 && remaining <= 3;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 px-4"
            role="dialog"
            aria-label="Descanso entre series"
        >
            <p className="text-sm font-medium text-muted-foreground">Descanso</p>
            <p
                className={`mt-4 text-6xl font-bold tabular-nums text-primary ${pulse ? "animate-pulse" : ""}`}
            >
                {Math.max(0, remaining)}
            </p>
            <Button
                type="button"
                variant="outline"
                className="mt-8 min-h-touch-athlete"
                onClick={onSkip}
            >
                Saltar descanso
            </Button>
        </div>
    );
};
