/**
 * nexiaDividerPresentation.ts — Líneas divisorias cyan premium NEXIA (§6.7).
 * Fuente única: side menu, headers atleta, glass rim, sheets.
 */

import { cn } from "@/lib/utils";

export type NexiaDividerTone = "subtle" | "glow" | "strong";

/** Separador de sección — bajo labels «Navegación», headers V13, etc. */
export const NEXIA_DIVIDER_SUBTLE =
    "h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent";

/** Con halo cyan — cards glass, footer drawer, bordes superiores. */
export const NEXIA_DIVIDER_GLOW = cn(
    "h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent",
    "shadow-[0_0_14px_1px] shadow-primary/30"
);

/** Pie de marca / énfasis máximo (side menu footer). */
export const NEXIA_DIVIDER_STRONG = cn(
    "h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent",
    "shadow-[0_0_12px_1px] shadow-primary/25"
);

export const NEXIA_DIVIDER: Record<NexiaDividerTone, string> = {
    subtle: NEXIA_DIVIDER_SUBTLE,
    glow: NEXIA_DIVIDER_GLOW,
    strong: NEXIA_DIVIDER_STRONG,
};

/** Inset horizontal típico en cards (paridad NexiaGlassAccentRim). */
export const NEXIA_DIVIDER_INSET = "inset-x-3";

export const NEXIA_DIVIDER_INSET_WIDE = "inset-x-5";

/** Inset en flujo (listas) — la línea no llega a los bordes de la card. */
export const NEXIA_DIVIDER_FLOW_INSET = "mx-3";

export const NEXIA_DIVIDER_FLOW_INSET_WIDE = "mx-5";

/** Separador premium in-flow (glow + márgenes). Componer con NexiaPremiumDivider. */
export const NEXIA_DIVIDER_FLOW_GLOW = cn(
    NEXIA_DIVIDER_FLOW_INSET,
    "my-2.5 block w-auto shrink-0"
);

/** Banda suave encima de línea glow (footer cards). */
export const NEXIA_DIVIDER_GLOW_BAND = "h-3 bg-gradient-to-b from-primary/15 to-transparent";
