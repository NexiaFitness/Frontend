/**
 * AthleteSessionLoadIndicator — CARGA-1 (05_ROADMAP): círculo volumen×intensidad, ayuda al toque.
 */

import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { AthleteSessionLoadVisualModel } from "@nexia/shared/utils/athlete/athleteSessionLoadVisual";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import {
    ATHLETE_LOAD_HIT_TARGET,
    ATHLETE_LOAD_INTENSITY_STYLE,
    ATHLETE_LOAD_VOLUME_SIZE,
} from "@/components/athlete/athleteAgendaPresentation";

const LOAD_HELP_SEEN_KEY = "nexia_athlete_load_help_seen";

export interface AthleteSessionLoadIndicatorProps {
    model: AthleteSessionLoadVisualModel;
    className?: string;
    /** Solo el indicador del día en agenda: aviso CARGA-1 una vez. */
    autoShowHelpOnce?: boolean;
    sheetTitle?: string;
    helpText?: string;
}

export const AthleteSessionLoadIndicator: React.FC<AthleteSessionLoadIndicatorProps> = ({
    model,
    className,
    autoShowHelpOnce = false,
    sheetTitle = "Carga del día",
    helpText = "El color indica lo intenso que es el día; el tamaño, cuánto trabajo hay.",
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

    const intensity = ATHLETE_LOAD_INTENSITY_STYLE[model.intensityTier];
    const showCount = model.sessionCount > 1;

    return (
        <>
            <button
                type="button"
                onClick={handleOpen}
                aria-label={model.ariaLabel}
                className={cn(ATHLETE_LOAD_HIT_TARGET, className)}
            >
                <span
                    className={cn(
                        "absolute rounded-full",
                        ATHLETE_LOAD_VOLUME_SIZE[model.volumeTier],
                        intensity.fill,
                        intensity.ring
                    )}
                    aria-hidden
                />
                {showCount ? (
                    <span
                        className="relative z-10 text-[10px] font-semibold leading-none text-foreground/90"
                        aria-hidden
                    >
                        {model.sessionCount}
                    </span>
                ) : null}
            </button>
            <BottomSheet isOpen={open} onClose={handleClose} title={sheetTitle}>
                <p className="text-sm text-muted-foreground">{helpText}</p>
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
