/**
 * sessionDayCoexistencePresentation.ts — Aviso coexistencia en create-session (premium).
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export const SESSION_DAY_COEXISTENCE_SHELL = cn(
    NEXIA_GLASS_CARD,
    "border-warning/25 bg-warning/8 px-3 py-2.5 sm:px-3.5",
);

export const SESSION_DAY_COEXISTENCE_TITLE = "text-sm font-medium text-foreground";

export const SESSION_DAY_COEXISTENCE_BODY = "mt-0.5 text-xs leading-snug text-muted-foreground";

export const SESSION_DAY_COEXISTENCE_ACTIONS = "mt-2.5 flex flex-wrap items-center gap-2";
