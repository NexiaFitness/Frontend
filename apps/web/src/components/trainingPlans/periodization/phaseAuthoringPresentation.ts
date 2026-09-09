/**
 * phaseAuthoringPresentation.ts — Tokens premium superficie focal D-PAP (Fase 2).
 *
 * Referencia visual: platformPremiumPresentation, glassSurfacePresentation,
 * clientHeaderPresentation — no design system paralelo.
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";
import {
    NEXIA_PORTAL_ACCOUNT_GREETING_H1,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";

export const AUTHORING_SURFACE_CLASS = cn(
    "w-full min-w-0",
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
);

export const AUTHORING_HEADER_CLASS = "mb-3 space-y-2 sm:mb-4";

/** Cabecera focal — compacta; sin cards ni divisores. */
export const AUTHORING_FOCUS_SHELL_CLASS = "space-y-2 sm:space-y-3";

export const AUTHORING_FOCUS_TOP_ROW_CLASS =
    "flex items-start justify-between gap-2 sm:gap-3";

export const AUTHORING_FOCUS_IDENTITY_ROW_CLASS =
    "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1";

export const AUTHORING_FOCUS_NAME_CLASS = cn(
    "min-w-0 shrink-0 text-sm font-semibold leading-snug text-foreground sm:text-base",
);

export const AUTHORING_FOCUS_NAME_GRADIENT_CLASS = NEXIA_PORTAL_GREETING_NAME;

export const AUTHORING_FOCUS_META_CLASS = cn(
    NEXIA_PORTAL_GREETING_SUBTITLE,
    "min-w-0 text-right text-xs leading-relaxed sm:text-sm",
);

/** Reserva vertical del título de tarea (p. ej. «Bloque en creación») cuando no se muestra. */
export const AUTHORING_FOCUS_TASK_TITLE_SPACER_CLASS = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "pointer-events-none h-5 select-none sm:h-[1.375rem]",
);

/** Copy de contexto bajo identidad — única línea visible tras quitar el título. */
export const AUTHORING_FOCUS_TASK_SUBTITLE_CLASS = cn(
    NEXIA_PORTAL_GREETING_SUBTITLE,
    "text-xs leading-relaxed text-foreground/90 sm:text-sm",
);

export const AUTHORING_TITLE_CLASS = NEXIA_PORTAL_CARD_TITLE;

export const AUTHORING_SUBTITLE_CLASS = NEXIA_PORTAL_GREETING_SUBTITLE;

export const AUTHORING_STEP_CARD_CLASS = cn(
    NEXIA_GLASS_CARD,
    "relative min-w-0 p-4 sm:p-6 md:p-8 lg:p-10",
);

/** Columna de trabajo del wizard — tablet-first, centrada (672px). */
export const AUTHORING_WIZARD_COLUMN_CLASS =
    "mx-auto w-full min-w-0 max-w-2xl";

/** Stack título → hint → contenido dentro del body del paso. */
export const AUTHORING_STEP_BODY_STACK_CLASS = "flex flex-col gap-6 md:gap-8";

/** Pregunta principal del paso — techo NEXIA_PORTAL (paridad atleta/trainer). */
export const AUTHORING_STEP_QUESTION_CLASS = cn(
    NEXIA_PORTAL_ACCOUNT_GREETING_H1,
    "max-w-none",
);

/** Instrucción de apoyo — más suave que el título. */
export const AUTHORING_STEP_HINT_CLASS = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-0 max-w-none leading-relaxed",
);

/** Hint de acción inmediata (estado vacío, pulso suave). */
export const AUTHORING_STEP_STATUS_HINT_CLASS =
    "text-sm font-medium leading-relaxed text-primary animate-pulse";

/** Panel interior premium para bloques de contenido del paso. */
export const AUTHORING_STEP_INNER_PANEL_CLASS = cn(
    "rounded-xl border border-border/60 bg-surface-2/30 p-4 backdrop-blur-sm",
    "md:p-5",
);

export const AUTHORING_STEP_SECTION_LABEL_CLASS = PLATFORM_SECTION_LABEL;

export const AUTHORING_STEP_META_CLASS = PLATFORM_SECTION_LABEL;

/** Fila de botones del footer del wizard. */
export const AUTHORING_WIZARD_FOOTER_ROW_CLASS =
    "flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between";

/** Stack footer: avisos + botones dentro de la columna del wizard. */
export const AUTHORING_WIZARD_FOOTER_STACK_CLASS = cn(
    AUTHORING_WIZARD_COLUMN_CLASS,
    "space-y-3",
);

export const AUTHORING_FOOTER_INNER_CLASS =
    "mx-auto flex w-full min-w-0 max-w-full flex-col-reverse gap-3 sm:max-w-3xl sm:flex-row sm:items-center sm:justify-between sm:gap-3";

/** Artículo + sustantivo para copy de periodización (concordancia ES). */
export function periodUnitPhrase(unit: "fase" | "bloque"): string {
    return unit === "fase" ? "la fase" : "el bloque";
}

export const AUTHORING_DAY_TOGGLE_TRACK_CLASS =
    "flex flex-wrap justify-center gap-2 sm:gap-3";

export const authoringDayToggleClass = (active: boolean): string =>
    cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-colors sm:h-12 sm:w-12",
        active
            ? "border-primary bg-primary/15 text-primary shadow-[0_0_20px_-8px_hsl(var(--primary)/0.55)]"
            : "border-border/70 bg-surface-2/50 text-muted-foreground hover:border-primary/35 hover:text-foreground",
    );

export const AUTHORING_PLACEHOLDER_CLASS =
    "rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground";

export const WEEKDAY_LABELS_ES = ["L", "M", "X", "J", "V", "S", "D"] as const;

/** ISO: 1 = Lunes … 7 = Domingo */
export const WEEKDAY_ISO_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;
