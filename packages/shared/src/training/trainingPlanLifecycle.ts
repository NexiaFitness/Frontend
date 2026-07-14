/**
 * trainingPlanLifecycle.ts — Badges y etiquetas del ciclo de vida de planes (documento + instancia).
 *
 * Contexto:
 * - lifecycle_status viene del backend en listados por client_id.
 * - operational = único plan operativo del cliente (instancia active).
 *
 * @author Frontend Team
 * @since v6.4.0
 */

import type { TrainingPlan } from "../types/training";

export const TRAINING_PLAN_LIFECYCLE = {
    OPERATIONAL: "operational",
    FUTURE: "future",
    PAST: "past",
    COMPLETED: "completed",
    PAUSED: "paused",
    CANCELLED: "cancelled",
} as const;

export type TrainingPlanLifecycleStatus =
    (typeof TRAINING_PLAN_LIFECYCLE)[keyof typeof TRAINING_PLAN_LIFECYCLE];

export interface TrainingPlanDisplayBadge {
    key: string;
    label: string;
}

/** DESIGN.md §12.7 — formato base de badges de estado */
export const TRAINING_PLAN_STATUS_BADGE_BASE =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

/**
 * Clases por estado — DESIGN.md §12.7 (Activo, Programado, Completado, Cancelado, Advertencia).
 */
export const TRAINING_PLAN_STATUS_BADGE_CLASS: Record<string, string> = {
    operational: "bg-success/10 text-success border-success/30",
    active: "bg-success/10 text-success border-success/30",
    future: "bg-primary/10 text-primary border-primary/30",
    past: "bg-muted text-muted-foreground border-border",
    completed: "bg-muted text-muted-foreground border-border",
    paused: "bg-warning/10 text-warning border-warning/30",
    cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const LIFECYCLE_BADGES: Record<string, TrainingPlanDisplayBadge> = {
    operational: { key: "operational", label: "Activo" },
    future: { key: "future", label: "Futuro" },
    past: { key: "past", label: "Completado" },
    completed: { key: "completed", label: "Completado" },
    paused: { key: "paused", label: "Pausado" },
    cancelled: { key: "cancelled", label: "Cancelado" },
};

const STATUS_FALLBACK_BADGES: Record<string, TrainingPlanDisplayBadge> = {
    active: { key: "active", label: "Activo" },
    completed: { key: "completed", label: "Completado" },
    paused: { key: "paused", label: "Pausado" },
    cancelled: { key: "cancelled", label: "Cancelado" },
};

export function resolveTrainingPlanDisplayBadge(
    plan: Pick<TrainingPlan, "status" | "lifecycle_status">,
): TrainingPlanDisplayBadge {
    const lifecycle = plan.lifecycle_status?.toLowerCase();
    if (lifecycle && LIFECYCLE_BADGES[lifecycle]) {
        return LIFECYCLE_BADGES[lifecycle];
    }
    const status = (plan.status || "").toLowerCase();
    return (
        STATUS_FALLBACK_BADGES[status] ?? {
            key: status || "unknown",
            label: plan.status || "—",
        }
    );
}

/** Clase completa del badge (base + variante DESIGN.md) para un plan. */
export function trainingPlanLifecycleBadgeClass(
    plan: Pick<TrainingPlan, "status" | "lifecycle_status">,
): string {
    const badge = resolveTrainingPlanDisplayBadge(plan);
    const variant =
        TRAINING_PLAN_STATUS_BADGE_CLASS[badge.key] ??
        "bg-muted text-muted-foreground border-border";
    return `${TRAINING_PLAN_STATUS_BADGE_BASE} ${variant}`;
}
