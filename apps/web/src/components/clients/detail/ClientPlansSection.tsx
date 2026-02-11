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
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[160px]">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    const hasPlans = trainingPlans && trainingPlans.length > 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                        Planes de Entrenamiento
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
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
                            className="block w-full text-left p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                            aria-label={`Ver plan ${plan.name}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {plan.name}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-0.5">
                                        {formatDateRange(plan.start_date, plan.end_date)}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                            {PLAN_GOAL_LABELS[plan.goal] ?? plan.goal}
                                        </span>
                                        <span
                                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                plan.status === "active"
                                                    ? "bg-green-50 text-green-700"
                                                    : plan.status === "completed"
                                                      ? "bg-gray-100 text-gray-700"
                                                      : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {STATUS_LABELS[plan.status] ?? plan.status}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-slate-400 shrink-0" aria-hidden>
                                    →
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="mt-4 p-6 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                    <p className="text-slate-600 text-sm mb-4">
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
