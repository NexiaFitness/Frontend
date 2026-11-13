/**
 * nexiaSectionCardPresentation.ts — Clases de la tarjeta de sección (glass + rim, plegable en móvil).
 *
 * Contexto: H10, ficha admin del catálogo. Sirve a cualquier formulario largo que en
 * escritorio enseña todas sus secciones a la vez y en móvil las pliega con un resumen.
 * Notas de mantenimiento: la tarjeta deja pasar lo que desborda (overflow-visible) porque
 * el rim ya recorta su propio brillo; los paneles flotantes van en portal de todos modos.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "./glassSurfacePresentation";
import { NEXIA_PORTAL_CARD_TITLE } from "@/components/athlete/account/athleteSettingsPresentation";

export const NEXIA_SECTION_CARD = cn(NEXIA_GLASS_CARD, "overflow-visible");

export const NEXIA_SECTION_CARD_HEADER = cn(
    "flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left",
    "min-h-touch-athlete lg:min-h-0 lg:px-5 lg:pb-2 lg:pt-5"
);

export const NEXIA_SECTION_CARD_TOGGLE = cn(
    NEXIA_SECTION_CARD_HEADER,
    "rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
);

export const NEXIA_SECTION_CARD_TITLE = cn(NEXIA_PORTAL_CARD_TITLE, "shrink-0 whitespace-nowrap");

export const NEXIA_SECTION_CARD_SUMMARY = "ml-auto min-w-0 truncate text-sm text-muted-foreground";

export const NEXIA_SECTION_CARD_ASIDE = "ml-auto min-w-0 truncate text-xs text-muted-foreground";

/** Con un control en la cabecera, la nota va junto al título y el control a la derecha. */
export const NEXIA_SECTION_CARD_ASIDE_INLINE = "min-w-0 truncate text-xs text-muted-foreground";

export const NEXIA_SECTION_CARD_CHEVRON = cn(
    "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none"
);

export const NEXIA_SECTION_CARD_CHEVRON_OPEN = "rotate-180";

export const NEXIA_SECTION_CARD_BODY = "space-y-5 px-4 pb-5 lg:px-5";

export const NEXIA_SECTION_CARD_HEADER_ACTION = "ml-auto shrink-0";
