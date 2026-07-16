/**
 * exerciseDetailPresentation.ts — Tokens UI detalle de ejercicio.
 *
 * Doc: docs/design/00_LEEME_PRIMERO.md
 * Shared: platformPremiumPresentation.ts
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";

export {
    PLATFORM_PAGE_HEADER as EXERCISE_DETAIL_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as EXERCISE_DETAIL_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as EXERCISE_DETAIL_BACK_BUTTON,
    PLATFORM_SECTION_LABEL as EXERCISE_DETAIL_SPEC_LABEL,
    PLATFORM_FIELD_VALUE as EXERCISE_DETAIL_SPEC_VALUE,
    PLATFORM_BODY_MUTED as EXERCISE_DETAIL_BODY_MUTED,
    PLATFORM_BODY_MUTED_PRESERVE as EXERCISE_DETAIL_BODY_MUTED_PRESERVE,
    PLATFORM_LOADING_ROW as EXERCISE_DETAIL_LOADING_ROW,
    PLATFORM_LOADING_TEXT as EXERCISE_DETAIL_LOADING_TEXT,
    PLATFORM_ERROR_ACTION as EXERCISE_DETAIL_ERROR_ACTION,
    PLATFORM_ALERT_SPACING as EXERCISE_DETAIL_ALERT_SPACING,
    PLATFORM_BADGE_NEUTRAL as EXERCISE_DETAIL_BADGE_NEUTRAL,
    PLATFORM_BADGE_MUTED as EXERCISE_DETAIL_BADGE_MUTED,
    PLATFORM_BADGE_ROW as EXERCISE_DETAIL_BADGE_ROW,
    PLATFORM_CHIP as EXERCISE_DETAIL_CHIP,
    PLATFORM_EQUIP_CHIP as EXERCISE_DETAIL_EQUIP_CHIP,
    PLATFORM_CARD_BODY as EXERCISE_DETAIL_BODY,
    PLATFORM_ALT_DIVIDER as EXERCISE_DETAIL_ALT_DIVIDER,
    PLATFORM_LINK_PRIMARY as EXERCISE_DETAIL_VIDEO_LINK,
    PLATFORM_VIDEO_HERO as EXERCISE_DETAIL_VIDEO_HERO,
    PLATFORM_CHIP_ROW as EXERCISE_DETAIL_CHIP_ROW,
    PLATFORM_LINK_CENTERED as EXERCISE_DETAIL_VIDEO_LINK_CENTERED,
    PLATFORM_ICON_SM as EXERCISE_DETAIL_ICON_SM,
    PLATFORM_ICON_XS as EXERCISE_DETAIL_ICON_XS,
    PLATFORM_ICON_BACK_GAP as EXERCISE_DETAIL_ICON_BACK_GAP,
} from "@/components/ui/surface/platformPremiumPresentation";

export const EXERCISE_MEDIA_EMPTY_COPY = {
    imageSrc: "/assets/empty_state.png",
    imageAlt: "Mancuernas en el suelo del gimnasio",
    title: "¡A entrenar con memoria!",
    description:
        "Aún no hay contenido visual para este ejercicio, pero estamos seguros de que ya conoces la técnica. ¡Tú puedes con esto!",
} as const;

export const EXERCISE_DETAIL_SECTION_LABELS = {
    primaryMuscle: "Músculos objetivo",
    secondaryMuscles: "Músculos secundarios",
    level: "Nivel",
    movementPattern: "Patrón de movimiento",
    equipment: "Equipamiento",
    description: "Descripción",
    instructions: "Instrucciones",
    notes: "Notas",
    video: "Video",
    alternatives: "Alternativas",
    manualAlternatives: "Definidas manualmente",
    suggestedAlternatives: "Sugerencias automáticas",
    loadType: "Tipo de carga",
    laterality: "Lateralidad",
    jointActions: "Acciones articulares",
    tags: "Etiquetas",
    mechanicalLoad: "Carga mecánica",
    axialLoad: "Carga axial",
    stimulusType: "Tipo de estímulo",
    catalogBiomechanics: "Biomecánica del catálogo",
    catalogPlanning: "Planificación y motor",
    advancedPlanning: "Planificación avanzada",
    exerciseContent: "Contenido del ejercicio",
} as const;

/** Página: ancho completo del main dashboard (sin max-w centrado en desktop). */
export const EXERCISE_DETAIL_PAGE = cn(
    "w-full max-w-none pb-10 lg:pb-12"
);

export const EXERCISE_DETAIL_SHELL = cn(
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
    "relative w-full pt-5"
);

/** Grid metadata: 1 col móvil → 2 tablet → 3 desktop (usa canvas completo). */
export const EXERCISE_DETAIL_SPEC_GRID = cn(
    "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
);

export const EXERCISE_DETAIL_SECTION_BLOCK = "space-y-6";

export const EXERCISE_DETAIL_SECTION_HEADING = cn(
    "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
    "border-b border-border/60 pb-2"
);

export const EXERCISE_DETAIL_EMPTY_VALUE = "text-sm text-muted-foreground italic";

export const EXERCISE_DETAIL_TAG_CHIP = cn(
    "inline-flex items-center rounded-full border border-border/80 bg-muted/60",
    "px-2.5 py-0.5 text-xs font-medium text-foreground"
);

export const EXERCISE_DETAIL_JOINT_CHIP = cn(
    "inline-flex items-center rounded-full bg-surface-2/80 px-2.5 py-1",
    "text-xs font-medium text-foreground"
);

export const EXERCISE_DETAIL_GRID_SPAN_FULL = "sm:col-span-2 lg:col-span-3";

export const EXERCISE_DETAIL_MEDIA_FRAME = cn(
    "relative w-full overflow-hidden",
    "aspect-[4/3] max-h-[min(56vh,440px)]",
    "sm:aspect-[16/9] sm:max-h-[min(48vh,520px)]",
    "lg:aspect-[21/9] lg:max-h-[min(52vh,560px)]"
);

export const EXERCISE_DETAIL_MEDIA_IMAGE =
    "absolute inset-0 h-full w-full object-cover object-center";

export const EXERCISE_DETAIL_MEDIA_OVERLAY = cn(
    "absolute inset-0",
    "bg-gradient-to-t from-background via-background/75 to-background/25"
);

export const EXERCISE_DETAIL_MEDIA_CONTENT = cn(
    "absolute inset-0 flex flex-col items-center justify-center px-6 py-8 text-center",
    "sm:px-10"
);

export const EXERCISE_DETAIL_MEDIA_TITLE =
    "text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl";

export const EXERCISE_DETAIL_MEDIA_DESCRIPTION = cn(
    "mt-3 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground",
    "sm:max-w-md sm:text-[15px] sm:leading-6"
);

export const EXERCISE_DETAIL_MUSCLE_BADGE = cn(
    "border-0 px-2 py-0.5 text-[11px] font-medium"
);

export const EXERCISE_DETAIL_LEVEL_BADGE = "border-0 text-[11px] font-medium";

export const EXERCISE_DETAIL_COMPLEX_TYPE_BADGE = cn(
    "border-[hsl(var(--warning))]/40 text-[11px] font-medium text-[hsl(var(--warning))]"
);

export const EXERCISE_DETAIL_ERROR_DETAIL = "mt-2 text-sm";

export const EXERCISE_DETAIL_ALT_SUBHEADING = "text-xs font-medium text-muted-foreground";

export const EXERCISE_DETAIL_ALT_ITEM = cn(
    "rounded-lg border border-border/50 bg-card/30 p-3.5 transition-colors",
    "hover:border-primary/20 hover:bg-surface-2/50"
);

export const EXERCISE_DETAIL_ALT_ITEM_TITLE = "text-sm font-medium text-foreground";

export const EXERCISE_DETAIL_ALT_BLOCK = "mt-4";

export const EXERCISE_DETAIL_ALT_LIST = "mt-2 space-y-2";

export const EXERCISE_DETAIL_ALT_EMPTY = "mt-2 text-sm text-muted-foreground";

export const EXERCISE_DETAIL_ALT_REASON = "mt-1 text-xs text-primary/90";

export const EXERCISE_DETAIL_ALT_META = "mt-1 text-xs text-muted-foreground";

export const EXERCISE_DETAIL_ALT_SECTION_GAP = "mt-5";

export const EXERCISE_DETAIL_ALT_LOADING = "flex justify-center py-6";

/** Separador sutil entre badges y metadata. */
export const EXERCISE_DETAIL_META_DIVIDER = "border-t border-border/40 pt-5";

/**
 * Strip horizontal de metadata — ancho completo, inspirado en SessionContextStrip.
 * Móvil: zonas apiladas · Desktop: hasta 3 columnas (equipo+etiquetas · biomecánica · músculos secundarios).
 */
export const EXERCISE_DETAIL_METADATA_STRIP = cn(
    "flex flex-col gap-6",
    "md:flex-row md:items-stretch md:gap-0"
);

export const EXERCISE_DETAIL_METADATA_ZONE = cn(
    "flex min-w-0 flex-1 flex-col gap-2.5",
    "md:px-6 md:first:pl-0 md:last:pr-0"
);

export const EXERCISE_DETAIL_METADATA_ZONE_HEADER = "flex items-center gap-2";

export const EXERCISE_DETAIL_METADATA_ZONE_ICON =
    "h-3.5 w-3.5 shrink-0 text-primary/75";

export const EXERCISE_DETAIL_METADATA_ZONE_LABEL =
    "text-xs font-medium text-muted-foreground";

/** Sublabel dentro de una zona (p. ej. etiquetas bajo equipamiento). */
export const EXERCISE_DETAIL_METADATA_SUBLABEL =
    "text-[11px] font-medium text-muted-foreground/90";

export const EXERCISE_DETAIL_METADATA_ZONE_BODY = "flex min-w-0 flex-col gap-2";

export const EXERCISE_DETAIL_METADATA_DIVIDER = cn(
    "hidden md:block w-px shrink-0 self-stretch bg-border/50"
);

export const EXERCISE_DETAIL_METADATA_VALUE =
    "text-sm font-medium leading-snug text-foreground";

export const EXERCISE_DETAIL_METADATA_VALUE_MUTED =
    "text-sm leading-snug text-muted-foreground";

export const EXERCISE_DETAIL_METADATA_CHIP_ROW = "flex flex-wrap gap-1.5";

export const EXERCISE_DETAIL_METADATA_EQUIP_CHIP = cn(
    "inline-flex items-center rounded-md border border-primary/25 bg-primary/8",
    "px-2.5 py-1 text-xs font-medium text-primary",
    "shadow-[0_0_14px_-6px] shadow-primary/30"
);

export const EXERCISE_DETAIL_METADATA_CHIP = cn(
    "inline-flex items-center rounded-md border border-border/60 bg-surface-2/70",
    "px-2.5 py-1 text-xs font-medium text-foreground"
);

export const EXERCISE_DETAIL_METADATA_CHIP_MUTED = cn(
    "inline-flex items-center rounded-md bg-muted/40",
    "px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
);

export const EXERCISE_DETAIL_METADATA_ROLE_BADGE = cn(
    "ml-1.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium",
    "bg-muted/50 text-muted-foreground"
);

/** Layout bajo metadata: alternativas + planificación. */
export const EXERCISE_DETAIL_LAYOUT = cn(
    "mt-6 grid grid-cols-1 gap-5",
    "lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-6"
);

export const EXERCISE_DETAIL_MAIN_COLUMN = "min-w-0 space-y-6";

/** Sidebar sticky en desktop — alternativas siempre accesibles al hacer scroll. */
export const EXERCISE_DETAIL_SIDE_COLUMN = cn(
    "min-w-0 space-y-5",
    "lg:sticky lg:top-4 lg:self-start"
);

/** Panel interior premium (essentials) — glass secundario sobre card principal. */
export const EXERCISE_DETAIL_ESSENTIALS_PANEL = cn(
    "rounded-lg border border-border/70 bg-surface/50 p-4",
    "sm:p-5 lg:bg-surface/60"
);

export const EXERCISE_DETAIL_ESSENTIALS_GRID = cn(
    "mt-4 grid grid-cols-1 gap-5",
    "sm:grid-cols-2"
);

export const EXERCISE_DETAIL_ESSENTIALS_SPAN_FULL = "sm:col-span-2";

export const EXERCISE_DETAIL_ESSENTIALS_BLOCK = "min-w-0 space-y-2";

/** Sección colapsable premium (planificación / contenido). */
export const EXERCISE_DETAIL_COLLAPSIBLE = cn(
    "rounded-xl border border-border/50 bg-surface/20",
    "overflow-hidden transition-colors",
    "hover:border-border/70"
);

export const EXERCISE_DETAIL_COLLAPSIBLE_TRIGGER = cn(
    "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left",
    "sm:px-5"
);

export const EXERCISE_DETAIL_COLLAPSIBLE_TITLE = "text-sm font-semibold text-foreground";

export const EXERCISE_DETAIL_COLLAPSIBLE_BADGE = cn(
    "shrink-0 rounded-md border border-border/80 bg-muted/40",
    "px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
);

export const EXERCISE_DETAIL_COLLAPSIBLE_CHEVRON = cn(
    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
);

export const EXERCISE_DETAIL_COLLAPSIBLE_BODY = cn(
    "border-t border-border/50 px-4 pb-4 pt-4",
    "sm:px-5 sm:pb-5"
);

export const EXERCISE_DETAIL_SIDE_CARD = cn(
    "rounded-xl border border-border/60 bg-surface/30 p-4",
    "sm:p-5"
);

export const EXERCISE_DETAIL_SIDE_SECTION_TITLE = "text-sm font-semibold text-foreground";
