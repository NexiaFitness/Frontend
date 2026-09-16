/**
 * clientInjuriesTabPresentation.ts — Tab Lesiones (premium · copy + tokens vacío).
 */

import { cn } from "@/lib/utils";
import {
    ATHLETE_EMPTY_STATE_CARD_COMPACT,
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    ATHLETE_EMPTY_STATE_TITLE,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";

export const CLIENT_INJURIES_TAB_STACK = "space-y-6 pb-8";

export const CLIENT_INJURIES_EMPTY_COPY = {
    title: "Sin lesiones registradas",
    description:
        "Registra una lesión para hacer seguimiento, coherencia del plan y alternativas de ejercicio.",
    cta: "Registrar lesión",
} as const;

export const CLIENT_INJURIES_FILTER_EMPTY_COPY = {
    title: "Nada que coincida con el filtro",
    description: "Prueba otro filtro o selecciona «Todas» para ver todo el historial.",
} as const;

export const CLIENT_INJURIES_FILTER_EMPTY_SHELL = cn(
    ATHLETE_EMPTY_STATE_CARD_COMPACT,
    "relative border-dashed text-center",
);

export const CLIENT_INJURIES_FILTER_EMPTY_TITLE = ATHLETE_EMPTY_STATE_TITLE;

export const CLIENT_INJURIES_FILTER_EMPTY_BODY = cn(
    ATHLETE_EMPTY_STATE_DESCRIPTION,
    "mx-auto",
);

export const CLIENT_INJURIES_FILTER_CHIP_ACTIVE =
    "border-primary bg-primary/10 text-primary";

export const CLIENT_INJURIES_FILTER_CHIP_IDLE = cn(
    "border-border text-muted-foreground",
    "hover:border-input hover:text-foreground",
);

export const CLIENT_INJURIES_FILTER_CHIP_BASE = cn(
    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
);
