/**
 * athleteSessionsPresentation.ts — Tokens lista sesiones V02 (§6.7).
 */

import { cn } from "@/lib/utils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    isPartiallyClosedSession,
    isSessionToday,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

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
export const ATHLETE_SESSION_PREVIEW_SUBLINE =
    "text-sm text-muted-foreground leading-relaxed";

/** Patrones de movimiento — cabecera V04 (antes de músculos). */
export const ATHLETE_SESSION_PREVIEW_PATTERNS =
    "text-sm leading-relaxed text-foreground/90";

export const ATHLETE_SESSION_PREVIEW_PATTERNS_LABEL =
    "text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/75";

/** Cabecera de bloque dentro de «Tu sesión» (sin mini-card anidada). */
export const ATHLETE_SESSION_BLOCK_SECTION_HEADER = cn(
    "flex min-h-touch-athlete w-full items-center gap-3 border-b border-border/45",
    "pb-3 text-left transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background"
);

export const ATHLETE_SESSION_BLOCK_SECTION_HEADER_STATIC = cn(
    ATHLETE_SESSION_BLOCK_SECTION_HEADER,
    "cursor-default border-b border-border/45"
);

export const ATHLETE_SESSION_BLOCK_BODY = "space-y-3 pt-3";

/** @deprecated V04-MAP-UI — usar BLOCK_SECTION_HEADER (filas planas). */
export const ATHLETE_SESSION_DISCLOSURE_TRIGGER = ATHLETE_SESSION_BLOCK_SECTION_HEADER;

/** @deprecated V04-MAP-UI — usar BLOCK_BODY. */
export const ATHLETE_SESSION_DISCLOSURE_PANEL = ATHLETE_SESSION_BLOCK_BODY;

export const ATHLETE_SESSION_SET_TABLE = "w-full text-left text-xs";

export const ATHLETE_SESSION_SET_TABLE_HEAD =
    "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground";

export const ATHLETE_SESSION_SET_TABLE_ROW =
    "border-b border-border/35 last:border-0";

export const ATHLETE_SESSION_SET_TABLE_CELL = "py-2 pr-2 align-top text-foreground/90";

export const ATHLETE_SESSION_SET_TABLE_CELL_MUTED =
    "py-2 pr-2 align-top text-muted-foreground";

export const ATHLETE_SESSION_PREVIEW_HEADLINE =
    "text-2xl font-bold tracking-tight text-foreground";

export const ATHLETE_SESSION_BACK_FROM_AGENDA_LABEL = "Volver a Mi agenda";

/** CTX-1 — botón «i» rendimiento en fila de ejercicio (preview). */
export const ATHLETE_EXERCISE_INFO_BUTTON = cn(
    "inline-flex min-h-touch-athlete min-w-touch-athlete shrink-0 items-center justify-center",
    "rounded-lg border border-border/55 text-primary/80 transition-colors",
    "hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
);

export const ATHLETE_SESSION_META_PILL = cn(
    "inline-flex items-center gap-1.5 rounded-md border border-border/55 bg-background/40",
    "px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm"
);

export const ATHLETE_SESSION_PREVIEW_BLOCK = cn(
    "relative space-y-3 overflow-hidden rounded-xl border border-border/80 bg-card/40 p-4 pt-5",
    "backdrop-blur-md shadow-[0_12px_40px_-16px] shadow-black/40"
);

/** Bloque pendiente — registro al final (FE-3, rim cyan). */
export const ATHLETE_SESSION_LOG_BLOCK_PENDING = cn(
    ATHLETE_SESSION_PREVIEW_BLOCK,
    "cursor-pointer border-primary/45 ring-1 ring-primary/25 transition-colors",
    "hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
);

export const ATHLETE_SESSION_LOG_BLOCK_REGISTERED = cn(
    ATHLETE_SESSION_PREVIEW_BLOCK,
    "cursor-pointer border-emerald-500/35 bg-emerald-500/5"
);

export const ATHLETE_SESSION_LOG_BLOCK_SKIPPED = cn(
    ATHLETE_SESSION_PREVIEW_BLOCK,
    "border-muted-foreground/30 opacity-90"
);

export const ATHLETE_SESSION_LOG_BLOCK_HINT =
    "text-xs font-medium text-primary/90";

export const ATHLETE_SESSION_LOG_BLOCK_SUMMARY =
    "text-sm text-muted-foreground";

export const ATHLETE_SESSION_EXERCISE_ROW = cn(
    "flex items-start gap-2 rounded-md py-1.5 text-sm",
    "text-muted-foreground"
);

export const ATHLETE_SESSION_EXERCISE_ROW_CONFLICT = cn(
    ATHLETE_SESSION_EXERCISE_ROW,
    "border-l-2 border-warning/50 pl-2.5 text-warning"
);

/** Fila plana de ejercicio en mapa V04 (sin mini-card). */
export const ATHLETE_SESSION_EXERCISE_ROW_FLAT = cn(
    "flex items-start gap-2.5 border-b border-border/40 py-3 last:border-b-0"
);

export const ATHLETE_SESSION_EXERCISE_ROW_FLAT_CAUTION = cn(
    ATHLETE_SESSION_EXERCISE_ROW_FLAT,
    "border-l-2 border-l-warning/55 pl-2.5"
);

/** @deprecated V04-MAP-UI — prefer EXERCISE_ROW_FLAT. */
export const ATHLETE_SESSION_EXERCISE_ITEM = cn(
    "flex items-center gap-2.5 rounded-lg border border-border/55 bg-background/35",
    "px-3 py-2.5 backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-foreground/[0.05]"
);

export const ATHLETE_SESSION_EXERCISE_ITEM_CAUTION = cn(
    ATHLETE_SESSION_EXERCISE_ITEM,
    "border-warning/28 bg-warning/8"
);

export const ATHLETE_SESSION_SERIES_TOGGLE = cn(
    "mt-2 min-h-8 text-left text-xs font-medium text-primary/90",
    "underline-offset-2 hover:underline"
);

export const ATHLETE_SESSION_EXERCISE_NAME =
    "min-w-0 flex-1 text-sm font-medium leading-snug text-foreground";

/** @deprecated FE-1 — prefer ATHLETE_SESSION_EXERCISE_DETAIL (prescripción legible). */
export const ATHLETE_SESSION_EXERCISE_SETS = cn(
    "shrink-0 rounded-md border border-border/50 bg-background/50 px-2 py-0.5",
    "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
);

/** Prescripción principal (reps · kg · rondas). */
export const ATHLETE_SESSION_EXERCISE_DETAIL =
    "mt-0.5 text-sm leading-snug text-foreground/90";

/** Línea secundaria gris (descanso, RIR/RPE, distancia, asistencia). */
export const ATHLETE_SESSION_EXERCISE_SECONDARY =
    "mt-0.5 text-xs leading-relaxed text-muted-foreground";

/** Toggle nota del entrenador plegada. */
export const ATHLETE_SESSION_EXERCISE_NOTES_TOGGLE = cn(
    "mt-1.5 min-h-8 text-left text-xs font-medium text-primary/90",
    "underline-offset-2 hover:underline"
);

export const ATHLETE_SESSION_EXERCISE_NOTES_BODY =
    "mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground";
