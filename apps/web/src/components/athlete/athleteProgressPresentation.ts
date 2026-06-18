/**
 * athleteProgressPresentation.ts — Barras de progreso premium portal atleta.
 * Fuente única: cumplimiento sesión (V02), carga plan (V08), énfasis plan.
 */

import { cn } from "@/lib/utils";

export type AthleteProgressTone = "primary" | "warning" | "success";

/** Shell glass compartido (track lineal + base escala rating). */
export const ATHLETE_PROGRESS_TRACK_SHELL = cn(
    "relative overflow-hidden",
    "border border-border/60 bg-background/35 backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-foreground/[0.06]"
);

/** Track lineal — lista sesiones, plan, cualquier % continuo. */
export const ATHLETE_PROGRESS_TRACK = cn(
    ATHLETE_PROGRESS_TRACK_SHELL,
    "h-2 rounded-full",
    "shadow-[inset_0_1px_3px] shadow-black/22"
);

const FILL_BASE = cn(
    "relative h-full rounded-full transition-[width] duration-500 ease-out",
    "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-2/5",
    "after:rounded-full after:bg-gradient-to-b after:from-white/22 after:to-transparent"
);

export const ATHLETE_PROGRESS_FILL: Record<AthleteProgressTone, string> = {
    primary: cn(
        FILL_BASE,
        "bg-gradient-to-r from-primary via-primary/80 to-primary/45",
        "shadow-[0_0_16px_-4px] shadow-primary/55"
    ),
    warning: cn(
        FILL_BASE,
        "bg-gradient-to-r from-warning via-warning/80 to-warning/45",
        "shadow-[0_0_16px_-4px] shadow-warning/45"
    ),
    success: cn(
        FILL_BASE,
        "bg-gradient-to-r from-success via-success/80 to-success/45",
        "shadow-[0_0_16px_-4px] shadow-success/45"
    ),
};
