/**
 * ClientPlansSection.tsx — Sección de planes de entrenamiento del cliente
 *
 * Contexto:
 * - Muestra los planes asignados al cliente en el tab Resumen
 * - CTA "Crear plan" cuando no hay planes o para crear uno adicional
 * - Enlace al detalle de cada plan y a la creación con clientId pre-seleccionado
 *
 * Responsabilidades:
 * - Lista de planes con nombre, fechas, estado, enlace al detalle
 * - Estado vacío con CTA prominente
 * - Botón Crear plan siempre visible en el header de la sección
 *
 * @author Frontend Team
 * @since v6.3.0 - Plan visible desde cliente + Crear plan desde cliente
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientPlansSectionProps {
    clientId: number;
    trainingPlans: TrainingPlan[];
    isLoading: boolean;
}

const PLAN_GOAL_LABELS: Record<string, string> = {
    "Muscle Gain": "Ganancia de Músculo",
    "Weight Loss": "Pérdida de Peso",
    "Strength": "Fuerza",
    "Endurance": "Resistencia",
    "General Fitness": "Fitness General",
    "Rehabilitation": "Rehabilitación",
    "Performance": "Rendimiento",
};

const STATUS_LABELS: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
};

function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })} – ${endDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })}`;
}

export const ClientPlansSection: React.FC<ClientPlansSectionProps> = ({
    clientId,
    trainingPlans,
    isLoading,
}) => {
    const navigate = useNavigate();
    const createPlanUrl = `/dashboard/training-plans/create?clientId=${clientId}`;

    if (!clientId || clientId <= 0) return null;

    if (isLoading) {
        return (
            <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-border bg-surface p-6">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    const hasPlans = trainingPlans && trainingPlans.length > 0;

    return (
        <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-foreground`}>
                        Planes de Entrenamiento
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {hasPlans
                            ? "Planes asignados a este cliente. Haz clic para ver el detalle."
                            : "Asigna un plan de entrenamiento para estructurar el programa del cliente."}
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(createPlanUrl)}
                    aria-label="Crear plan de entrenamiento para este cliente"
                >
                    Crear plan
                </Button>
            </div>

            {hasPlans ? (
                <div className="mt-4 space-y-3">
                    {trainingPlans.map((plan) => (
                        <button
                            key={plan.id}
                            type="button"
                            onClick={() =>
                                navigate(`/dashboard/training-plans/${plan.id}`)
                            }
                            className="block w-full rounded-lg border border-border bg-surface-2 p-4 text-left transition-colors hover:border-border hover:bg-muted/50"
                            aria-label={`Ver plan ${plan.name}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-foreground">{plan.name}</p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        {formatDateRange(plan.start_date, plan.end_date)}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary">
                                            {PLAN_GOAL_LABELS[plan.goal] ?? plan.goal}
                                        </span>
                                        <span
                                            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                                                plan.status === "active"
                                                    ? "bg-success/20 text-success"
                                                    : plan.status === "completed"
                                                      ? "bg-muted text-muted-foreground"
                                                      : "bg-warning/20 text-warning"
                                            }`}
                                        >
                                            {STATUS_LABELS[plan.status] ?? plan.status}
                                        </span>
                                    </div>
                                </div>
                                <span className="shrink-0 text-muted-foreground" aria-hidden>→</span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="mt-4 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                        Este cliente no tiene planes asignados. Crea el primero para
                        estructurar su programa de entrenamiento.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate(createPlanUrl)}
                        aria-label="Crear primer plan de entrenamiento"
                    >
                        Crear plan
                    </Button>
                </div>
            )}
        </div>
    );
};
