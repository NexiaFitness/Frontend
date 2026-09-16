/**
 * clientSessionsTabPresentation.ts — Tab Sesiones del cliente (premium · tablet-first).
 *
 * Footer acciones: primary = Crear sesión; auxiliar = ghost-primary Agendar cita.
 * @see design/platform/05_ACTION_HIERARCHY.md §2.3
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import {
    PLANNING_CALENDAR_SHELL_CLASS,
    PLANNING_CALENDAR_WRAP_CLASS,
    PLANNING_SHELL_SPLIT_BASE,
} from "@/components/trainingPlans/periodization/planningShellPresentation";
import {
    templateLibraryFilterChipClass,
    templateLibraryFilterCountClass,
} from "@/components/trainingPlans/templateLibraryPresentation";
import { PERIOD_BLOCK_CARD_SHELL_CLASS } from "@/components/trainingPlans/periodization/periodBlockCardPresentation";
import { SESSION_CARD_LIST_GRID_CLASS } from "@/components/trainingSessions/sessionCardPresentation";

export const CLIENT_SESSIONS_TAB_STACK = cn(PLATFORM_PAGE_SHELL, "space-y-5 pb-24 sm:space-y-6");

export const CLIENT_SESSIONS_SCHEDULE_SPLIT = cn(
    PLANNING_SHELL_SPLIT_BASE,
    "lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]",
);

export const CLIENT_SESSIONS_CALENDAR_WRAP = PLANNING_CALENDAR_WRAP_CLASS;

export const CLIENT_SESSIONS_CALENDAR_SHELL = cn(
    PLANNING_CALENDAR_SHELL_CLASS,
    "relative min-w-0",
);

export const CLIENT_SESSIONS_PANEL_SHELL = cn(
    NEXIA_GLASS_CARD,
    "relative min-h-[280px] min-w-0 p-4 pt-5 sm:min-h-[360px] sm:p-5 sm:pt-6 lg:min-h-[480px]",
);

/** Contenedor bloque activo (panel sesiones) — ring/bg fijos; contenido premium dentro. */
export const CLIENT_SESSIONS_ACTIVE_BLOCK_INNER = cn(
    "rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2",
);

export const CLIENT_SESSIONS_ACTIVE_BLOCK_LOAD_ROW =
    "flex flex-wrap items-center gap-x-4 gap-y-1";

export const CLIENT_SESSIONS_ACTIVE_BLOCK_LOAD_LABEL = cn(
    "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground",
);

export const CLIENT_SESSIONS_LIST_SECTION = "min-w-0 space-y-3";

export const CLIENT_SESSIONS_LIST_TOGGLE = cn(
    "flex w-full min-h-touch items-center gap-2 rounded-lg px-1 py-1 text-left",
    "transition-colors hover:bg-surface/40 sm:min-h-0",
);

export const CLIENT_SESSIONS_LIST_EYEBROW = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
);

export const CLIENT_SESSIONS_LIST_COUNT = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "text-[11px] tabular-nums text-muted-foreground/80",
);

export const CLIENT_SESSIONS_FILTER_ROW = "flex flex-wrap items-center gap-1.5";

export const CLIENT_SESSIONS_FILTER_CHIP = templateLibraryFilterChipClass;

export const CLIENT_SESSIONS_FILTER_COUNT = templateLibraryFilterCountClass;

export const CLIENT_SESSIONS_LIST = SESSION_CARD_LIST_GRID_CLASS;

export const CLIENT_SESSIONS_APPOINTMENT_CARD = cn(
    PERIOD_BLOCK_CARD_SHELL_CLASS,
    "relative p-0 text-left",
    "transition-[transform,box-shadow] duration-150",
    "hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const CLIENT_SESSIONS_APPOINTMENT_INNER = "relative z-[1] space-y-2 px-4 py-4 sm:px-5";

export const CLIENT_SESSIONS_APPOINTMENT_TITLE = cn(
    "truncate text-sm font-semibold text-foreground sm:text-base",
);

export const CLIENT_SESSIONS_APPOINTMENT_META = CLIENT_SESSIONS_LIST_COUNT;

export const CLIENT_SESSIONS_EMPTY_FILTER = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "py-4 text-sm italic text-muted-foreground",
);
