/**
 * clientHeaderPresentation.ts — Tokens premium header ficha cliente (trainer).
 *
 * Tipografía alineada con portal atleta (NEXIA_PORTAL_*); superficies trainer sin glass.
 * Doc: design/entrenador/UX-OVERVIEW-COCKPIT.md · design/platform/04_REGISTRY_CODIGO_FUENTE.md §11
 */

import { cn } from "@/lib/utils";
import {
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";

/** Ocultar CTA hasta que el flujo de reportes esté listo en producto. */
export const CLIENT_HEADER_SHOW_GENERATE_REPORT = false;

export {
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
};

export const CLIENT_HEADER_SHELL = "space-y-4 sm:space-y-5";

/** Mobile: columna (identidad → meta → acciones). Desktop: fila avatar + bloque derecho. */
export const CLIENT_HEADER_HERO_OUTER = "flex flex-col gap-3 sm:gap-4";

/** Fila avatar + nombre — centrados en el eje vertical. */
export const CLIENT_HEADER_NAME_ROW = "flex items-center gap-3 sm:gap-5";

/** Título + acciones desktop en la misma línea. */
export const CLIENT_HEADER_TITLE_ROW =
    "flex items-center justify-between gap-2 sm:gap-3";

/** Nombre + avatar en la misma fila (mobile y desktop). */
export const CLIENT_HEADER_IDENTITY_BLOCK = "min-w-0 flex-1";

/** Título — un poco más compacto en mobile para evitar saltos absurdos. */
export const CLIENT_HEADER_NAME = cn(
    NEXIA_PORTAL_GREETING_H1,
    "text-xl leading-tight sm:text-[1.75rem] sm:leading-[1.15] lg:text-3xl",
);

export const CLIENT_HEADER_META =
    "text-xs leading-relaxed text-muted-foreground sm:text-sm sm:font-medium";

/** Barra de acciones — alinear items; flex solo con breakpoint (evitar anular hidden). */
export const CLIENT_HEADER_ACTIONS_ALIGN = "items-center gap-2";

export const CLIENT_HEADER_DESKTOP_ACTIONS_WRAP = cn(
    "hidden sm:flex sm:shrink-0",
    CLIENT_HEADER_ACTIONS_ALIGN,
);

export const CLIENT_HEADER_MOBILE_ACTIONS_WRAP = cn(
    "flex w-full sm:hidden",
    CLIENT_HEADER_ACTIONS_ALIGN,
);

export const CLIENT_HEADER_ACTION_BUTTON_MOBILE =
    "min-h-9 min-w-0 flex-1 basis-0 px-2 sm:flex-none sm:basis-auto sm:px-3";

/** Campana inbox — h-9, icono visible; badge en esquina exterior. */
export const CLIENT_HEADER_INBOX_BELL = cn(
    "relative mr-3 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
    "border border-primary/30 bg-surface-2 text-primary",
    "transition-colors hover:border-primary/45 hover:bg-primary/10 active:bg-primary/15",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const CLIENT_HEADER_INBOX_BELL_ICON = "size-[18px] shrink-0 text-primary";

export const CLIENT_HEADER_AVATAR_BUTTON = cn(
    "shrink-0 rounded-full ring-2 ring-primary/25 transition-all duration-200",
    "hover:ring-primary/50 hover:shadow-[0_0_24px_-8px] shadow-primary/35",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
);

export const CLIENT_HEADER_PREF_GRID_SHELL = cn(
    "rounded-xl border border-border/70 bg-surface p-4 sm:p-5",
    "shadow-[inset_0_1px_0] shadow-primary/5",
);

export const CLIENT_HEADER_PREF_GRID =
    "grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4";

export const CLIENT_HEADER_PREF_CELL = cn(
    "min-w-0 rounded-lg border border-border/50 bg-surface-2/50 px-3 py-3 text-center",
    "transition-colors hover:border-primary/20 hover:bg-surface-2/80",
);

export const CLIENT_HEADER_PREF_LABEL = cn(
    NEXIA_PORTAL_PAGE_EYEBROW,
    "block text-[10px] leading-tight sm:text-[11px]",
    "whitespace-normal sm:whitespace-nowrap",
);

export const CLIENT_HEADER_PREF_VALUE =
    "mt-1.5 text-sm font-semibold leading-snug text-foreground break-words";

export const CLIENT_HEADER_OBS_SHELL = cn(
    "rounded-xl border border-border/70 bg-surface/90 p-4 sm:p-5",
);

export const CLIENT_HEADER_OBS_QUICK_NOTE = cn(
    "mb-4 space-y-2 rounded-lg border border-border/70 bg-surface-2/50 p-3",
);

export const CLIENT_HEADER_NOTE_BODY =
    "whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground";

export const CLIENT_HEADER_QUICK_NOTE_TRIGGER = cn(
    "text-xs font-semibold text-primary transition-colors",
    "hover:text-primary/80 hover:underline",
);
