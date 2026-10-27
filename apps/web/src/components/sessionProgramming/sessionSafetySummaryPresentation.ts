/**
 * sessionSafetySummaryPresentation.ts — Copy y clases del resumen de seguridad de la sesión.
 *
 * Contexto: SessionSafetySummarySection (validación de sesión). H4: cuatro recuentos
 * (seguros, advertencias, bloqueantes y no verificables); «no verificable» nunca se presenta
 * como seguro. Tonos semánticos de DESIGN_PREMIUM §3 con receta glass (borde /30, fondo /10).
 * Notas de mantenimiento: mobile-first, 2 columnas a 375 px y 4 desde `sm`.
 *
 * @author Frontend Team
 * @since @nexia/shared 2.0.0 (H4)
 */

import { cn } from "@/lib/utils";

export type SafetyKpiTone = "success" | "warning" | "destructive" | "muted";

export const SESSION_SAFETY_COPY = {
    empty: "Sin datos de seguridad.",
    safe: "Seguros",
    warning: "Advertencias",
    blocking: "Bloqueantes",
    unverifiable: "No verificables",
    blockingTitle: "Ejercicios bloqueantes",
    warningTitle: "Advertencias",
    unverifiableTitle: "No se pudieron comprobar",
    blockingFallback: "Contraindicado",
    warningFallback: "Precaución",
    unverifiableFallback: "Sin acciones articulares en el catálogo",
} as const;

export const SESSION_SAFETY_STACK = "space-y-3";

export const SESSION_SAFETY_EMPTY = "text-sm text-muted-foreground";

export const SESSION_SAFETY_KPI_GRID = "grid grid-cols-2 gap-2 sm:grid-cols-4";

const KPI_TONE: Record<SafetyKpiTone, string> = {
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    destructive: "border-destructive/30 bg-destructive/10 text-destructive",
    muted: "border-border/60 bg-muted/20 text-muted-foreground",
};

export function sessionSafetyKpiClass(tone: SafetyKpiTone): string {
    return cn("rounded-md border p-2 text-center", KPI_TONE[tone]);
}

export const SESSION_SAFETY_KPI_VALUE = "text-lg font-bold";

export const SESSION_SAFETY_KPI_LABEL = "text-[10px] opacity-80";

export const SESSION_SAFETY_LIST = "space-y-1.5";

export function sessionSafetyListTitleClass(tone: SafetyKpiTone): string {
    return cn("text-xs font-medium", KPI_TONE[tone].split(" ").pop());
}

export function sessionSafetyItemClass(tone: SafetyKpiTone): string {
    return cn("flex items-start gap-2 rounded-md border p-2", KPI_TONE[tone]);
}

export const SESSION_SAFETY_ITEM_ICON = "mt-0.5";

export const SESSION_SAFETY_ITEM_TEXT = "min-w-0 text-xs font-medium";

/** Carga axial (H4): sin dato no suma ni se pinta como «0 pts»; pendiente de revisión, marcado. */
export const SESSION_AXIAL_COPY = {
    unknown: "Sin dato",
    pendingReview: "propuesta",
    unverifiable: (n: number) =>
        n === 1
            ? "1 ejercicio sin carga axial en el catálogo no suma."
            : `${n} ejercicios sin carga axial en el catálogo no suman.`,
} as const;

export const SESSION_AXIAL_NOTE = "text-xs text-muted-foreground";

export const SESSION_AXIAL_PENDING_TAG = "ml-1 text-warning";
