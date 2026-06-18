/**
 * glassSurfacePresentation.ts — Card glass canónica NEXIA (§6.7).
 * Fuente única: login auth, portal atleta, sheets, post-sesión.
 */

import { cn } from "@/lib/utils";

/** Contenedor glass premium — paridad AuthLayout móvil. */
export const NEXIA_GLASS_CARD = cn(
    "relative overflow-hidden",
    "rounded-xl border border-border/80 bg-card/40 backdrop-blur-md",
    "shadow-[0_12px_40px_-12px] shadow-black/45",
    "max-lg:shadow-[0_16px_48px_-12px] max-lg:shadow-black/50"
);

/** Ajustes desktop (auth y layouts lg+). */
export const NEXIA_GLASS_CARD_DESKTOP =
    "lg:bg-card/50 lg:backdrop-blur-sm lg:border-border lg:shadow-xl";
