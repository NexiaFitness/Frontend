/**
 * detailStyles.ts — Resolver de estilos por kind para la vista read-only.
 *
 * Reutiliza las constantes del constructor (`constructorCardStyles.ts`) para
 * mantener coherencia visual con el editor sin duplicar tokens.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import {
    CONSTRUCTOR_AMRAP_BADGE_CLASS,
    CONSTRUCTOR_AMRAP_CARD_CLASS,
    CONSTRUCTOR_AMRAP_GROUP_BAR_CLASS,
    CONSTRUCTOR_AMRAP_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_AMRAP_SLOT_RING_CLASS,
    CONSTRUCTOR_CARD_CLASS,
    CONSTRUCTOR_DROP_CONNECTOR_CLASS,
    CONSTRUCTOR_DROP_MAIN_RING_CLASS,
    CONSTRUCTOR_DROP_STEP_RING_CLASS,
    CONSTRUCTOR_EMOM_BADGE_CLASS,
    CONSTRUCTOR_EMOM_CARD_CLASS,
    CONSTRUCTOR_EMOM_GROUP_BAR_CLASS,
    CONSTRUCTOR_EMOM_WINDOW_LABEL_CLASS,
    CONSTRUCTOR_FOR_TIME_BADGE_CLASS,
    CONSTRUCTOR_FOR_TIME_CARD_CLASS,
    CONSTRUCTOR_FOR_TIME_GROUP_BAR_CLASS,
    CONSTRUCTOR_FOR_TIME_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_FOR_TIME_SLOT_RING_CLASS,
    CONSTRUCTOR_GROUP_BADGE_CLASS,
    CONSTRUCTOR_GROUP_BAR_CLASS,
    CONSTRUCTOR_SLOT_CONNECTOR_CLASS,
    CONSTRUCTOR_SLOT_RING_CLASS,
} from "../constructor/primitives/constructorCardStyles";
import { amrapFooterHint } from "@nexia/shared";
import type { SessionGroupKind } from "@nexia/shared";

export interface DetailKindStyle {
    cardClass: string;
    groupBarClass: string;
    badgeClass: string;
    /** Color HSL para iconos contextuales (Timer, Hourglass…). */
    accentTextClass: string;
}

/** Badge de tipo de serie en cabecera read-only (más legible que el constructor). */
export const DETAIL_HEADER_BADGE_SIZE_CLASS = "px-2.5 py-1 text-xs";

const PRIMARY_STYLE: DetailKindStyle = {
    cardClass: CONSTRUCTOR_CARD_CLASS,
    groupBarClass: CONSTRUCTOR_GROUP_BAR_CLASS,
    badgeClass: CONSTRUCTOR_GROUP_BADGE_CLASS,
    accentTextClass: "text-primary/70",
};

const FOR_TIME_STYLE: DetailKindStyle = {
    cardClass: CONSTRUCTOR_FOR_TIME_CARD_CLASS,
    groupBarClass: CONSTRUCTOR_FOR_TIME_GROUP_BAR_CLASS,
    badgeClass: CONSTRUCTOR_FOR_TIME_BADGE_CLASS,
    accentTextClass: "text-emerald-700/80 dark:text-emerald-400/80",
};

const EMOM_STYLE: DetailKindStyle = {
    cardClass: CONSTRUCTOR_EMOM_CARD_CLASS,
    groupBarClass: CONSTRUCTOR_EMOM_GROUP_BAR_CLASS,
    badgeClass: CONSTRUCTOR_EMOM_BADGE_CLASS,
    accentTextClass: "text-purple-700/80 dark:text-purple-400/80",
};

const AMRAP_STYLE: DetailKindStyle = {
    cardClass: CONSTRUCTOR_AMRAP_CARD_CLASS,
    groupBarClass: CONSTRUCTOR_AMRAP_GROUP_BAR_CLASS,
    badgeClass: CONSTRUCTOR_AMRAP_BADGE_CLASS,
    accentTextClass: "text-red-700/80 dark:text-red-400/80",
};

const KIND_STYLE_MAP: Record<SessionGroupKind, DetailKindStyle> = {
    single_set: PRIMARY_STYLE,
    superset: PRIMARY_STYLE,
    giant_set: PRIMARY_STYLE,
    dropset: PRIMARY_STYLE,
    for_time: FOR_TIME_STYLE,
    emom: EMOM_STYLE,
    amrap: AMRAP_STYLE,
};

export function detailStyleForKind(kind: SessionGroupKind): DetailKindStyle {
    return KIND_STYLE_MAP[kind] ?? PRIMARY_STYLE;
}

// ============================================================================
// Anillos de slot
// ============================================================================

export type DetailSlotVariant =
    | "primary"
    | "for_time"
    | "amrap"
    | "emom_window"
    | "dropset_main"
    | "dropset_step";

interface SlotRingTokens {
    ringClass: string;
    connectorClass: string | null;
}

const SLOT_TOKENS: Record<DetailSlotVariant, SlotRingTokens> = {
    primary: {
        ringClass: CONSTRUCTOR_SLOT_RING_CLASS,
        connectorClass: CONSTRUCTOR_SLOT_CONNECTOR_CLASS,
    },
    for_time: {
        ringClass: CONSTRUCTOR_FOR_TIME_SLOT_RING_CLASS,
        connectorClass: CONSTRUCTOR_FOR_TIME_SLOT_CONNECTOR_CLASS,
    },
    amrap: {
        ringClass: CONSTRUCTOR_AMRAP_SLOT_RING_CLASS,
        connectorClass: CONSTRUCTOR_AMRAP_SLOT_CONNECTOR_CLASS,
    },
    emom_window: {
        ringClass: CONSTRUCTOR_EMOM_WINDOW_LABEL_CLASS,
        connectorClass: null,
    },
    dropset_main: {
        ringClass: CONSTRUCTOR_DROP_MAIN_RING_CLASS,
        connectorClass: CONSTRUCTOR_DROP_CONNECTOR_CLASS,
    },
    dropset_step: {
        ringClass: CONSTRUCTOR_DROP_STEP_RING_CLASS,
        connectorClass: CONSTRUCTOR_DROP_CONNECTOR_CLASS,
    },
};

export function slotTokens(variant: DetailSlotVariant): SlotRingTokens {
    return SLOT_TOKENS[variant];
}

// ============================================================================
// Hints inferiores (texto reutilizado del constructor)
// ============================================================================

const HINT_BY_KIND: Record<
    SessionGroupKind,
    (rounds: number | null, timeCapMinutes?: number | null) => string | null
> = {
    single_set: () => "Series del mismo ejercicio con descanso entre series.",
    superset: () => "El Superset siempre contiene 2 ejercicios.",
    giant_set: () => "Descanso solo al final de cada ronda.",
    dropset: () =>
        "Sin descanso entre drops · Mismo ejercicio, reduciendo reps/esfuerzo en cada drop.",
    amrap: (_rounds, timeCapMinutes) => amrapFooterHint(timeCapMinutes),
    emom: () =>
        "Completa los ejercicios de cada ventana dentro del tiempo establecido y descansa el tiempo restante.",
    for_time: (rounds) =>
        `Completa los ejercicios en orden, ${rounds ?? 1} ronda(s) — el objetivo es el menor tiempo posible.`,
};

export function hintForKind(
    kind: SessionGroupKind,
    rounds: number | null,
    timeCapMinutes?: number | null
): string | null {
    const fn = HINT_BY_KIND[kind];
    return fn ? fn(rounds, timeCapMinutes) : null;
}
