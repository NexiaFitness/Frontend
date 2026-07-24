/**
 * platformPremiumPresentation.ts — Tokens premium compartidos (atleta + entrenador + admin).
 *
 * Regla canónica: el portal atleta define el techo visual; trainer y admin importan
 * estos tokens (glass, segmented, PLATFORM_*) — no un design system paralelo.
 *
 * Doc: design/00_LEEME_PRIMERO.md · design/platform/01_PREMIUM_MIGRATION.md
 * Glass: glassSurfacePresentation.ts · Atleta F3b: design/atleta/run-y-diseno/F3b_PREMIUM_DESIGN_SYSTEM.md
 * Registro: design/platform/04_REGISTRY_CODIGO_FUENTE.md
 */

import { cn } from "@/lib/utils";

export { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "./glassSurfacePresentation";

/** Contenedor página detalle / formulario ancho completo. */
export const PLATFORM_PAGE_SHELL = "w-full pb-10";

/**
 * Reserva inferior cuando la vista usa `<DashboardFixedFooter />`.
 * Evita que el contenido scroll quede pegado a la barra fija (~64–72px + aire).
 * Doc: design/platform/specs-vista/DASHBOARD_CONTENT_SPACING_SPEC.md §11
 * Código: frontend/apps/web/src/lib/dashboardScroll.ts (`DASHBOARD_FIXED_FOOTER_PADDING_CLASS`)
 */
export const PLATFORM_PAGE_FOOTER_CLEARANCE = "pb-24";

/** Shell ancho completo + clearance footer fijo (sustituye `pb-10` de PLATFORM_PAGE_SHELL). */
export const PLATFORM_PAGE_WITH_FIXED_FOOTER = cn("w-full", PLATFORM_PAGE_FOOTER_CLEARANCE);

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

/**
 * Barra segmentada premium — tabs, filtros in-page y conmutadores (TabsBar).
 * Origen visual: V02 Mis sesiones atleta; reutilizado en ficha cliente trainer y admin.
 *
 * Estructura: shell (borde/glass) → scroll (overflow + gutter scrollbar) → track (flex).
 */
export const NEXIA_SEGMENTED_SHELL = cn(
    "rounded-lg border border-border/60 bg-background/30 p-1 backdrop-blur-sm"
);

/** Área scroll horizontal; pb reserva hueco entre ítems y thumb (móvil). */
export const NEXIA_SEGMENTED_SCROLL = cn(
    "overflow-x-auto pb-1.5 scrollbar-nexia",
    "[&::-webkit-scrollbar]:h-1.5"
);

/** Ítems repartidos a ancho completo (filtros 4 col, conmutador 2 col). */
export const NEXIA_SEGMENTED_TRACK_EQUAL = "flex w-full min-w-0 gap-1";

/** Ítems al ancho del contenido; scroll horizontal (ficha cliente 7 tabs). */
export const NEXIA_SEGMENTED_TRACK_CONTENT = "flex w-max min-w-full gap-1";

export const NEXIA_SEGMENTED_ITEM = cn(
    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md",
    "border border-transparent px-2.5 py-2 text-xs font-medium leading-snug whitespace-nowrap",
    "min-w-[4.25rem] transition-all duration-150",
    "motion-safe:active:scale-[0.98] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const NEXIA_SEGMENTED_ITEM_EQUAL = "min-w-0 flex-1 shrink-0";

export const NEXIA_SEGMENTED_ITEM_CONTENT = "shrink-0";

export const NEXIA_SEGMENTED_ITEM_SELECTED = cn(
    "border-primary/30 bg-primary/20 text-primary",
    "shadow-[0_0_14px_-6px] shadow-primary/30"
);

export const NEXIA_SEGMENTED_ITEM_IDLE = cn(
    "text-muted-foreground/80 hover:bg-surface/40 hover:text-foreground"
);

export type NexiaSegmentedDistribute = "equal" | "content";

export function nexiaSegmentedTrackClass(distribute: NexiaSegmentedDistribute): string {
    return distribute === "equal"
        ? NEXIA_SEGMENTED_TRACK_EQUAL
        : NEXIA_SEGMENTED_TRACK_CONTENT;
}

export function nexiaSegmentedItemClass(
    isSelected: boolean,
    distribute: NexiaSegmentedDistribute = "content"
): string {
    return cn(
        NEXIA_SEGMENTED_ITEM,
        distribute === "equal" ? NEXIA_SEGMENTED_ITEM_EQUAL : NEXIA_SEGMENTED_ITEM_CONTENT,
        isSelected ? NEXIA_SEGMENTED_ITEM_SELECTED : NEXIA_SEGMENTED_ITEM_IDLE
    );
}
