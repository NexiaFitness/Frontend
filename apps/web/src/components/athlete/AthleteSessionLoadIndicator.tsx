/**
 * AthleteSessionLoadIndicator — CARGA-1 (05_ROADMAP): círculo volumen×intensidad, ayuda al toque.
 */

import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { AthleteSessionLoadVisualModel } from "@nexia/shared/utils/athlete/athleteSessionLoadVisual";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";

const VOLUME_SIZE: Record<AthleteSessionLoadVisualModel["volumeTier"], string> = {
    low: "size-3 min-w-3",
    medium: "size-4 min-w-4",
    high: "size-5 min-w-5",
};

/** Color = intensidad; anillo extra refuerza accesibilidad (sin depender solo del color). */
const INTENSITY_STYLE: Record<
    AthleteSessionLoadVisualModel["intensityTier"],
    { fill: string; ring: string }
> = {
    low: {
        fill: "bg-sky-400/45",
        ring: "ring-2 ring-sky-300/80 ring-offset-2 ring-offset-background",
    },
    medium: {
        fill: "bg-amber-400/50",
        ring: "ring-[3px] ring-amber-300/85 ring-offset-2 ring-offset-background",
    },
    high: {
        fill: "bg-orange-400/55",
        ring: "ring-4 ring-orange-300/90 ring-offset-2 ring-offset-background",
    },
};

const LOAD_HELP_SEEN_KEY = "nexia_athlete_load_help_seen";

export interface AthleteSessionLoadIndicatorProps {
    model: AthleteSessionLoadVisualModel;
    className?: string;
    /** Solo el indicador del día en agenda: aviso CARGA-1 una vez. */
    autoShowHelpOnce?: boolean;
}

export const AthleteSessionLoadIndicator: React.FC<AthleteSessionLoadIndicatorProps> = ({
    model,
    className,
    autoShowHelpOnce = false,
}) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!autoShowHelpOnce || model.sessionCount === 0) return;
        try {
            if (localStorage.getItem(LOAD_HELP_SEEN_KEY) === "1") return;
            const t = window.setTimeout(() => setOpen(true), 400);
            return () => window.clearTimeout(t);
        } catch {
            return undefined;
        }
    }, [autoShowHelpOnce, model.sessionCount]);

    const handleOpen = useCallback(() => {
        setOpen(true);
        try {
            localStorage.setItem(LOAD_HELP_SEEN_KEY, "1");
        } catch {
            /* ignore */
        }
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        try {
            localStorage.setItem(LOAD_HELP_SEEN_KEY, "1");
        } catch {
            /* ignore */
        }
    }, []);

    if (model.sessionCount === 0) return null;

    const intensity = INTENSITY_STYLE[model.intensityTier];
    const showCount = model.sessionCount > 1;

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                aria-label={model.ariaLabel}
                className={cn(
                    "relative inline-flex shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
                    VOLUME_SIZE[model.volumeTier],
                    intensity.fill,
                    intensity.ring,
                    className
                )}
            >
                {showCount ? (
                    <span
                        className="text-[10px] font-semibold leading-none text-foreground/90"
                        aria-hidden
                    >
                        {model.sessionCount}
                    </span>
                ) : null}
            </button>
            <BottomSheet isOpen={open} onClose={handleClose} title="Carga del día">
                <p className="text-sm text-muted-foreground">
                    El color indica lo intenso que es el día; el tamaño, cuánto trabajo hay.
                </p>
                <p className="mt-4 text-sm text-foreground">
                    Volumen{" "}
                    <span className="font-medium capitalize">{model.volumeLabel}</span>
                    {" · "}
                    Intensidad{" "}
                    <span className="font-medium capitalize">{model.intensityLabel}</span>
                    {showCount ? ` · ${model.sessionCount} sesiones hoy` : null}
                </p>
            </BottomSheet>
        </>
    );
};
