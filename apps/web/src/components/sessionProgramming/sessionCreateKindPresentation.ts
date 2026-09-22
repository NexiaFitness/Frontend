/**
 * sessionCreateKindPresentation.ts — Copy y clases D2 (Programa vs sesión suelta).
 *
 * Doc: DESIGN_PREMIUM.md · TabsBar / NEXIA_SEGMENTED_*
 */

import { cn } from "@/lib/utils";
import { NEXIA_PORTAL_CARD_DESCRIPTION } from "@/components/athlete/account/athleteSettingsPresentation";
export const SESSION_CREATE_KIND_COPY = {
    segmentedAriaLabel: "Tipo de creación de sesión",
    program: "Programa",
    standalone: "Sesión suelta",
    implicitStandaloneLabel: "Modo sesión suelta",
    switchToProgram: "Volver a programa",
} as const;

export const SESSION_CREATE_KIND_ROW = cn(
    "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
);

export const SESSION_CREATE_KIND_IMPLICIT_WRAP = "min-w-0 space-y-0.5";

export const SESSION_CREATE_KIND_IMPLICIT_TITLE =
    "text-sm font-medium text-foreground";

export const SESSION_CREATE_KIND_IMPLICIT_HINT = cn(
    NEXIA_PORTAL_CARD_DESCRIPTION,
    "text-[11px] leading-snug",
);

export const SESSION_CREATE_KIND_SEGMENTED = "w-full min-w-0 sm:max-w-md";

export const SESSION_CREATE_KIND_ESCAPE = "shrink-0 self-start sm:self-center";
