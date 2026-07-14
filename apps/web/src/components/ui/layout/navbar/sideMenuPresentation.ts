/**
 * sideMenuPresentation.ts — Tokens drawer público móvil (cyan glass, DESIGN §6.7).
 */

import { cn } from "@/lib/utils";
import { NEXIA_DIVIDER_SUBTLE } from "@/components/ui/surface/nexiaDividerPresentation";

export const SIDE_MENU_PANEL = cn(
    "bg-background/95 backdrop-blur-xl",
    "border-l border-border/60",
    "shadow-[0_0_48px_-8px] shadow-black/60"
);

export const SIDE_MENU_OVERLAY = "bg-black/70 backdrop-blur-[2px]";

export const SIDE_MENU_SECTION_LABEL =
    "text-xs font-semibold uppercase tracking-wider text-primary/75";

export const SIDE_MENU_DIVIDER = NEXIA_DIVIDER_SUBTLE;

export function sideMenuLinkClass(isActive: boolean): string {
    return cn(
        "flex items-center rounded-xl px-4 py-3.5 text-base transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
            ? "border border-primary/30 bg-primary/10 font-semibold text-primary shadow-[inset_0_1px_0] shadow-primary/10"
            : "border border-transparent text-foreground/85 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
    );
}

export const SIDE_MENU_FOOTER = cn(
    "overflow-hidden rounded-xl border border-border/60",
    "bg-gradient-to-b from-card/45 via-card/25 to-background/40",
    "px-5 py-6 backdrop-blur-md",
    "shadow-[0_12px_40px_-16px] shadow-black/50",
    "shadow-[inset_0_1px_0] shadow-primary/8"
);

export const SIDE_MENU_FOOTER_COPY =
    "mx-auto max-w-[16rem] text-sm leading-relaxed text-muted-foreground/90";

/** Hamburguesa / X — siempre cyan (mismo tono abierto y cerrado). */
export function mobileTriggerClass(_isOpen: boolean): string {
    return cn(
        "flex min-h-touch min-w-touch items-center justify-center rounded-lg p-1.5",
        "text-primary transition-opacity duration-150 motion-reduce:transition-none",
        "hover:text-primary/85 active:opacity-80",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
        "-mr-1"
    );
}
