/**
 * constructorExerciseNotesPresentation.ts — Nota por ejercicio en el constructor.
 *
 * Doc: DESIGN_PREMIUM.md · sessionProgrammingPresentation.ts
 */

import { cn } from "@/lib/utils";

/** Input compacto bajo el nombre del ejercicio (tablet-first constructor). */
export const CONSTRUCTOR_EXERCISE_NOTE_INPUT = cn(
    "mt-1 w-full min-w-0 rounded-md border border-border/60 bg-surface/80",
    "px-2 py-1 text-[11px] leading-snug text-foreground",
    "placeholder:text-muted-foreground/80",
    "focus:outline-none focus:border-primary",
    "focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
);

export const CONSTRUCTOR_EXERCISE_NOTE_LABEL = cn(
    "sr-only"
);
