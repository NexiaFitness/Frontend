/**
 * athleteLayoutClasses.ts — Tokens de layout portal atleta (mobile-first).
 * @see docs/audits/portal-atleta/DESIGN_MOBILE_FIRST_ATLETA.md §2, §7
 */

/** Padding horizontal estándar atleta. */
export const ATHLETE_PAGE_X = "px-4 lg:px-8";

/** Solo bottom nav (h-16) + safe area. */
export const ATHLETE_PAGE_BOTTOM_NAV = "pb-24 lg:pb-8";

/** Contenedor de página sin CTA sticky. */
export const ATHLETE_PAGE = `${ATHLETE_PAGE_X} pt-4 ${ATHLETE_PAGE_BOTTOM_NAV}`;

export type AthleteStickyFooterSize = "single" | "double" | "withSecondaryLink";

/** Reserva espacio bajo el scroll para bottom nav + barra fija (solo móvil). */
export const ATHLETE_STICKY_FOOTER_SPACER: Record<AthleteStickyFooterSize, string> = {
    /** nav (4rem) + p-4 + 1× touch-athlete (3rem) + margen */
    single: "min-h-[calc(4rem+5.5rem+env(safe-area-inset-bottom))]",
    /** nav + p-4 + 2× touch-athlete + gap-2 */
    double: "min-h-[calc(4rem+8.75rem+env(safe-area-inset-bottom))]",
    /** nav + p-4 + CTA + enlace secundario */
    withSecondaryLink: "min-h-[calc(4rem+9.25rem+env(safe-area-inset-bottom))]",
};

export const ATHLETE_STICKY_FOOTER_BAR =
    "fixed inset-x-0 bottom-16 z-30 space-y-2 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0";
