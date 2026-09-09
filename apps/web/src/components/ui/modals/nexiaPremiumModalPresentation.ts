/**
 * nexiaPremiumModalPresentation.ts — Shell modal premium NEXIA (negro intenso + rim cyan).
 *
 * Referencia canónica: BlockPatternPickerSheet (wizard D-PAP patrones).
 * Migración prevista: sustituir BaseModal en flujos entrenador/admin premium.
 *
 * Doc: DESIGN_PREMIUM.md §4.1 · §5 · §6
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_PORTAL_CARD_DESCRIPTION,
    NEXIA_PORTAL_CARD_TITLE,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NEXIA_DIVIDER_GLOW } from "@/components/ui/surface/nexiaDividerPresentation";

export type NexiaPremiumModalMaxWidth = "lg" | "xl" | "2xl" | "3xl";

const NEXIA_PREMIUM_MODAL_MAX_WIDTH_CLASS: Record<
    NexiaPremiumModalMaxWidth,
    string
> = {
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
};

export function nexiaPremiumModalShellClass(
    maxWidth: NexiaPremiumModalMaxWidth = "2xl",
): string {
    return cn(
        "relative flex w-full flex-col overflow-hidden",
        "max-h-[min(92vh,44rem)]",
        NEXIA_PREMIUM_MODAL_MAX_WIDTH_CLASS[maxWidth],
        "rounded-t-[1.35rem] border border-primary/30 bg-black sm:rounded-xl",
        "shadow-[0_28px_90px_-18px] shadow-black/90 shadow-primary/20",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent",
        "animate-in slide-in-from-bottom fade-in duration-300 motion-reduce:animate-none sm:zoom-in-95 sm:slide-in-from-bottom-0",
    );
}

export const NEXIA_PREMIUM_MODAL_OVERLAY_CLASS =
    "fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4";

export const NEXIA_PREMIUM_MODAL_BACKDROP_CLASS =
    "absolute inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none";

export const NEXIA_PREMIUM_MODAL_HEADER_CLASS = cn(
    "relative z-[1] shrink-0 px-5 pb-3 pt-4 sm:px-6 sm:pt-5",
);

export const NEXIA_PREMIUM_MODAL_HEADER_ROW_CLASS =
    "flex items-start justify-between gap-3";

export const NEXIA_PREMIUM_MODAL_TITLE_CLASS = cn(
    NEXIA_PORTAL_CARD_TITLE,
    "text-left text-base sm:text-lg",
);

/** Acento inline en título (p. ej. día de la semana). */
export const NEXIA_PREMIUM_MODAL_TITLE_ACCENT_CLASS = "text-primary";

export const NEXIA_PREMIUM_MODAL_DESCRIPTION_CLASS = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "mt-1.5 max-w-prose text-left leading-relaxed",
);

export const NEXIA_PREMIUM_MODAL_HEADER_DIVIDER_WRAP_CLASS =
    "relative z-[1] shrink-0 bg-black px-5 py-0.5 sm:px-6";

export const NEXIA_PREMIUM_MODAL_HEADER_DIVIDER_LINE_CLASS = NEXIA_DIVIDER_GLOW;

/** Cuerpo con scroll único — no anidar overflow en hijos salvo listas largas internas. */
export const NEXIA_PREMIUM_MODAL_BODY_CLASS = cn(
    "relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 scrollbar-primary sm:px-6",
);

export const NEXIA_PREMIUM_MODAL_FOOTER_CLASS = cn(
    "relative z-[1] shrink-0 border-t border-border/40 px-5 py-4 sm:px-6",
    "bg-black",
    "shadow-[0_-12px_32px_-12px] shadow-black/50",
    "pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4",
);

export const NEXIA_PREMIUM_MODAL_FOOTER_ROW_CLASS =
    "flex items-center justify-between gap-3";

export const NEXIA_PREMIUM_MODAL_CLOSE_BTN_CLASS = cn(
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
    "border-primary/25 bg-primary/8 text-primary",
    "hover:border-primary/40 hover:bg-primary/15",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

/** CTA principal del pie — paridad footer atleta / wizard D-PAP. */
export const NEXIA_PREMIUM_MODAL_PRIMARY_CTA_CLASS = cn(
    "min-w-[7.5rem] shadow-[0_8px_28px_-10px] shadow-primary/35",
);
