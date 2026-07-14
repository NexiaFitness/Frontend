/**
 * clientOverviewPresentation.ts — Tokens copy y clases UI tab Resumen.
 * Alineado con DESIGN.md (Sparkle Flow).
 */

import type { OverviewStatChipTone } from "@/hooks/clients/clientOverviewPulse.types";

export const OVERVIEW_ZONE_TITLES = {
    pageTitle: "Resumen",
    activity: "Actividad reciente",
    kpiSection: "Indicadores clave",
    planActive: "Plan activo",
    planEmpty: "Sin plan activo",
    planEmptyDetail: "Asigna un plan para estructurar el programa del atleta.",
    /** Badge en card Plan activo cuando recomendaciones = compact_ok */
    planAlignedBadge: "Alineado con objetivo",
} as const;

export const OVERVIEW_ACTIVITY_LABELS = {
    lastSession: "Última sesión",
    signal: "Señal de carga",
    emptyTitle: "Sin sesiones completadas",
    emptyDetail: "Programa la primera sesión para empezar a registrar actividad.",
    emptyCta: "Ir a Sesiones",
} as const;

export const OVERVIEW_STAT_CHIP_LABELS = {
    adherence: "Adherencia",
    monotony: "Monotonía",
    weight: "Peso",
    fatigue: "Fatiga",
    risk: "Riesgo",
    nextSession: "Próxima sesión",
} as const;

export const OVERVIEW_KPI_DESCRIPTIONS: Record<string, string> = {
    adherence: "Cumplimiento del plan (14 días)",
    monotony: "Variación del estímulo",
    weight: "Último registro corporal",
    fatigue: "Pre / post sesión (media)",
    risk: "Nivel de riesgo de fatiga",
    nextSession: "Siguiente sesión programada",
};

export const OVERVIEW_CHIP_TONE_TO_KPI: Record<
    OverviewStatChipTone,
    "primary" | "success" | "warning" | "destructive" | "info"
> = {
    neutral: "primary",
    success: "success",
    warning: "warning",
    destructive: "destructive",
};

/** Card-2 / KPI shell */
/** Card shell compartido alertas + plan */
export const OVERVIEW_ACTION_CARD =
    "flex min-h-[280px] flex-col rounded-lg border border-border bg-surface p-5";

export const OVERVIEW_KPI_TILE_CLASS =
    "flex h-[128px] flex-col justify-between rounded-lg border bg-surface p-4 transition-all duration-150 ease-out hover:-translate-y-0.5";

/** Card-7 — fila interactiva */
export const OVERVIEW_ACTIVITY_CARD_CLASS =
    "group rounded-lg border border-border bg-card px-4 py-4 transition-all duration-150 ease-out hover:border-primary/30 hover:bg-surface-2/50 cursor-pointer text-left w-full";

/** Card-5 — empty con accent */
export const OVERVIEW_EMPTY_CARD_CLASS =
    "rounded-lg border border-border border-l-2 border-l-primary bg-card p-5 shadow-sm";

export function clientTabPath(
    clientId: number,
    tab: string,
    extra?: Record<string, string>,
): string {
    const params = new URLSearchParams({ tab, ...extra });
    return `/dashboard/clients/${clientId}?${params.toString()}`;
}
