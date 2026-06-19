/**
 * athleteRunPresentation.ts — Tokens V05 run (glass, badges, contexto).
 * @see docs/audits/portal-atleta/spec/F3b_V05_ATHLETE_RUN_TIPOS_SERIE.md
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";
import type { AthleteFlatExercise } from "@nexia/shared/offline";

export const ATHLETE_RUN_LOGGER_CARD = cn(NEXIA_GLASS_CARD, "relative space-y-5 p-4 pt-5");

export const ATHLETE_RUN_LOGGER_SECTION_LABEL = ATHLETE_SECTION_LABEL;

/** Título de card de grupo (superset, circuito…) — un escalón sobre section label. */
export const ATHLETE_RUN_GROUP_SECTION_LABEL = cn(
    "text-xs font-bold uppercase tracking-[0.12em] text-primary"
);

export const ATHLETE_RUN_HINT_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-3 p-4 pt-5"
);

export const ATHLETE_RUN_VIDEO_PLACEHOLDER = cn(
    NEXIA_GLASS_CARD,
    "relative flex aspect-video items-center justify-center overflow-hidden"
);

export const ATHLETE_RUN_GROUP_BADGE = cn(
    "inline-flex items-center rounded-full border border-primary/35 bg-primary/10",
    "px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
);

export const ATHLETE_RUN_ROUND_PILL = cn(
    "inline-flex items-center rounded-full border border-border/70 bg-surface-2/50",
    "px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground"
);

export const ATHLETE_RUN_STEP_CAPTION = "text-xs font-medium tabular-nums text-muted-foreground";

export const ATHLETE_RUN_INSTRUCTION = "text-sm leading-snug text-muted-foreground";

export const ATHLETE_RUN_EXERCISE_TITLE = "text-xl font-bold tracking-tight text-foreground";

export const ATHLETE_RUN_PRESCRIPTION = cn(
    "text-sm font-medium text-primary/90",
    "rounded-lg border border-primary/20 bg-primary/8 px-3 py-2"
);

export const ATHLETE_RUN_FIELD_LABEL = "text-sm font-medium text-foreground";

export const ATHLETE_RUN_FIELD_HINT = "text-xs leading-snug text-muted-foreground/85";

export const ATHLETE_RUN_VALUE_PILL = cn(
    "inline-flex min-w-[4.5rem] items-center justify-center rounded-lg",
    "border border-primary/30 bg-primary/12 px-3 py-2",
    "text-xl font-semibold tabular-nums leading-none text-primary",
    "shadow-[0_0_20px_-6px] shadow-primary/40"
);

export const ATHLETE_RUN_STEPPER_ROW = cn(
    "flex items-center justify-between gap-3 rounded-lg border border-border/60",
    "bg-background/35 p-2 backdrop-blur-sm"
);

export const ATHLETE_RUN_STEPPER_BTN = cn(
    "flex size-11 shrink-0 items-center justify-center rounded-md",
    "border border-border/70 bg-card/40 text-foreground backdrop-blur-sm",
    "transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
    "motion-safe:active:scale-95 motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    "disabled:pointer-events-none disabled:opacity-40"
);

export const ATHLETE_RUN_HINT_VALUE = "text-sm font-semibold tabular-nums text-foreground";

export const ATHLETE_RUN_HINT_APPLY_BTN = cn(
    "inline-flex h-9 items-center justify-center rounded-lg px-3.5",
    "border border-primary/40 bg-primary/15 text-xs font-semibold text-primary",
    "transition-colors hover:bg-primary/25",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100"
);

export const ATHLETE_RUN_REST_CHIP = cn(
    "mx-auto flex w-fit items-center gap-2",
    "rounded-full border border-primary/45 bg-card/80 px-4 py-2",
    "text-sm font-semibold text-primary backdrop-blur-md",
    "shadow-[0_0_24px_-4px] shadow-primary/50"
);

export const ATHLETE_RUN_REST_CHIP_URGENT = cn(
    "border-warning/50 text-warning shadow-warning/40"
);

export const ATHLETE_RUN_REST_CHIP_PULSE = "motion-safe:animate-pulse motion-reduce:animate-none";

/** Overlay fullscreen post-confirm (§5b.1 / Fase E). */
export const ATHLETE_RUN_REST_OVERLAY_BACKDROP = cn(
    "fixed inset-0 z-50 flex flex-col items-center justify-center px-4",
    "bg-background/75 backdrop-blur-xl",
    "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
    "motion-reduce:animate-none"
);

export const ATHLETE_RUN_REST_OVERLAY_GLOW = cn(
    "pointer-events-none absolute inset-0",
    "bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,hsl(var(--primary)/0.14)_0%,transparent_65%)]"
);

export const ATHLETE_RUN_REST_OVERLAY_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative flex w-full max-w-[min(100%,20rem)] flex-col items-center px-6 pb-7 pt-9",
    "motion-safe:animate-in motion-safe:zoom-in-95 motion-safe:duration-300",
    "motion-reduce:animate-none"
);

export const ATHLETE_RUN_REST_OVERLAY_LABEL = cn(
    "text-xs font-bold uppercase tracking-[0.14em] text-primary"
);

export const ATHLETE_RUN_REST_OVERLAY_HINT = "mt-2 text-center text-xs leading-snug text-muted-foreground/90";

export const ATHLETE_RUN_REST_OVERLAY_TIME = cn(
    "absolute inset-0 flex flex-col items-center justify-center",
    "text-5xl font-bold tabular-nums leading-none tracking-tight text-primary",
    "drop-shadow-[0_0_24px_hsl(var(--primary)/0.45)]"
);

export const ATHLETE_RUN_REST_OVERLAY_TIME_URGENT = cn(
    "text-warning drop-shadow-[0_0_24px_hsl(var(--warning)/0.4)]"
);

export const ATHLETE_RUN_REST_OVERLAY_TIME_PULSE = "motion-safe:animate-pulse motion-reduce:animate-none";

export const ATHLETE_RUN_REST_OVERLAY_RING = "relative mx-auto size-44";

export const ATHLETE_RUN_REST_OVERLAY_RING_TRACK = "stroke-border/35";

export const ATHLETE_RUN_REST_OVERLAY_RING_PROGRESS = cn(
    "stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear",
    "drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
);

export const ATHLETE_RUN_REST_OVERLAY_RING_URGENT = cn(
    "stroke-warning drop-shadow-[0_0_8px_hsl(var(--warning)/0.45)]"
);

export const ATHLETE_RUN_REST_OVERLAY_SKIP = cn(
    "mt-8 inline-flex min-h-touch-athlete items-center justify-center rounded-lg px-6",
    "border border-primary/40 bg-primary/12 text-sm font-semibold text-primary",
    "shadow-[0_0_24px_-6px] shadow-primary/40 backdrop-blur-sm",
    "transition-colors hover:border-primary/55 hover:bg-primary/20",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const ATHLETE_RUN_STICKY_GLOW = "shadow-[0_0_32px_-8px] shadow-primary/60";

export const ATHLETE_RUN_LOGGER_REVEAL = cn(
    "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
    "motion-safe:duration-300 motion-reduce:animate-none"
);

export const ATHLETE_RUN_GROUP_HERO_TITLE = cn(
    "text-xs font-bold uppercase tracking-[0.14em] text-primary"
);

export const ATHLETE_RUN_GROUP_HERO_ROUND = cn(
    "text-2xl font-bold tracking-tight tabular-nums text-foreground"
);

export const ATHLETE_RUN_GROUP_HERO = "space-y-1";

export const ATHLETE_RUN_SLOT_ROW = cn(
    "flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/12 px-3 py-2.5",
    "shadow-[0_0_16px_-6px] shadow-primary/35"
);

export const ATHLETE_RUN_SLOT_ROW_MUTED = "opacity-70 border-primary/20 bg-primary/6";

export const ATHLETE_RUN_SLOT_LOGGER_CARD = cn(NEXIA_GLASS_CARD, "relative space-y-3 p-3 pt-4");

export const ATHLETE_RUN_SLOT_LOGGER_LABEL = cn(
    "text-[10px] font-bold uppercase tracking-wider text-primary"
);

export const ATHLETE_RUN_GROUP_HERO_ENTER = cn(
    "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150",
    "motion-reduce:animate-none"
);

export const ATHLETE_RUN_CONTENT_MUTED = "transition-opacity duration-300 opacity-80";

export const ATHLETE_RUN_TECHNIQUE_BTN = cn(
    "inline-flex shrink-0 items-center justify-center rounded-md",
    "border border-primary/35 bg-primary/10 px-2.5 py-1",
    "text-[11px] font-semibold text-primary",
    "transition-colors hover:bg-primary/20",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100"
);

export const ATHLETE_RUN_LOGGING_SUMMARY = cn(
    "rounded-lg border border-border/60 bg-surface-2/40 px-3 py-2.5",
    "text-sm font-medium text-foreground"
);

export const ATHLETE_RUN_DOING_ENTER = ATHLETE_RUN_GROUP_HERO_ENTER;

/** Puente pre-resumen — paridad layout RestTimerOverlay (§5b.1 / Fase E). */
export const ATHLETE_RUN_SESSION_READY_STAGE = cn(
    "fixed inset-x-0 top-0 z-40 flex flex-col items-center justify-center px-4",
    "bottom-[calc(4rem+5.5rem+env(safe-area-inset-bottom))]",
    "bg-background/35 backdrop-blur-sm pointer-events-none",
    "lg:static lg:z-auto lg:flex-1 lg:min-h-[min(56vh,32rem)] lg:bg-transparent lg:backdrop-blur-none"
);

export const ATHLETE_RUN_SESSION_READY_GLOW = cn(
    "pointer-events-none absolute inset-0",
    "bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,hsl(var(--success)/0.12)_0%,transparent_65%)]"
);

export const ATHLETE_RUN_SESSION_READY_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative flex w-full max-w-[min(100%,20rem)] flex-col items-center px-6 pb-7 pt-9",
    "border-success/25 pointer-events-auto",
    ATHLETE_RUN_DOING_ENTER
);

export const ATHLETE_RUN_SESSION_READY_LABEL = cn(
    "text-xs font-bold uppercase tracking-[0.14em] text-success"
);

export const ATHLETE_RUN_SESSION_READY_RING_PROGRESS = cn(
    "stroke-success drop-shadow-[0_0_8px_hsl(var(--success)/0.5)]"
);

export const ATHLETE_RUN_SESSION_READY_RING_VALUE = cn(
    "text-success drop-shadow-[0_0_20px_hsl(var(--success)/0.35)]"
);

export const ATHLETE_RUN_SESSION_READY_HEADLINE = cn(
    "mt-5 text-center text-2xl font-bold leading-tight tracking-tight text-foreground"
);

export const ATHLETE_RUN_SESSION_READY_HINT = cn(
    "mt-2 max-w-[16rem] text-center text-xs leading-snug text-muted-foreground/90"
);

/** Dropset B.2.1 — embudo vertical (doing) y batch logger (logging_rest). */
export const ATHLETE_RUN_DROPSET_FUNNEL_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-4 p-4 pt-5",
    ATHLETE_RUN_DOING_ENTER
);

export const ATHLETE_RUN_DROPSET_EDU = cn(
    "rounded-lg border border-primary/25 bg-primary/[0.07] px-3 py-2.5",
    "space-y-1 border-l-2 border-l-primary/60"
);

export const ATHLETE_RUN_DROPSET_EDU_LINE = "text-xs leading-snug text-muted-foreground/95";

export const ATHLETE_RUN_DROPSET_EXERCISE_TITLE = cn(
    "text-lg font-bold tracking-tight text-foreground leading-tight"
);

export const ATHLETE_RUN_DROPSET_ACTION_HINT = cn(
    "text-center text-[11px] font-medium leading-snug text-primary/85"
);

export const ATHLETE_RUN_DROPSET_MAIN_RING = cn(
    "z-10 flex size-11 shrink-0 items-center justify-center rounded-full",
    "border-2 border-primary/55 bg-primary/15",
    "text-[9px] font-bold uppercase tracking-wide text-primary",
    "shadow-[0_0_20px_-4px] shadow-primary/45"
);

export const ATHLETE_RUN_DROPSET_DROP_RING = cn(
    "z-10 flex size-11 shrink-0 flex-col items-center justify-center rounded-full",
    "border-2 border-primary/35 bg-primary/[0.08] text-primary",
    "shadow-[0_0_14px_-6px] shadow-primary/30"
);

export const ATHLETE_RUN_DROPSET_CONNECTOR = cn(
    "pointer-events-none absolute left-1/2 top-11 bottom-0 w-px -translate-x-1/2",
    "bg-gradient-to-b from-primary/45 via-primary/25 to-primary/10"
);

export const ATHLETE_RUN_DROPSET_STEP_CARD = cn(
    "rounded-lg border border-primary/30 bg-primary/[0.09] px-3 py-2.5",
    "shadow-[0_0_14px_-8px] shadow-primary/35"
);

export const ATHLETE_RUN_DROPSET_STEP_LABEL = cn(
    "text-[10px] font-bold uppercase tracking-[0.1em] text-primary"
);

export const ATHLETE_RUN_DROPSET_STEP_PRESCRIPTION = "text-sm font-medium text-foreground/95";

export const ATHLETE_RUN_DROPSET_ARROW = cn(
    "mx-auto flex size-5 items-center justify-center text-primary/50"
);

export const ATHLETE_RUN_DROPSET_LOGGER_HEADER = cn(
    "text-sm font-semibold text-foreground"
);

export const ATHLETE_RUN_DROPSET_LOGGER_SUB = "text-xs text-muted-foreground/85";

const GROUP_KIND_FALLBACK: Record<string, string> = {
    superset: "SUPERSET",
    giant_set: "GIANT SET",
    dropset: "DROP SET",
    amrap: "AMRAP",
    emom: "EMOM",
    for_time: "FOR TIME",
};

/** Etiqueta humana: S1 → Serie 1, MAIN → Serie principal… */
export function formatRunSetLabel(setLabel: string): string {
    const sMatch = /^S(\d+)$/.exec(setLabel);
    if (sMatch) return `Serie ${sMatch[1]}`;

    const rMatch = /^R(\d+)$/.exec(setLabel);
    if (rMatch) return `Serie ${rMatch[1]} de la ronda`;

    if (setLabel === "MAIN") return "Serie principal";

    const dropMatch = /^DROP (\d+)$/.exec(setLabel);
    if (dropMatch) return `Drop ${dropMatch[1]}`;

    return setLabel;
}

/** Hero single_set — paralelo a SUPERSET A + Ronda k/N. */
export function formatSingleSetHeroLabels(exercise: AthleteFlatExercise): {
    badgeLabel: string;
    roundLabel: string;
} {
    const setPart = formatRunSetLabel(exercise.setLabel);
    const badgeLabel = /^S\d+$/i.test(exercise.setLabel)
        ? exercise.setLabel.toUpperCase()
        : setPart.toUpperCase();

    const roundLabel =
        exercise.totalSetsInSlot > 1
            ? `${setPart} de ${exercise.totalSetsInSlot}`
            : setPart;

    return {
        badgeLabel,
        roundLabel,
    };
}

/** Prescripción compacta para fila slot (sin repetir serie). */
export function formatRunPrescriptionCompact(exercise: AthleteFlatExercise): string {
    const parts: string[] = [];

    const repsMatch = exercise.plannedLabel.match(/([\d][\d-]*)\s*reps?/i);
    if (repsMatch) {
        parts.push(`${repsMatch[1]} repeticiones`);
    } else if (exercise.defaultReps > 0) {
        parts.push(`${exercise.defaultReps} repeticiones`);
    }

    const rpeMatch = exercise.plannedLabel.match(/RPE\s*(\d+)/i);
    if (rpeMatch) {
        parts.push(`RPE ${rpeMatch[1]}`);
    }

    const durationMatch = exercise.plannedLabel.match(/(\d+)s/);
    if (durationMatch) {
        parts.push(`${durationMatch[1]} segundos`);
    }

    return parts.join(" · ") || exercise.plannedLabel;
}

/** Prescripción legible bajo el nombre del ejercicio. */
export function formatRunPrescriptionLine(exercise: AthleteFlatExercise): string {
    const parts: string[] = [formatRunSetLabel(exercise.setLabel)];

    const repsMatch = exercise.plannedLabel.match(/([\d][\d-]*)\s*reps?/i);
    if (repsMatch) {
        parts.push(`${repsMatch[1]} repeticiones`);
    } else if (exercise.defaultReps > 0) {
        parts.push(`${exercise.defaultReps} repeticiones`);
    }

    const rpeMatch = exercise.plannedLabel.match(/RPE\s*(\d+)/i);
    if (rpeMatch) {
        parts.push(`RPE ${rpeMatch[1]} objetivo`);
    }

    const durationMatch = exercise.plannedLabel.match(/(\d+)s/);
    if (durationMatch) {
        parts.push(`${durationMatch[1]} segundos`);
    }

    return parts.join(" · ");
}

/** Línea legible para hint «Última vez». */
export function formatRunLastPerformanceLine(
    weightKg: number,
    reps: number | null,
    rpe: number | null
): string {
    const parts = [`${weightKg} kg`];
    if (reps != null) parts.push(`${reps} repeticiones`);
    if (rpe != null) parts.push(`RPE ${rpe}`);
    return parts.join(" · ");
}

export function resolveRunGroupBadge(exercise: AthleteFlatExercise): string | null {
    if (exercise.badgeLabel) return exercise.badgeLabel;
    if (!exercise.groupKind || exercise.groupKind === "single_set") return null;
    return GROUP_KIND_FALLBACK[exercise.groupKind] ?? exercise.groupKind.replace(/_/g, " ").toUpperCase();
}

/** Línea corta de contexto: «Ronda 2/4 · A2» o «Serie 3 de 4». */
export function formatRunContextLine(exercise: AthleteFlatExercise): string | null {
    const isCompound =
        exercise.groupKind &&
        exercise.groupKind !== "single_set" &&
        exercise.roundTotal != null &&
        exercise.roundTotal > 1;

    if (isCompound && exercise.roundIndex != null) {
        const parts = [`Ronda ${exercise.roundIndex}/${exercise.roundTotal}`];
        if (exercise.slotLabel && !exercise.slotLabel.startsWith("S")) {
            parts.push(exercise.slotLabel);
        }
        return parts.join(" · ");
    }

    if (exercise.groupKind === "single_set" && exercise.totalSetsInSlot > 1) {
        return `Serie ${exercise.setIndex} de ${exercise.totalSetsInSlot}`;
    }

    if (exercise.setLabel && exercise.groupKind === "dropset") {
        return formatRunSetLabel(exercise.setLabel);
    }

    return null;
}
