/**
 * sessionProgrammingPresentation.ts — Constructor / crear-editar sesión (premium compartido).
 *
 * Doc: DESIGN_PREMIUM.md (raíz) · design/platform/01_PREMIUM_MIGRATION.md
 * Barras volumen muscular: muscleVolumeRowPresentation.ts (track = BlockLevelMeter).
 * Patrón: templateLibraryPresentation.ts · CreateTrainingPlanTemplate.tsx
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_SECTION_LABEL,
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_CARD_COMPACT,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_GLOW,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    PLATFORM_SECTION_LABEL,
} from "@/components/ui/surface/platformPremiumPresentation";
import { NEXIA_DIVIDER_SUBTLE } from "@/components/ui/surface/nexiaDividerPresentation";

export {
    PLATFORM_BACK_BUTTON as SESSION_PROGRAMMING_BACK_BUTTON,
    PLATFORM_PAGE_HEADER as SESSION_PROGRAMMING_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as SESSION_PROGRAMMING_TITLE_WRAP,
    PLATFORM_LOADING_ROW as SESSION_PROGRAMMING_LOADING_ROW,
} from "@/components/ui/surface/platformPremiumPresentation";

export const SESSION_PROGRAMMING_COPY = {
    createTitle: "Nueva sesión",
    createSubtitle: "Programa bloques, ejercicios y carga para el cliente",
    editTitle: "Editar sesión",
    editSubtitle: "Ajusta los detalles y el constructor de la sesión",
    sectionSessionData: "Datos de la sesión",
    sectionConstructor: "Constructor",
    sectionNotes: "Notas",
    clientBannerPrefix: "Creando sesión para",
    editClientBannerPrefix: "Editando sesión para",
    nameHint: "Se genera automáticamente; puedes cambiarlo",
    planHint: "La sesión debe estar vinculada a un plan para el seguimiento de carga.",
    createSubmitLabel: "Crear Sesión",
    createSubmitLoading: "Creando sesión…",
} as const;

/** Shell página con clearance para footer fijo. */
export const SESSION_PROGRAMMING_PAGE = cn(
    PLATFORM_PAGE_WITH_FIXED_FOOTER,
    "relative",
);

export const SESSION_PROGRAMMING_GLOW =
    "pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.11),transparent_72%)]";

export const SESSION_PROGRAMMING_STACK = "relative space-y-5 sm:space-y-6 lg:space-y-7";

/** Separación explícita entre banner cliente y bloque de formulario. */
export const SESSION_PROGRAMMING_FORM_STACK = "space-y-5 sm:space-y-6";

/** Grid formulario + sidebar solo para empty «sin plan» (standalone). */
export const SESSION_PROGRAMMING_MAIN_GRID = "grid grid-cols-1 items-stretch gap-5 sm:gap-6";

export const SESSION_PROGRAMMING_MAIN_GRID_WITH_SIDEBAR = cn(
    SESSION_PROGRAMMING_MAIN_GRID,
    "lg:grid-cols-[minmax(0,1fr)_min(420px,38%)]",
);

export const SESSION_PROGRAMMING_SIDEBAR = "flex h-full min-h-0 flex-col lg:self-stretch";

/** Card glass para bloque de campos del formulario. */
export const SESSION_PROGRAMMING_FORM_SECTION = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative space-y-3 p-4 pt-4 sm:p-4 sm:pt-5",
);

export const SESSION_PROGRAMMING_SECTION_TITLE = cn(ATHLETE_SECTION_LABEL, "mb-0.5");

export const SESSION_PROGRAMMING_FIELD_LABEL = PLATFORM_SECTION_LABEL;

export const SESSION_PROGRAMMING_FIELD_CONTROL = "mt-1";

export const SESSION_PROGRAMMING_FIELD_HINT = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-0.5 text-[11px] leading-snug",
);

export const SESSION_PROGRAMMING_FIELD_ERROR = "mt-0.5 text-xs text-destructive";

/** Grid compacto «Datos de la sesión» — 3 filas lógicas en desktop (6 cols). */
export const SESSION_PROGRAMMING_SESSION_FIELDS_GRID = cn(
    "grid grid-cols-1 gap-x-4 gap-y-3",
    "sm:grid-cols-2 sm:gap-x-5",
    "lg:grid-cols-6 lg:gap-x-4 lg:gap-y-3",
);

export const SESSION_PROGRAMMING_FIELD_NAME = "sm:col-span-2 lg:col-span-3";

export const SESSION_PROGRAMMING_FIELD_NAME_SOLO = "sm:col-span-2 lg:col-span-6";

export const SESSION_PROGRAMMING_FIELD_PLAN = "sm:col-span-2 lg:col-span-3";

export const SESSION_PROGRAMMING_FIELD_COMPACT = "lg:col-span-2";

/** Par vol/int en la fila de duración: lg 2 (duración) + 4 (este bloque) = 6 cols. */
export const SESSION_PROGRAMMING_FIELD_LOAD_METERS = "sm:col-span-2 lg:col-span-4 min-w-0";

export const SESSION_PROGRAMMING_FIELDS_GRID_2 = "grid grid-cols-1 gap-4 sm:grid-cols-2";

/** Banner cliente seleccionado. */
export const SESSION_PROGRAMMING_CLIENT_BANNER = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative flex items-start gap-3 p-4 sm:p-5",
);

export const SESSION_PROGRAMMING_CLIENT_BANNER_TEXT = NEXIA_PORTAL_CARD_TITLE;

export const SESSION_PROGRAMMING_CLIENT_BANNER_SUBTITLE = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-0.5",
);

export const SESSION_PROGRAMMING_CLIENT_SELECTOR = cn(
    SESSION_PROGRAMMING_FORM_SECTION,
    "relative",
);

/** Zona inferior ancho completo (volumen, bloques, constructor, notas). */
export const SESSION_PROGRAMMING_LOWER_STACK = "space-y-5 sm:space-y-6";

export const SESSION_PROGRAMMING_NOTES_SECTION = cn(
    SESSION_PROGRAMMING_FORM_SECTION,
    "relative",
);

export const SESSION_PROGRAMMING_NOTES_DIVIDER = NEXIA_DIVIDER_SUBTLE;

/** Paneles compartidos (SessionPanelShell, TrainingBlockSelector, volumen, contexto día). */
export const SESSION_PROGRAMMING_PANEL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative overflow-hidden text-card-foreground",
);

/** Variante con acento lateral primary (contexto del día). */
export const SESSION_PROGRAMMING_PANEL_ACCENT = cn(
    SESSION_PROGRAMMING_PANEL,
    "border-l-2 border-l-primary/60",
);

export const SESSION_PROGRAMMING_PANEL_HEADER = cn(
    "border-b border-border/60 px-4 py-3.5 sm:px-5",
);

export const SESSION_PROGRAMMING_PANEL_TITLE = NEXIA_PORTAL_CARD_TITLE;

export const SESSION_PROGRAMMING_PANEL_SUBTITLE = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "text-xs leading-snug",
);

export const SESSION_PROGRAMMING_PANEL_BODY = "space-y-5 p-4 sm:p-5";

export const SESSION_PROGRAMMING_PANEL_TOGGLE = cn(
    "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5",
    "transition-colors hover:bg-surface/30",
    "min-h-touch sm:min-h-0",
);

/** Chips de bloques de entrenamiento. */
export function sessionProgrammingBlockChipClass(selected: boolean): string {
    return cn(
        "inline-flex min-h-touch items-center rounded-md border px-3 py-2 text-xs font-medium transition-all sm:min-h-0 sm:py-1.5",
        "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        selected
            ? "border-primary/40 bg-primary/12 text-primary shadow-[0_0_14px_-6px] shadow-primary/25"
            : "border-border/80 bg-surface/50 text-foreground hover:border-primary/40 hover:bg-primary/5",
    );
}

export const SESSION_PROGRAMMING_BLOCK_ADD_BTN = cn(
    "inline-flex min-h-touch items-center rounded-md border border-primary/30 bg-transparent px-3 text-xs font-medium text-primary transition-all sm:min-h-0 sm:h-7",
    "hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
);

/** Empty sidebar «Sin plan asignado». */
export const SESSION_PROGRAMMING_EMPTY_SIDEBAR = cn(
    ATHLETE_EMPTY_STATE_CARD_COMPACT,
    "relative flex h-full min-h-0 flex-1 flex-col justify-center border-dashed",
);

export const SESSION_PROGRAMMING_EMPTY_GLOW = ATHLETE_EMPTY_STATE_GLOW;

export const SESSION_PROGRAMMING_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const SESSION_PROGRAMMING_EMPTY_DESCRIPTION = ATHLETE_EMPTY_STATE_DESCRIPTION;

export const SESSION_PROGRAMMING_EMPTY_ACTION = ATHLETE_EMPTY_STATE_ACTION;

export const SESSION_PROGRAMMING_EMPTY_FOOTER = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "text-[11px]",
);

/**
 * Pie partido del constructor (alta y edición).
 * Altura: `h-9`, la del botón `size="sm"` de la plataforma. No usa
 * `PLATFORM_DASHBOARD_FOOTER_BTN` (`w-full min-h-touch`): con tres acciones
 * eso apilaba ~185 px por debajo de 640 y tapaba el constructor.
 * Por debajo de `sm` la plantilla va en su línea y Cancelar + commit en otra.
 * Desde `sm` cabe una fila; desde `md` no parte (`05_ACTION_HIERARCHY` §2.3.1 B).
 */
const SESSION_PROGRAMMING_FOOTER_CONTROL = "h-9 min-h-9 w-auto max-w-full";

/** Footer fijo — responsive mobile / tablet / desktop. */
export const SESSION_PROGRAMMING_FOOTER_SHELL = cn(
    "border-border/80 bg-background/90 backdrop-blur-md",
);

export const SESSION_PROGRAMMING_FOOTER_ROW = cn(
    "flex w-full min-w-0 max-w-full flex-row flex-wrap items-center justify-between gap-2 md:flex-nowrap md:gap-3",
);

export const SESSION_PROGRAMMING_FOOTER_ACTIONS = cn(
    "flex min-w-0 w-full flex-row flex-nowrap items-center justify-end gap-2 sm:w-auto md:shrink-0",
    "[&_button]:h-9 [&_button]:min-h-9 [&_button]:w-auto [&_button]:min-w-[5.5rem] [&_button]:flex-1 sm:[&_button]:min-w-0 sm:[&_button]:flex-none",
);

export const SESSION_PROGRAMMING_FOOTER_PRIMARY = SESSION_PROGRAMMING_FOOTER_CONTROL;

/** Secundaria premium (marco cyan): `Button variant="outline-primary"` — plantilla, revisar alineación. §05_ACTION_HIERARCHY §2.3.1 B */
export const SESSION_PROGRAMMING_FOOTER_SECONDARY = cn(
    SESSION_PROGRAMMING_FOOTER_CONTROL,
    "basis-full sm:basis-auto",
);

export const SESSION_PROGRAMMING_FOOTER_CANCEL = SESSION_PROGRAMMING_FOOTER_CONTROL;

/** Hero «Hoy toca» — cabecera métricas (compacta, tablet-first). */
export const SESSION_PROGRAMMING_DAY_HERO_HEADER = cn(
    "border-b border-border/60 bg-surface/20 px-3 py-2.5 sm:px-4 md:py-3",
);

export const SESSION_PROGRAMMING_DAY_METRICS_BOX = cn(
    "inline-flex shrink-0 items-center gap-2.5 rounded-lg border border-border/70 bg-card/40 px-2.5 py-1.5 backdrop-blur-sm sm:gap-3 sm:px-3",
);

export const SESSION_PROGRAMMING_DAY_BODY_COMPACT = "space-y-3 p-3 sm:p-4";

/** Grid contexto día: patrones + músculos | prioridad (mix). */
export const SESSION_PROGRAMMING_DAY_CONTEXT_GRID = cn(
    "grid grid-cols-1 gap-3 min-w-0",
    "md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-4",
    "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,0.95fr)] lg:gap-3 xl:gap-4",
);

/** H4 — notas de volumen (lo que no cuenta o falta). Avisos: `Alert`; informativas: línea meta. */
export const SESSION_PROGRAMMING_VOLUME_NOTES = "space-y-2";

export const SESSION_PROGRAMMING_VOLUME_NOTE_ALERT = "text-xs";

export const SESSION_PROGRAMMING_VOLUME_NOTE_INFO = cn(
    "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
);

export const SESSION_PROGRAMMING_VOLUME_NOTE_INFO_ICON = "mt-0.5 h-3.5 w-3.5 shrink-0";
