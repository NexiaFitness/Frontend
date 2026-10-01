/**
 * pwaUpdateBannerPresentation.ts — Tokens del banner de nueva versión PWA.
 * Paridad glass con installPromptPresentation y DESIGN_PREMIUM.
 * @author Frontend Team
 * @since v5.x
 */

import { cn } from "@/lib/utils";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";

export const PWA_UPDATE_BANNER_MESSAGE = "Hay una versión nueva de NEXIA";
export const PWA_UPDATE_BANNER_UPDATE_LABEL = "Actualizar";
export const PWA_UPDATE_BANNER_LATER_LABEL = "Más tarde";
export const PWA_UPDATE_BANNER_ARIA_LABEL = "Actualización de la aplicación disponible";

export const PWA_UPDATE_BANNER_REGION = cn(
  "fixed inset-x-0 z-[70] mx-auto max-w-lg px-4",
  "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-6"
);

export const PWA_UPDATE_BANNER_PANEL = cn(
  "flex flex-col gap-3 rounded-2xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between",
  "bg-gradient-to-b from-card/98 via-card/94 to-background/95 backdrop-blur-xl",
  "shadow-[0_12px_40px_-12px] shadow-black/45"
);

export const PWA_UPDATE_BANNER_TEXT = cn(
  "text-sm font-medium leading-snug text-foreground",
  "sm:max-w-[14rem] lg:max-w-none"
);

export const PWA_UPDATE_BANNER_ACTIONS = cn("flex shrink-0 gap-2 sm:justify-end");

export const PWA_UPDATE_BANNER_PRIMARY = ATHLETE_PRIMARY_CTA;

export const PWA_UPDATE_BANNER_SECONDARY = cn(
  "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium",
  "border border-border/70 bg-surface/30 text-muted-foreground",
  "transition-colors hover:bg-surface/50 hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);
