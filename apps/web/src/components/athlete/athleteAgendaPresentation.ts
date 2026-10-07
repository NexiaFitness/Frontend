/**
 * athleteAgendaPresentation.ts — Tokens agenda atleta premium (VOL/INT, tarjetas).
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";

export const ATHLETE_AGENDA_PAGE = "space-y-6 px-4 pb-24 pt-4 lg:px-8 lg:pb-8";

export const ATHLETE_AGENDA_SECTION_LABEL = cn(
    ATHLETE_SECTION_LABEL,
    "text-primary/80 normal-case tracking-normal"
);

export const ATHLETE_AGENDA_DAY_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative space-y-0 p-4 pt-5"
);

export const ATHLETE_AGENDA_DAY_CARD_TODAY = "border-primary/45 shadow-[0_0_24px_-12px] shadow-primary/35";

export const ATHLETE_AGENDA_TODAY_BADGE =
    "ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary";

export const ATHLETE_AGENDA_TRAINING_ROW = cn(
    "flex min-h-touch-athlete w-full items-center gap-3 rounded-lg border border-border/50",
    "bg-card/30 px-3 py-2.5 text-left transition-colors",
    "hover:bg-card/45 active:bg-card/55"
);

export const ATHLETE_AGENDA_APPOINTMENT_ROW = cn(
    ATHLETE_AGENDA_TRAINING_ROW,
    "border-amber-400/25 bg-amber-400/5"
);

export const ATHLETE_SESSION_PLANNED_LOAD_ROW = "flex min-w-[6.5rem] max-w-[7.5rem] items-end gap-2";

export const ATHLETE_SESSION_PLANNED_LOAD_TOUCH = cn(
    "inline-flex min-h-touch-athlete min-w-touch-athlete shrink-0 items-center justify-center rounded-lg",
    "transition-transform active:scale-[0.98]"
);

export const ATHLETE_LOAD_EXPLAINER_SHEET_TITLE = "Carga de la sesión";

export const ATHLETE_LOAD_EXPLAINER_SHEET_BODY = [
    "Volumen: cuánto trabajo hay en la sesión (ejercicios, series y repeticiones).",
    "Intensidad: lo duro que es el entrenamiento (peso y esfuerzo que te pedirá).",
    "Lo decide tu entrenador al planificar.",
] as const;

export const ATHLETE_TODAY_APPOINTMENTS_CARD =
    "rounded-xl border border-border/70 bg-card/80 p-4 space-y-3";

export const ATHLETE_AGENDA_WEEK_HEADING = cn(
    ATHLETE_SECTION_LABEL,
    "pt-2 text-primary/85"
);
