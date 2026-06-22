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
    "flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/12 px-3 py-2.5",
    "shadow-[0_0_16px_-6px] shadow-primary/35",
    "lg:items-center"
);

export const ATHLETE_RUN_SLOT_ROW_MUTED = "opacity-70 border-primary/20 bg-primary/6";

export const ATHLETE_RUN_SLOT_ROW_CONTENT = "relative min-w-0 flex-1";

/** Nombre corto (1 línea): fila 1 — truncate solo en lg+. */
export const ATHLETE_RUN_SLOT_ROW_NAME_COMPACT = cn(
    "text-sm font-medium text-foreground",
    "lg:truncate"
);

/** Nombre largo (2 líneas max) + prescripción inline al cierre de la 2.ª. */
export const ATHLETE_RUN_SLOT_ROW_NAME_WRAPPED = cn(
    "text-sm leading-snug text-foreground line-clamp-2 break-words"
);

export const ATHLETE_RUN_SLOT_ROW_RX_STACKED = cn(
    "text-xs text-muted-foreground/80",
    "lg:truncate"
);

export const ATHLETE_RUN_SLOT_ROW_RX_INLINE = cn(
    "text-xs font-normal text-muted-foreground/80 whitespace-nowrap"
);

/** Lista de slots en card de ronda (superset / giant set). */
export const ATHLETE_RUN_GROUP_SLOT_LIST = "space-y-2";

/** Giant set 5+ ejercicios: scroll interno para no empujar el sticky CTA (DESIGN_MOBILE §7.4). */
export const ATHLETE_RUN_GROUP_SLOT_LIST_SCROLL = cn(
    ATHLETE_RUN_GROUP_SLOT_LIST,
    "max-h-[min(42vh,17.5rem)] overflow-y-auto overscroll-contain",
    "[scrollbar-width:thin]"
);

/** Umbral a partir del cual la lista de slots usa scroll en fase doing. */
export const ATHLETE_RUN_GROUP_SLOT_SCROLL_THRESHOLD = 4;

export const ATHLETE_RUN_SLOT_LOGGER_CARD = cn(NEXIA_GLASS_CARD, "relative space-y-3 p-3 pt-4");

export const ATHLETE_RUN_SLOT_LOGGER_LABEL = cn(
    "text-[10px] font-bold uppercase tracking-wider text-primary"
);

/** Puente visual entre cards de slot y esfuerzo compartido de ronda (V05 §5b). */
export const ATHLETE_RUN_ROUND_EFFORT_BRIDGE = cn(
    "relative flex items-center gap-3 py-1",
    "before:h-px before:flex-1 before:bg-gradient-to-r before:from-transparent before:via-border/70 before:to-border/40",
    "after:h-px after:flex-1 after:bg-gradient-to-l after:from-transparent after:via-border/70 after:to-border/40"
);

export const ATHLETE_RUN_ROUND_EFFORT_BRIDGE_LABEL = cn(
    "shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/75"
);

export const ATHLETE_RUN_ROUND_EFFORT_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-4 p-4 pt-5",
    "border-primary/25 shadow-[0_0_28px_-10px] shadow-primary/30"
);

export const ATHLETE_RUN_ROUND_EFFORT_TITLE = cn(
    "text-sm font-semibold tracking-tight text-foreground"
);

export const ATHLETE_RUN_ROUND_EFFORT_SUB = "text-xs leading-relaxed text-muted-foreground/90";

export type AthleteRoundEffortVariant = "round" | "dropset" | "block";

export interface AthleteRoundEffortCopy {
    bridgeLabel: string;
    title: string;
    subtitle: string;
    ariaLabel: string;
}

export function getAthleteRoundEffortCopy(
    variant: AthleteRoundEffortVariant
): AthleteRoundEffortCopy {
    if (variant === "dropset") {
        return {
            bridgeLabel: "Cierre dropset",
            title: "Esfuerzo del dropset",
            subtitle:
                "Un solo valor para toda la secuencia (MAIN y escalones). Opcional — ayuda a tu entrenador.",
            ariaLabel: "Esfuerzo percibido del dropset completo",
        };
    }

    if (variant === "block") {
        return {
            bridgeLabel: "Cierre de bloque",
            title: "Esfuerzo del bloque",
            subtitle:
                "Un solo valor para todo el bloque. Opcional — ayuda a tu entrenador.",
            ariaLabel: "Esfuerzo percibido del bloque completo",
        };
    }

    return {
        bridgeLabel: "Cierre de ronda",
        title: "Esfuerzo de la ronda",
        subtitle:
            "Un solo valor para todos los ejercicios de esta ronda. Opcional — ayuda a tu entrenador.",
        ariaLabel: "Esfuerzo percibido de la ronda completa",
    };
}

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

export const ATHLETE_RUN_SLOT_ROW_TECHNIQUE = cn(
    ATHLETE_RUN_TECHNIQUE_BTN,
    "shrink-0 self-start lg:self-center"
);

/** Nombre en card logger batch — 2 líneas solo si no cabe en una (mismo criterio que slot row). */
export const ATHLETE_RUN_SLOT_LOGGER_NAME = cn(
    "text-sm font-medium leading-snug text-foreground",
    "line-clamp-2 break-words lg:truncate lg:line-clamp-none lg:leading-normal"
);

export const ATHLETE_RUN_LOGGING_SUMMARY = cn(
    "rounded-lg border border-border/60 bg-surface-2/40 px-3 py-2.5",
    "text-sm font-medium text-foreground"
);

/** Cronómetro de bloque — Fase C (distinto del chip descanso §5a). */
export const ATHLETE_RUN_BLOCK_TIMER_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col items-center px-4 pb-5 pt-6",
    "border-primary/30 shadow-[0_0_32px_-10px] shadow-primary/35"
);

export const ATHLETE_RUN_BLOCK_TIMER_LABEL = cn(
    "text-xs font-bold uppercase tracking-[0.14em] text-primary"
);

export const ATHLETE_RUN_BLOCK_TIMER_TIME = cn(
    "text-4xl font-bold tabular-nums tracking-tight text-foreground"
);

export const ATHLETE_RUN_BLOCK_TIMER_TIME_URGENT = "text-warning";

export const ATHLETE_RUN_BLOCK_TIMER_HINT = "text-xs text-muted-foreground/90 text-center";

export const ATHLETE_RUN_BLOCK_TIMER_RING = "relative mx-auto size-36";

export const ATHLETE_RUN_AMRAP_ROUNDS_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-3 p-4 pt-5"
);

export const ATHLETE_RUN_AMRAP_ROUNDS_LABEL = cn(
    "text-[10px] font-bold uppercase tracking-wider text-primary"
);

export const ATHLETE_RUN_AMRAP_HINT = ATHLETE_RUN_FIELD_HINT;

export const ATHLETE_RUN_AMRAP_TARGET_HINT = "text-xs text-muted-foreground/85";

export const ATHLETE_RUN_AMRAP_SUMMARY = cn(
    "text-sm font-medium tabular-nums text-primary/90"
);

export const ATHLETE_RUN_AMRAP_PARTIAL_TOGGLE = cn(
    "flex w-full items-center justify-between gap-2 rounded-lg border border-border/60",
    "bg-background/35 px-3 py-2.5 text-left text-sm font-medium text-foreground",
    "transition-colors hover:border-primary/30 hover:bg-primary/5"
);

export const ATHLETE_RUN_AMRAP_PARTIAL_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-3 p-4 pt-5"
);

export const ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL = "text-sm font-medium text-foreground";

export const ATHLETE_RUN_AMRAP_PARTIAL_ROW_META = "text-xs text-muted-foreground/85";

export const ATHLETE_RUN_EMOM_CHOICE_ROW = "grid grid-cols-1 gap-2 sm:grid-cols-2";

export const ATHLETE_RUN_EMOM_CHOICE_BTN = (selected: boolean) =>
    cn(
        "min-h-touch-athlete rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
        selected
            ? "border-primary/50 bg-primary/15 text-primary"
            : "border-border/60 bg-background/35 text-foreground hover:border-primary/30 hover:bg-primary/5"
    );

export function getAthleteBlockTimerHint(
    groupKind: string,
    isCountup: boolean,
    isReady = false
): string {
    if (isReady) {
        if (isCountup) {
            return "Pulsa iniciar cuando estés listo — el cronómetro arrancará en cero.";
        }
        if (groupKind === "emom") {
            return "Pulsa iniciar cuando estés listo — tendrás el intervalo completo.";
        }
        return "Pulsa iniciar cuando estés listo — el time cap empezará a bajar.";
    }
    if (isCountup) return "Cronómetro activo — completa la ronda lo antes posible.";
    if (groupKind === "emom") return "Completa la ventana antes de que llegue a cero.";
    return "Máximo de rondas posibles antes de que llegue a cero.";
}

export function getAthleteBlockTimerLabel(
    groupKind: string,
    isCountup: boolean,
    isReady = false
): string {
    if (isReady) return "Listo para empezar";
    if (isCountup) return "Tiempo de ronda";
    if (groupKind === "emom") return "Intervalo";
    return "Time cap";
}

export function getAthleteBlockStartLabel(groupKind: string): string {
    if (groupKind === "amrap") return "Iniciar AMRAP";
    if (groupKind === "emom") return "Iniciar intervalo";
    if (groupKind === "for_time") return "Empezar ronda";
    return "Iniciar bloque";
}

export const ATHLETE_RUN_BLOCK_TIMER_TIME_READY = "text-muted-foreground";

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
