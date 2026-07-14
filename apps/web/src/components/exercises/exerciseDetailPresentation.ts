/**
 * exerciseDetailPresentation.ts — Tokens UI detalle de ejercicio.
 *
 * Doc: docs/design/00_LEEME_PRIMERO.md
 * Shared: platformPremiumPresentation.ts
 */

import { cn } from "@/lib/utils";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";

export {
    PLATFORM_PAGE_SHELL as EXERCISE_DETAIL_PAGE,
    PLATFORM_PAGE_HEADER as EXERCISE_DETAIL_HEADER,
    PLATFORM_PAGE_TITLE_WRAP as EXERCISE_DETAIL_TITLE_WRAP,
    PLATFORM_BACK_BUTTON as EXERCISE_DETAIL_BACK_BUTTON,
    PLATFORM_SECTION_LABEL as EXERCISE_DETAIL_SPEC_LABEL,
    PLATFORM_FIELD_VALUE as EXERCISE_DETAIL_SPEC_VALUE,
    PLATFORM_BODY_MUTED as EXERCISE_DETAIL_BODY_MUTED,
    PLATFORM_BODY_MUTED_PRESERVE as EXERCISE_DETAIL_BODY_MUTED_PRESERVE,
    PLATFORM_LOADING_ROW as EXERCISE_DETAIL_LOADING_ROW,
    PLATFORM_LOADING_TEXT as EXERCISE_DETAIL_LOADING_TEXT,
    PLATFORM_ERROR_ACTION as EXERCISE_DETAIL_ERROR_ACTION,
    PLATFORM_ALERT_SPACING as EXERCISE_DETAIL_ALERT_SPACING,
    PLATFORM_BADGE_NEUTRAL as EXERCISE_DETAIL_BADGE_NEUTRAL,
    PLATFORM_BADGE_MUTED as EXERCISE_DETAIL_BADGE_MUTED,
    PLATFORM_BADGE_ROW as EXERCISE_DETAIL_BADGE_ROW,
    PLATFORM_CHIP as EXERCISE_DETAIL_CHIP,
    PLATFORM_EQUIP_CHIP as EXERCISE_DETAIL_EQUIP_CHIP,
    PLATFORM_SPEC_GRID as EXERCISE_DETAIL_SPEC_GRID,
    PLATFORM_CARD_BODY as EXERCISE_DETAIL_BODY,
    PLATFORM_ALT_DIVIDER as EXERCISE_DETAIL_ALT_DIVIDER,
    PLATFORM_ALT_ITEM as EXERCISE_DETAIL_ALT_ITEM,
    PLATFORM_LINK_PRIMARY as EXERCISE_DETAIL_VIDEO_LINK,
    PLATFORM_VIDEO_HERO as EXERCISE_DETAIL_VIDEO_HERO,
    PLATFORM_GRID_SPAN_FULL as EXERCISE_DETAIL_GRID_SPAN_FULL,
    PLATFORM_CHIP_ROW as EXERCISE_DETAIL_CHIP_ROW,
    PLATFORM_LINK_CENTERED as EXERCISE_DETAIL_VIDEO_LINK_CENTERED,
    PLATFORM_ICON_SM as EXERCISE_DETAIL_ICON_SM,
    PLATFORM_ICON_XS as EXERCISE_DETAIL_ICON_XS,
    PLATFORM_ICON_BACK_GAP as EXERCISE_DETAIL_ICON_BACK_GAP,
} from "@/components/ui/surface/platformPremiumPresentation";

export const EXERCISE_MEDIA_EMPTY_COPY = {
    imageSrc: "/assets/empty_state.png",
    imageAlt: "Mancuernas en el suelo del gimnasio",
    title: "¡A entrenar con memoria!",
    description:
        "Aún no hay contenido visual para este ejercicio, pero estamos seguros de que ya conoces la técnica. ¡Tú puedes con esto!",
} as const;

export const EXERCISE_DETAIL_SECTION_LABELS = {
    primaryMuscle: "Músculo principal",
    secondaryMuscles: "Músculos secundarios",
    level: "Nivel",
    movementPattern: "Patrón de movimiento",
    equipment: "Equipamiento",
    description: "Descripción",
    instructions: "Instrucciones",
    notes: "Notas",
    video: "Video",
    alternatives: "Alternativas",
    manualAlternatives: "Definidas manualmente",
    suggestedAlternatives: "Sugerencias automáticas",
} as const;

export const EXERCISE_DETAIL_SHELL = cn(NEXIA_GLASS_CARD, "relative pt-5");

export const EXERCISE_DETAIL_MEDIA_FRAME = cn(
    "relative w-full overflow-hidden",
    "aspect-[4/3] max-h-[min(56vh,440px)]",
    "sm:aspect-[16/9] sm:max-h-[min(48vh,520px)]",
    "lg:aspect-[21/9] lg:max-h-[min(52vh,560px)]"
);

export const EXERCISE_DETAIL_MEDIA_IMAGE =
    "absolute inset-0 h-full w-full object-cover object-center";

export const EXERCISE_DETAIL_MEDIA_OVERLAY = cn(
    "absolute inset-0",
    "bg-gradient-to-t from-background via-background/75 to-background/25"
);

export const EXERCISE_DETAIL_MEDIA_CONTENT = cn(
    "absolute inset-0 flex flex-col items-center justify-center px-6 py-8 text-center",
    "sm:px-10"
);

export const EXERCISE_DETAIL_MEDIA_TITLE =
    "text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl";

export const EXERCISE_DETAIL_MEDIA_DESCRIPTION = cn(
    "mt-3 max-w-sm text-balance text-sm leading-relaxed text-muted-foreground",
    "sm:max-w-md sm:text-[15px] sm:leading-6"
);

export const EXERCISE_DETAIL_MUSCLE_BADGE = cn(
    "border-0 px-2 py-0.5 text-[11px] font-medium"
);

export const EXERCISE_DETAIL_LEVEL_BADGE = "border-0 text-[11px] font-medium";

export const EXERCISE_DETAIL_ERROR_DETAIL = "mt-2 text-sm";

export const EXERCISE_DETAIL_ALT_SUBHEADING = "text-sm font-semibold text-foreground";

export const EXERCISE_DETAIL_ALT_ITEM_TITLE = "font-medium text-foreground";

export const EXERCISE_DETAIL_ALT_BLOCK = "mt-4";

export const EXERCISE_DETAIL_ALT_LIST = "mt-2 space-y-2";

export const EXERCISE_DETAIL_ALT_EMPTY = "mt-2 text-sm text-muted-foreground";

export const EXERCISE_DETAIL_ALT_REASON = "mt-1 text-xs text-primary/90";

export const EXERCISE_DETAIL_ALT_META = "mt-1 text-xs text-muted-foreground";

export const EXERCISE_DETAIL_ALT_SECTION_GAP = "mt-5";

export const EXERCISE_DETAIL_ALT_LOADING = "flex justify-center py-6";
