/**
 * athleteEmptyStatePresentation.ts — Empty states premium portal atleta.
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export type AthleteEmptyStateVariant = "feedback" | "sessions" | "plan" | "progress";

export const ATHLETE_EMPTY_STATE_CARD = cn(
    NEXIA_GLASS_CARD,
    "relative flex flex-col items-center px-5 py-8 text-center",
    "pt-9"
);

export const ATHLETE_EMPTY_STATE_CARD_COMPACT = cn(
    ATHLETE_EMPTY_STATE_CARD,
    "px-4 py-6 pt-8"
);

export const ATHLETE_EMPTY_STATE_GLOW =
    "pointer-events-none absolute -top-8 left-1/2 size-32 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl";

export const ATHLETE_EMPTY_STATE_ART =
    "relative mb-5 flex h-[5.5rem] w-full max-w-[11rem] items-center justify-center";

export const ATHLETE_EMPTY_STATE_ICON_WRAP = cn(
    "relative z-[1] flex size-14 items-center justify-center rounded-2xl",
    "border border-primary/30 bg-primary/12 text-primary backdrop-blur-sm",
    "shadow-[inset_0_1px_0] shadow-primary/15",
    "shadow-[0_0_28px_-8px] shadow-primary/35"
);

export const ATHLETE_EMPTY_STATE_TITLE = "text-base font-semibold tracking-tight text-foreground";

export const ATHLETE_EMPTY_STATE_DESCRIPTION =
    "mt-2 max-w-[18rem] text-sm leading-relaxed text-muted-foreground";

export const ATHLETE_EMPTY_STATE_ACTION = "relative z-[1] mt-5 w-full max-w-xs";

export interface AthleteEmptyStatePreset {
    title: string;
    description: string;
}

export const ATHLETE_EMPTY_STATE_PRESETS: Record<
    AthleteEmptyStateVariant,
    AthleteEmptyStatePreset
> = {
    feedback: {
        title: "Sin feedback todavía",
        description:
            "Tras completar una sesión podrás enviar sensaciones y ver la respuesta de tu entrenador aquí.",
    },
    sessions: {
        title: "No hay sesiones",
        description: "Tu entrenador aún no ha programado sesiones para ti.",
    },
    plan: {
        title: "Sin plan activo",
        description:
            "Cuando tu entrenador publique tu periodización, la verás aquí con el detalle semana a semana.",
    },
    progress: {
        title: "Sin datos de progreso",
        description:
            "Completa sesiones y registra cargas para ver gráficas, récords y evolución.",
    },
};
