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
