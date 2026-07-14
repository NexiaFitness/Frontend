/**
 * athleteSessionsPresentation.ts — Tokens lista sesiones V02 (§6.7).
 */

import { cn } from "@/lib/utils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    isPartiallyClosedSession,
    isSessionToday,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

/** Barra segmentada — filtros en línea (rectangular, no pill). */
export const ATHLETE_SESSION_FILTER_ROW = cn(
    "flex gap-1 overflow-x-auto rounded-lg border border-border/60 bg-background/30 p-1",
    "backdrop-blur-sm scrollbar-none"
);

export const ATHLETE_SESSION_FILTER_CHIP = cn(
    "inline-flex h-8 min-w-[4.25rem] flex-1 shrink-0 items-center justify-center rounded-md",
    "border border-transparent px-2 text-xs font-medium transition-all duration-150",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ATHLETE_SESSION_FILTER_CHIP_SELECTED = cn(
    "border-primary/30 bg-primary/20 text-primary",
    "shadow-[0_0_14px_-6px] shadow-primary/30"
);

export const ATHLETE_SESSION_FILTER_CHIP_IDLE = cn(
    "text-muted-foreground/80 hover:bg-surface/40 hover:text-foreground"
);

export const ATHLETE_SESSION_LIST_ITEM = cn(
    "relative flex w-full min-h-touch-athlete items-center gap-3 overflow-hidden",
    "rounded-xl border border-border/80 bg-card/40 p-4 backdrop-blur-md",
    "text-left transition-all duration-150",
    "shadow-[0_12px_40px_-16px] shadow-black/40",
    "hover:border-primary/20 active:scale-[0.995] motion-reduce:active:scale-100"
);

export const ATHLETE_SESSION_LIST_ITEM_TODAY =
    "border-primary/25 shadow-[0_12px_40px_-14px] shadow-primary/15";

/** Badge base meta en card sesión (estado + %). */
export const ATHLETE_SESSION_META_BADGE = cn(
    "inline-flex items-center rounded-md border px-2 py-0.5 backdrop-blur-sm",
    "text-[10px] font-semibold uppercase tracking-[0.08em]",
    "shadow-[inset_0_1px_0] shadow-foreground/[0.06]"
);

export const ATHLETE_SESSION_STATUS_BADGE = {
    today: cn(
        ATHLETE_SESSION_META_BADGE,
        "border-primary/35 bg-primary/12 text-primary shadow-primary/10"
    ),
    completed: cn(
        ATHLETE_SESSION_META_BADGE,
        "border-success/30 bg-success/10 text-success shadow-success/10"
    ),
    partial: cn(
        ATHLETE_SESSION_META_BADGE,
        "border-warning/30 bg-warning/10 text-warning shadow-warning/10"
    ),
    planned: cn(
        ATHLETE_SESSION_META_BADGE,
        "border-border/55 bg-background/45 text-muted-foreground"
    ),
    skipped: cn(
        ATHLETE_SESSION_META_BADGE,
        "border-destructive/30 bg-destructive/10 text-destructive"
    ),
};

export type AthleteSessionStatusBadgeVariant = keyof typeof ATHLETE_SESSION_STATUS_BADGE;

export function resolveAthleteSessionStatusBadge(
    session: TrainingSession
): AthleteSessionStatusBadgeVariant {
    if (isSessionToday(session)) return "today";
    if (session.status === "completed") {
        return isPartiallyClosedSession(session) ? "partial" : "completed";
    }
    if (session.status === "skipped") return "skipped";
    return "planned";
}

export const ATHLETE_SESSION_COMPLETION_BADGE = {
    success: cn(
        ATHLETE_SESSION_META_BADGE,
        "normal-case tracking-normal tabular-nums",
        "border-success/30 bg-success/10 text-success"
    ),
    warning: cn(
        ATHLETE_SESSION_META_BADGE,
        "normal-case tracking-normal tabular-nums",
        "border-warning/30 bg-warning/10 text-warning"
    ),
    primary: cn(
        ATHLETE_SESSION_META_BADGE,
        "normal-case tracking-normal tabular-nums",
        "border-primary/30 bg-primary/10 text-primary"
    ),
};

/** Pill meta preview (duración, ejercicios). */
export const ATHLETE_SESSION_META_PILL = cn(
    "inline-flex items-center gap-1.5 rounded-md border border-border/55 bg-background/40",
    "px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm"
);

export const ATHLETE_SESSION_PREVIEW_BLOCK = cn(
    "relative space-y-3 overflow-hidden rounded-xl border border-border/80 bg-card/40 p-4 pt-5",
    "backdrop-blur-md shadow-[0_12px_40px_-16px] shadow-black/40"
);

export const ATHLETE_SESSION_EXERCISE_ROW = cn(
    "flex items-start gap-2 rounded-md py-1.5 text-sm",
    "text-muted-foreground"
);

export const ATHLETE_SESSION_EXERCISE_ROW_CONFLICT = cn(
    ATHLETE_SESSION_EXERCISE_ROW,
    "border-l-2 border-warning/50 pl-2.5 text-warning"
);

export const ATHLETE_SESSION_EXERCISE_ITEM = cn(
    "flex items-center gap-2.5 rounded-lg border border-border/55 bg-background/35",
    "px-3 py-2.5 backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-foreground/[0.05]"
);

export const ATHLETE_SESSION_EXERCISE_ITEM_CAUTION = cn(
    ATHLETE_SESSION_EXERCISE_ITEM,
    "border-warning/28 bg-warning/8"
);

export const ATHLETE_SESSION_EXERCISE_NAME =
    "min-w-0 flex-1 text-sm font-medium leading-snug text-foreground";

export const ATHLETE_SESSION_EXERCISE_SETS = cn(
    "shrink-0 rounded-md border border-border/50 bg-background/50 px-2 py-0.5",
    "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
);
