/**
 * authFormPresentation.ts — Tokens visuales auth móvil (< lg).
 * Alineado con DESIGN_MOBILE §6.7 glass + portal atleta premium.
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_GLASS_CARD,
    NEXIA_GLASS_CARD_DESKTOP,
} from "@/components/ui/surface/glassSurfacePresentation";

/** Inputs táctiles en móvil (44px). Desktop mantiene h-9. */
export const AUTH_INPUT_MOBILE = cn(
    "max-lg:min-h-touch max-lg:rounded-lg max-lg:px-4 max-lg:text-base",
    "max-lg:border-border/70 max-lg:bg-background/80 max-lg:backdrop-blur-sm"
);

/** Select táctil en móvil. */
export const AUTH_SELECT_MOBILE = cn(
    "max-lg:min-h-touch max-lg:rounded-lg max-lg:px-4 max-lg:text-base",
    "max-lg:border-border/70 max-lg:bg-background/80 max-lg:backdrop-blur-sm"
);

/** CTA principal auth en móvil. */
export const AUTH_SUBMIT_MOBILE = cn(
    "max-lg:min-h-touch-athlete max-lg:text-base max-lg:font-semibold",
    "max-lg:shadow-[0_8px_28px_-10px] max-lg:shadow-primary/35",
    "motion-safe:max-lg:active:scale-[0.98] motion-reduce:max-lg:active:scale-100"
);

/** Enlace secundario — sin subrayado pesado en móvil. */
export const AUTH_LINK =
    "text-sm font-medium text-primary transition-colors hover:text-primary/80 max-lg:no-underline lg:underline lg:underline-offset-4";

export const AUTH_LINK_MUTED = "text-sm text-muted-foreground";

/** Card contenedor auth (mobile). */
export const AUTH_CARD_MOBILE = NEXIA_GLASS_CARD;

/** Card desktop — mantiene look plataforma previo. */
export const AUTH_CARD_DESKTOP = NEXIA_GLASS_CARD_DESKTOP;
