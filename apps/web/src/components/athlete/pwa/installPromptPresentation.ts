/**
 * installPromptPresentation.ts — Tokens UI funnel PWA atleta.
 * DESIGN_MOBILE §3.5 + paridad BottomSheet / ATHLETE_CHROME_BAR.
 */

import { cn } from "@/lib/utils";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_CHROME_BAR,
    ATHLETE_CHROME_BAR_TOP_DIVIDER,
} from "@/components/athlete/layout/athleteLayoutClasses";
import {
    NEXIA_DIVIDER_GLOW,
    NEXIA_DIVIDER_GLOW_BAND,
} from "@/components/ui/surface/nexiaDividerPresentation";

export const INSTALL_PROMPT_TITLE = "Añade NEXIA a tu pantalla de inicio";
export const INSTALL_PROMPT_SUBTITLE = "Accede más rápido y entrena sin distracciones.";
export const INSTALL_PROMPT_CHIP_LABEL = "Instala NEXIA para acceder más rápido";

const SHEET_MOTION =
    "animate-in slide-in-from-bottom fade-in duration-300 motion-reduce:animate-none [animation-timing-function:cubic-bezier(0.32,0.72,0,1)]";

const BACKDROP_MOTION =
    "animate-in fade-in duration-300 motion-reduce:animate-none";

export const INSTALL_PROMPT_BACKDROP = cn(
    "fixed inset-0 z-[55] bg-black/65 backdrop-blur-[3px]",
    BACKDROP_MOTION
);

export const INSTALL_PROMPT_SHEET_PANEL = cn(
    "fixed inset-x-0 bottom-0 z-[60] flex max-h-[88vh] flex-col",
    "rounded-t-[1.35rem] border-t border-border/70",
    "bg-gradient-to-b from-card/98 via-card/94 to-background/95 backdrop-blur-xl",
    "shadow-[0_-20px_60px_-16px] shadow-black/55",
    SHEET_MOTION
);

export const INSTALL_PROMPT_SHEET_SAFE_PB =
    "pb-[calc(1.25rem+env(safe-area-inset-bottom))]";

export const INSTALL_PROMPT_SHEET_GLOW_BAND = NEXIA_DIVIDER_GLOW_BAND;
export const INSTALL_PROMPT_SHEET_GLOW_LINE = NEXIA_DIVIDER_GLOW;

export const INSTALL_PROMPT_PRIMARY_CTA = ATHLETE_PRIMARY_CTA;

export const INSTALL_PROMPT_IOS_STEP = cn(
    "flex items-start gap-3 rounded-xl border border-border/60 bg-surface-2/40 p-3"
);

export const INSTALL_PROMPT_IOS_STEP_ICON = cn(
    "flex size-9 shrink-0 items-center justify-center rounded-lg",
    "border border-primary/30 bg-primary/12 text-primary"
);

export const INSTALL_PROMPT_IOS_BOUNCE_ARROW = cn(
    "mx-auto mb-2 flex size-8 items-center justify-center rounded-full",
    "border border-primary/25 bg-primary/10 text-primary",
    "motion-safe:animate-bounce motion-reduce:animate-none"
);

export const INSTALL_PROMPT_ANDROID_ICON = cn(
    "mx-auto size-16 rounded-2xl border border-primary/25 shadow-lg shadow-primary/20"
);

export const INSTALL_PROMPT_CHIP_BASE = cn(
    ATHLETE_CHROME_BAR,
    "fixed inset-x-0 z-30 flex h-11 cursor-pointer items-center justify-center gap-2 px-4",
    "text-caption font-medium text-foreground/90 transition-colors",
    "motion-safe:active:opacity-90 motion-reduce:active:opacity-100"
);

export const INSTALL_PROMPT_CHIP_DASHBOARD = cn(
    INSTALL_PROMPT_CHIP_BASE,
    "bottom-16"
);

export const INSTALL_PROMPT_CHIP_LANDING = cn(
    INSTALL_PROMPT_CHIP_BASE,
    "bottom-0 pb-[env(safe-area-inset-bottom)]"
);

export const INSTALL_PROMPT_CHIP_TOP_DIVIDER = ATHLETE_CHROME_BAR_TOP_DIVIDER;
