/**
 * exercisesLibraryPresentation.ts — Tokens UI biblioteca de ejercicios (admin/entrenador).
 *
 * Doc: docs/design/00_LEEME_PRIMERO.md · docs/design/01_PREMIUM_PLATFORM_MIGRATION.md
 * Shared: platformPremiumPresentation.ts · glassSurfacePresentation.ts
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";

export {
    PLATFORM_LOADING_ROW as EXERCISES_LIBRARY_LOADING_ROW,
    PLATFORM_PAGE_HEADER as EXERCISES_LIBRARY_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as EXERCISES_LIBRARY_TITLE_WRAP,
} from "@/components/ui/surface/platformPremiumPresentation";

export const EXERCISES_LIBRARY_FILTER_LABEL =
    "mb-1 block text-xs font-medium text-muted-foreground";

/** Opción de filtro desde catálogo (muscle_groups, equipment, movement_patterns). */
export interface ExercisesLibraryCatalogOption {
    id: number;
    label: string;
}

/** Título accesible con contador (E2E: «Ejercicios · {n}»). */
export function exercisesLibraryHeading(count: number): string {
    return `Ejercicios · ${count}`;
}

/**
 * Alta manual desde la biblioteca deshabilitada hasta crear mappings reales de catálogo
 * (equipment / muscle / movement_pattern). Ver docs/catalogo-ejercicios/02_ALTA_EJERCICIOS_OPERACIONES.md
 */
export const EXERCISE_MANUAL_CREATE_ENABLED = false;

export const EXERCISES_LIBRARY_PAGE = cn("relative w-full", "pb-10 lg:pb-12");

export const EXERCISES_LIBRARY_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_72%)]";

export const EXERCISES_LIBRARY_STACK = "relative space-y-6 lg:space-y-8";

export const EXERCISES_LIBRARY_PRIMARY_CTA = cn(
    ATHLETE_PRIMARY_CTA,
    "w-full min-h-touch sm:w-auto sm:min-h-0 sm:px-5"
);

export const EXERCISES_LIBRARY_TOOLBAR = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative p-4 sm:p-5"
);

export const EXERCISES_LIBRARY_TOOLBAR_GRID = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2 sm:gap-3",
    "lg:flex lg:flex-wrap lg:items-end lg:gap-3"
);

export const EXERCISES_LIBRARY_SEARCH_FIELD = "min-w-0 flex-1 basis-[12rem] lg:min-w-[14rem]";

export const EXERCISES_LIBRARY_FILTER_FIELD = cn(
    "flex min-w-0 flex-col",
    "sm:col-span-1",
    "lg:w-36 lg:shrink-0"
);

export const EXERCISES_LIBRARY_FILTER_FIELD_WIDE = cn(EXERCISES_LIBRARY_FILTER_FIELD, "lg:w-40");

export const EXERCISES_LIBRARY_SELECT = cn(
    "h-9 w-full rounded-md border border-border bg-surface/80 px-2 text-xs text-foreground",
    "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
);

export const EXERCISES_LIBRARY_SEARCH_ICON =
    "pointer-events-none absolute left-2.5 top-2.5 z-10 h-4 w-4 text-primary";

export const EXERCISES_LIBRARY_SEARCH_INPUT = "w-full min-w-0 bg-surface/80 pl-9";

export const EXERCISES_LIBRARY_VIEW_TOGGLE_WRAP = "flex shrink-0 self-end lg:self-auto";

export const EXERCISES_LIBRARY_VIEW_TOGGLE = cn(
    "flex gap-1 rounded-md border border-border/80 bg-surface/40 p-0.5"
);

export const EXERCISES_LIBRARY_VIEW_TOGGLE_BTN =
    "rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground";

export const EXERCISES_LIBRARY_VIEW_TOGGLE_BTN_ACTIVE =
    "rounded bg-primary p-1.5 text-primary-foreground";

export const EXERCISES_LIBRARY_FORM_PANEL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-4 p-5 sm:p-6"
);

export const EXERCISES_LIBRARY_FORM_HEADING = "text-sm font-semibold text-foreground";

export const EXERCISES_LIBRARY_FORM_CLOSE = "h-7 w-7 shrink-0 p-0";

export const EXERCISES_LIBRARY_FORM_GRID = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2",
    "lg:grid-cols-3"
);

export const EXERCISES_LIBRARY_FORM_GRID_WIDE = cn(
    "grid grid-cols-1 gap-4",
    "lg:grid-cols-2"
);

export const EXERCISES_LIBRARY_FORM_FIELD_LABEL = "mb-1 block text-xs font-medium text-muted-foreground";

export const EXERCISES_LIBRARY_FORM_INPUT = "bg-surface/80";

export const EXERCISES_LIBRARY_FORM_TEXTAREA_SM = cn(EXERCISES_LIBRARY_FORM_INPUT, "min-h-[80px]");

export const EXERCISES_LIBRARY_FORM_TEXTAREA_XS = cn(EXERCISES_LIBRARY_FORM_INPUT, "min-h-[60px]");

export const EXERCISES_LIBRARY_FORM_ACTIONS = "flex flex-wrap gap-2";

export const EXERCISES_LIBRARY_CARD_GRID = cn(
    "grid grid-cols-1 gap-4",
    "sm:grid-cols-2 sm:gap-5",
    "lg:grid-cols-3 lg:gap-6"
);

export const EXERCISES_LIBRARY_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex h-full flex-col p-5 text-left transition-all",
    "hover:bg-surface-2/40 active:bg-surface-2/55",
    "motion-safe:active:scale-[0.995] motion-reduce:active:scale-100"
);

/** Picker modal / fondos claros legacy — no glass. */
export const EXERCISES_LIBRARY_CARD_PLAIN = cn(
    "flex flex-col rounded-lg bg-card p-5 text-left transition-all hover:bg-surface-2"
);

export const EXERCISES_LIBRARY_CARD_TITLE = "text-sm font-bold text-foreground line-clamp-2";

export const EXERCISES_LIBRARY_CARD_BADGE_ROW = "mt-2 flex flex-wrap gap-1.5";

export const EXERCISES_LIBRARY_CARD_MUSCLE_BADGE = "border-0 px-1.5 py-0 text-[10px] font-medium leading-tight";

export const EXERCISES_LIBRARY_CARD_TYPE_BADGE = "border-border text-[10px] text-muted-foreground";

export const EXERCISES_LIBRARY_CARD_COMPLEX_TYPE_BADGE =
    "border-[hsl(var(--warning))]/40 text-[10px] font-medium text-[hsl(var(--warning))]";

export const EXERCISES_LIBRARY_CARD_META = "mt-3 text-xs text-muted-foreground";

export const EXERCISES_LIBRARY_CARD_VIDEO = "mt-2 flex items-center gap-1 text-[10px] text-primary";

export const EXERCISES_LIBRARY_TABLE_SHELL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-x-auto"
);

export const EXERCISES_LIBRARY_TABLE = "w-full table-fixed text-sm";

/** Anchos de columna — evita que «Nivel» quede pegado al borde derecho. */
export const EXERCISES_LIBRARY_TABLE_COL_NAME = "w-[30%]";
export const EXERCISES_LIBRARY_TABLE_COL_MUSCLE = "w-[22%]";
export const EXERCISES_LIBRARY_TABLE_COL_TYPE = "w-[14%]";
export const EXERCISES_LIBRARY_TABLE_COL_EQUIP = "w-[24%]";
export const EXERCISES_LIBRARY_TABLE_COL_LEVEL = "w-[10%]";

export const EXERCISES_LIBRARY_TABLE_HEAD = "text-left text-sm";

export const EXERCISES_LIBRARY_TABLE_TH = cn(
    "px-3 py-3 font-semibold text-foreground/90",
    "border-b-2 border-border"
);

export const EXERCISES_LIBRARY_TABLE_ROW = cn(
    "cursor-pointer transition-colors",
    "border-b border-border/35",
    "last:border-b-0",
    "hover:bg-surface-2/50 active:bg-surface-2/70"
);

export const EXERCISES_LIBRARY_TABLE_TD = "p-3";

export const EXERCISES_LIBRARY_TABLE_NAME = "font-medium text-foreground";

export const EXERCISES_LIBRARY_TABLE_MUSCLE_BADGE = "border-0 px-1.5 py-0 text-[10px] font-medium";

export const EXERCISES_LIBRARY_TABLE_META = "text-sm text-muted-foreground";

export const EXERCISES_LIBRARY_TABLE_COMPLEX_TYPE =
    "text-sm font-medium text-[hsl(var(--warning))]";

export const EXERCISES_LIBRARY_TABLE_EQUIP = cn(
    EXERCISES_LIBRARY_TABLE_META,
    "truncate max-w-0"
);

export const EXERCISES_LIBRARY_TABLE_LEVEL = cn(
    "text-sm font-medium whitespace-nowrap"
);


export const EXERCISES_LIBRARY_FETCHING = "text-xs text-muted-foreground";

export const EXERCISES_LIBRARY_EMPTY_CARD = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex flex-col items-center px-5 py-10 text-center sm:py-12"
);

export const EXERCISES_LIBRARY_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const EXERCISES_LIBRARY_EMPTY_ART =
    "relative mb-5 flex h-[5.5rem] w-full max-w-[11rem] items-center justify-center";

export const EXERCISES_LIBRARY_EMPTY_IMAGE =
    "h-full w-full object-contain object-center drop-shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.35)]";

export const EXERCISES_LIBRARY_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const EXERCISES_LIBRARY_EMPTY_DESCRIPTION = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const EXERCISES_LIBRARY_EMPTY_ACTION = ATHLETE_EMPTY_STATE_ACTION;

export const EXERCISES_LIBRARY_EMPTY_COPY = {
    imageSrc: "/assets/empty_state.png",
    imageAlt: "Mancuernas en el suelo del gimnasio",
    libraryEmpty: {
        title: "Tu biblioteca está vacía",
        description: "Añade ejercicios para construir tu biblioteca personalizada.",
    },
    filteredEmpty: {
        title: "Sin resultados",
        description: "Prueba otros filtros o términos de búsqueda.",
    },
} as const;

export const EXERCISES_LIBRARY_SECTION_LABELS = {
    newExercise: "Nuevo ejercicio",
    search: "Buscar",
    muscleGroup: "Grupo muscular",
    equipment: "Equipamiento",
    level: "Nivel",
    movementPattern: "Patrón de movimiento",
    loadType: "Tipo de carga",
    type: "Tipo",
    description: "Descripción",
    instructions: "Instrucciones",
    notes: "Notas",
    videoUrl: "URL de video (opcional)",
} as const;
