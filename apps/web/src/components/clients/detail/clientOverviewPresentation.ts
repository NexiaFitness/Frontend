/**
 * clientOverviewPresentation.ts — Tokens copy y clases UI tab Resumen.
 *
 * Orden scroll canónico (main/producción): KPIs → Acción → Comunicación → …
 * Doc: design/entrenador/UX-OVERVIEW-COCKPIT.md §0.4 · design/platform/04_REGISTRY_CODIGO_FUENTE.md §11
 */

import type { OverviewStatChipTone } from "@/hooks/clients/clientOverviewPulse.types";
import { PLATFORM_SECTION_LABEL } from "@/components/ui/surface/platformPremiumPresentation";

/** Orden de zonas en ClientOverviewTab — no cambiar sin petición explícita del usuario. */
export const OVERVIEW_ZONE_SCROLL_ORDER = [
    "kpi",
    "action",
    "comms",
    "recommendations",
    "activity",
    "relation",
] as const;

export const OVERVIEW_ZONE_TITLES = {
    pageTitle: "Resumen",
    action: "Acción inmediata",
    comms: "Comunicación con el atleta",
    kpiSection: "Indicadores clave",
    activity: "Actividad reciente",
    relation: "Relación y seguimiento",
    planActive: "Plan activo",
    planEmpty: "Sin plan activo",
    planEmptyDetail: "Asigna un plan para estructurar el programa del atleta.",
    planAlignedBadge: "Alineado con objetivo",
    trainingProfile: "Perfil de entrenamiento",
    trainingProfileHint:
        "Referencia general según experiencia, frecuencia y duración de sesión del cliente.",
} as const;

export const OVERVIEW_COMMS_COPY = {
    empty:
        "Cuando el atleta complete una sesión, lo verás aquí.",
    pendingBadge: "Pendiente de respuesta",
    respondedBadge: "Respondido",
    historyToggle: (n: number) => `Ver ${n} anteriores`,
    hideHistory: "Ocultar historial",
} as const;

export const OVERVIEW_ACTIVITY_LABELS = {
    lastSession: "Última sesión",
    loadBridge: "Puente carga",
    signal: "Señal de carga",
    completedBadge: "Completada",
    viewExecution: "Ver ejecución",
    gymHistoryLink: "Historial gym",
    emptyTitle: "Sin sesiones completadas",
    emptyDetail: "Programa la primera sesión para empezar a registrar actividad.",
    emptyCta: "Ir a Sesiones",
    loadEmpty: "Aún no hay cargas registradas por el atleta en sesiones completadas.",
} as const;

export const OVERVIEW_STAT_CHIP_LABELS = {
    adherence: "Adherencia",
    monotony: "Monotonía",
    weight: "Peso",
    fatigue: "Fatiga media",
    risk: "Riesgo",
    nextSession: "Próxima sesión",
} as const;

export const OVERVIEW_KPI_DESCRIPTIONS: Record<string, string> = {
    adherence: "Cumplimiento del plan (14 días)",
    monotony: "Variación del estímulo",
    weight: "Último registro corporal",
    fatigue: "Pre / post sesión (media)",
    risk: "Nivel de riesgo de fatiga",
    next_session: "Siguiente sesión programada",
};

/** Card KPI compacto — grid tab Resumen (ClientOverviewKpiGrid). */
export const OVERVIEW_KPI_TILE_CLASS =
    "flex min-h-[112px] flex-col gap-2 rounded-lg border bg-surface p-4 transition-all duration-150 ease-out hover:-translate-y-0.5";

export const OVERVIEW_CHIP_TONE_TO_KPI: Record<
    OverviewStatChipTone,
    "primary" | "success" | "warning" | "destructive" | "info"
> = {
    neutral: "primary",
    success: "success",
    warning: "warning",
    destructive: "destructive",
};

/** Shell sección premium (trainer — sin glass). */
export const OVERVIEW_SECTION_SHELL =
    "rounded-lg border border-border bg-surface p-5";

/** Card shell compartido alertas + plan */
export const OVERVIEW_ACTION_CARD =
    "flex min-h-[280px] flex-col rounded-lg border border-border bg-surface p-5";

export const OVERVIEW_COMMS_PENDING =
    "border-l-[3px] border-l-warning bg-warning/10";

export const OVERVIEW_COMMS_OK =
    "border-l-[3px] border-l-success bg-success/10";

export const OVERVIEW_HOVER_CARD =
    "transition-all duration-150 ease-out hover:-translate-y-0.5";

/** Card-7 — fila interactiva actividad */
export const OVERVIEW_ACTIVITY_CARD_CLASS =
    "group rounded-lg border border-border bg-card px-4 py-4 transition-all duration-150 ease-out hover:border-primary/30 hover:bg-surface-2/50 cursor-pointer text-left w-full";

/** Card-5 — empty con accent (trainer, no glass atleta) */
export const OVERVIEW_EMPTY_CARD_CLASS =
    "rounded-lg border border-border border-l-2 border-l-primary bg-card p-5 shadow-sm";

export const OVERVIEW_SECTION_LABEL = PLATFORM_SECTION_LABEL;

export function clientTabPath(
    clientId: number,
    tab: string,
    extra?: Record<string, string>,
): string {
    const params = new URLSearchParams({ tab, ...extra });
    return `/dashboard/clients/${clientId}?${params.toString()}`;
}
