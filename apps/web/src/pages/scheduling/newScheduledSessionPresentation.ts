/**
 * newScheduledSessionPresentation.ts — Tokens premium vista Nueva cita (trainer).
 *
 * Doc: design/00_LEEME_PRIMERO.md · design/platform/01_PREMIUM_MIGRATION.md
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    PLATFORM_BACK_BUTTON,
    PLATFORM_CARD_BODY,
    PLATFORM_ICON_BACK_GAP,
    PLATFORM_ICON_SM,
    PLATFORM_LOADING_ROW,
    PLATFORM_PAGE_HEADER,
    PLATFORM_PAGE_TITLE_WRAP,
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";

export const SCHEDULE_NEW_PAGE = cn(PLATFORM_PAGE_WITH_FIXED_FOOTER, "px-4 lg:px-8");

export const SCHEDULE_NEW_HEADER = PLATFORM_PAGE_HEADER;

export const SCHEDULE_NEW_TITLE_WRAP = PLATFORM_PAGE_TITLE_WRAP;

export const SCHEDULE_NEW_BACK_BUTTON = PLATFORM_BACK_BUTTON;

export const SCHEDULE_NEW_ICON_BACK_GAP = PLATFORM_ICON_BACK_GAP;

export const SCHEDULE_NEW_ICON_SM = PLATFORM_ICON_SM;

export const SCHEDULE_NEW_SHELL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative w-full pt-5"
);

export const SCHEDULE_NEW_BODY = PLATFORM_CARD_BODY;

export const SCHEDULE_NEW_FORM = "space-y-6";

export const SCHEDULE_NEW_FIELD_LABEL = PLATFORM_SECTION_LABEL;

export const SCHEDULE_NEW_FIELD_WRAP = "space-y-2";

export const SCHEDULE_NEW_FORM_GRID_2 = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5";

export const SCHEDULE_NEW_FORM_GRID_4 = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2 sm:gap-5",
    "lg:grid-cols-4"
);

export const SCHEDULE_NEW_SEARCH_WRAP = "relative";

export const SCHEDULE_NEW_SEARCH_ICON = cn(
    "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
);

export const SCHEDULE_NEW_SEARCH_INPUT = "h-9 w-full pl-9";

export const SCHEDULE_NEW_FIELD_ERROR = "text-xs text-destructive";

export const SCHEDULE_NEW_LOADING_ROW = PLATFORM_LOADING_ROW;

export const SCHEDULE_NEW_HINT = "text-sm italic text-muted-foreground";

export const SCHEDULE_NEW_SLOTS_ROW = "flex flex-wrap gap-2";

export const SCHEDULE_NEW_SLOT_BUTTON = cn(
    "border-border/80 bg-surface/60 text-foreground",
    "hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
);

export const SCHEDULE_NEW_CONFLICT_OK = cn(
    "mt-3 rounded-lg border border-success/30 bg-success/10 p-3"
);

export const SCHEDULE_NEW_CONFLICT_ERROR = cn(
    "mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
);

export const SCHEDULE_NEW_CONFLICT_TEXT_OK = "text-sm font-medium text-success";

export const SCHEDULE_NEW_CONFLICT_TEXT_ERROR = "text-sm font-medium text-destructive";

export const SCHEDULE_NEW_FOOTER_ACTIONS = "flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3";

export const SCHEDULE_NEW_FOOTER_PRIMARY = "w-full sm:w-auto";

export const SCHEDULE_NEW_SESSION_TYPE_OPTIONS = [
    { value: "training", label: "Entrenamiento" },
    { value: "consultation", label: "Consulta" },
    { value: "assessment", label: "Evaluación" },
] as const;

export const SCHEDULE_NEW_LOCATION_OPTIONS = [
    { value: "", label: "Ubicación..." },
    { value: "gym", label: "Gimnasio" },
    { value: "online", label: "Online" },
    { value: "client_home", label: "Casa del Cliente" },
    { value: "other", label: "Otra" },
] as const;
