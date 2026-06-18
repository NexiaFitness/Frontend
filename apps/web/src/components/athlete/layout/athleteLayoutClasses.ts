/**
 * athleteLayoutClasses.ts — Tokens de layout portal atleta (mobile-first).
 * @see docs/audits/portal-atleta/DESIGN_MOBILE_FIRST_ATLETA.md §2, §7
 */

import { cn } from "@/lib/utils";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";

/** Barra fija móvil (bottom nav, sticky CTA) — paridad NavbarShell. */
export const ATHLETE_CHROME_BAR = cn(
    "relative",
    "bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72",
    "shadow-[0_-10px_36px_-18px] shadow-black/45",
    "ring-1 ring-inset ring-primary/10"
);

export const ATHLETE_CHROME_BAR_TOP_DIVIDER = cn(
    "pointer-events-none absolute inset-x-0 top-0 z-10 px-3",
    NEXIA_DIVIDER_GLOW
);

/** Padding horizontal estándar atleta. */
export const ATHLETE_PAGE_X = "px-4 lg:px-8";

/** Solo bottom nav (h-16) + safe area. */
export const ATHLETE_PAGE_BOTTOM_NAV = "pb-24 lg:pb-8";

/** Contenedor de página sin CTA sticky. */
export const ATHLETE_PAGE = `${ATHLETE_PAGE_X} pt-4 ${ATHLETE_PAGE_BOTTOM_NAV}`;

export type AthleteStickyFooterSize = "single" | "double" | "withSecondaryLink";

/**
 * Padding inferior del scroll cuando hay CTA sticky + bottom nav (móvil).
 * 4rem nav + ~5.5rem barra CTA + 2rem aire — clases estáticas (Tailwind JIT).
 */
export const ATHLETE_STICKY_FOOTER_CONTENT_PB =
    "pb-[calc(4rem+5.5rem+2rem+env(safe-area-inset-bottom))] lg:pb-8";

/** Reserva min-height en flex (preview/feedback); clases estáticas. */
export const ATHLETE_STICKY_FOOTER_SPACER: Record<AthleteStickyFooterSize, string> = {
    single: "min-h-[calc(4rem+5.5rem+2rem+env(safe-area-inset-bottom))] lg:min-h-0",
    double: "min-h-[calc(4rem+8.75rem+2rem+env(safe-area-inset-bottom))] lg:min-h-0",
    withSecondaryLink:
        "min-h-[calc(4rem+9.25rem+2rem+env(safe-area-inset-bottom))] lg:min-h-0",
};

export const ATHLETE_STICKY_FOOTER_BAR = cn(
    ATHLETE_CHROME_BAR,
    "fixed inset-x-0 bottom-16 z-30 space-y-2 p-4",
    "lg:static lg:mt-8 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0 lg:backdrop-blur-none"
);
