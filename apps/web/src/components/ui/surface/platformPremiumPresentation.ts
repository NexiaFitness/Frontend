/**
 * platformPremiumPresentation.ts — Tokens premium compartidos (admin/trainer + base plataforma).
 *
 * Doc: design/00_LEEME_PRIMERO.md · design/platform/01_PREMIUM_MIGRATION.md
 * Glass: glassSurfacePresentation.ts · Atleta F3b: design/atleta/run-y-diseno/F3b_PREMIUM_DESIGN_SYSTEM.md
 * Registro: design/platform/04_REGISTRY_CODIGO_FUENTE.md
 */

import { cn } from "@/lib/utils";

export { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "./glassSurfacePresentation";

/** Contenedor página detalle / formulario ancho completo. */
export const PLATFORM_PAGE_SHELL = "w-full pb-10";

/** Fila título izquierda + acción ghost derecha (Volver, etc.). */
export const PLATFORM_PAGE_HEADER = cn(
    "mb-5 flex flex-col gap-3",
    "sm:flex-row sm:items-start sm:justify-between sm:gap-4"
);

export const PLATFORM_PAGE_TITLE_WRAP = "min-w-0 flex-1";

export const PLATFORM_BACK_BUTTON = "shrink-0 self-end sm:self-start";

/** Etiquetas de campo / sección (uppercase metadata). */
export const PLATFORM_SECTION_LABEL =
    "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export const PLATFORM_FIELD_VALUE = "mt-1 text-sm font-medium text-foreground";

export const PLATFORM_BODY_MUTED = "mt-2 text-sm leading-relaxed text-muted-foreground";

export const PLATFORM_BODY_MUTED_PRESERVE =
    "mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground";

/** Estados transversales. */
export const PLATFORM_LOADING_ROW = "flex items-center justify-center py-16";

export const PLATFORM_LOADING_TEXT = "ml-4 text-muted-foreground";

export const PLATFORM_ERROR_ACTION = "mt-4";

export const PLATFORM_ALERT_SPACING = "mb-4";

/** Badges metadata neutros. */
export const PLATFORM_BADGE_NEUTRAL = "border-border/80 text-[11px] font-medium";

export const PLATFORM_BADGE_MUTED = cn(
    PLATFORM_BADGE_NEUTRAL,
    "text-muted-foreground"
);

export const PLATFORM_BADGE_ROW = "flex flex-wrap gap-2";

export const PLATFORM_CHIP =
    "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground";

export const PLATFORM_EQUIP_CHIP =
    "inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary";

export const PLATFORM_SPEC_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2";

export const PLATFORM_CARD_BODY = "space-y-6 px-4 pb-6 pt-5 sm:px-6 sm:pb-8";

export const PLATFORM_ALT_DIVIDER = "border-t border-border pt-6";

export const PLATFORM_ALT_ITEM = cn(
    "rounded-lg border border-border bg-surface/80 p-3 transition-colors",
    "hover:border-primary/25 hover:bg-surface-2/60"
);

export const PLATFORM_LINK_PRIMARY = cn(
    "inline-flex items-center gap-2 text-sm font-medium text-primary",
    "underline-offset-4 hover:underline"
);

export const PLATFORM_ICON_SM = "h-4 w-4 shrink-0";

export const PLATFORM_ICON_XS = "h-3.5 w-3.5";

export const PLATFORM_ICON_BACK_GAP = "mr-2";

export const PLATFORM_LINK_CENTERED = cn(PLATFORM_LINK_PRIMARY, "mt-3 justify-center");

export const PLATFORM_VIDEO_HERO = cn(
    "relative overflow-hidden rounded-t-xl border-b border-border/60",
    "bg-surface-2/40 px-4 py-8 text-center sm:px-6"
);

export const PLATFORM_GRID_SPAN_FULL = "sm:col-span-2";

export const PLATFORM_CHIP_ROW = "mt-2 flex flex-wrap gap-2";
