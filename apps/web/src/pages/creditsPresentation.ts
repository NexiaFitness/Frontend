/**
 * creditsPresentation.ts — Créditos de RepDB Free Tier (H5).
 *
 * Una frase para quien lee la pantalla, y el enlace de atribución obligatorio.
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP } from "@/components/ui/surface/glassSurfacePresentation";
import {
    PLATFORM_BODY_MUTED,
    PLATFORM_LINK_PRIMARY,
    PLATFORM_PAGE_SHELL,
    PLATFORM_PAGE_TITLE_H1,
} from "@/components/ui/surface/platformPremiumPresentation";

export const CREDITS_PATH = "/creditos";

export const CREDITS_URL = "https://repdb.co";

export const CREDITS_COPY = {
    title: "Créditos",
    meta: "RepDB Free Tier v1.0",
    sentence:
        "Los textos de los ejercicios (descripción, cómo se hace y consejos) proceden de RepDB y se usan bajo la licencia RepDB Free Tier v1.0.",
    linkLabel: "Exercise data by RepDB (repdb.co)",
    settingsLabel: "Créditos",
    settingsHint: "Origen de los textos de los ejercicios",
    footerLabel: "Créditos",
} as const;

export const CREDITS_PAGE = cn(PLATFORM_PAGE_SHELL, "px-4 pt-6 sm:px-6 lg:px-8");

export const CREDITS_CARD = cn(NEXIA_GLASS_CARD, NEXIA_GLASS_CARD_DESKTOP, "p-6 sm:p-8");

export const CREDITS_TITLE = PLATFORM_PAGE_TITLE_H1;

export const CREDITS_META = "mt-2 text-sm text-muted-foreground";

export const CREDITS_BODY = cn(PLATFORM_BODY_MUTED, "max-w-prose");

export const CREDITS_LINK = cn(PLATFORM_LINK_PRIMARY, "mt-4 min-h-touch");

export const PUBLIC_SITE_FOOTER = "border-t border-border px-4 py-5 sm:px-6";

export const PUBLIC_SITE_FOOTER_LINK = cn(PLATFORM_LINK_PRIMARY, "min-h-touch");
