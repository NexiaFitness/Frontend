/**
 * TrainingPlanHeader.tsx — Header del detalle del training plan
 *
 * Contexto:
 * - Header con info básica del plan y actions principales
 * - Patrón similar a ClientHeader
 * - Actions: Edit Plan, Delete Plan, Add Macrocycle
 *
 * Responsabilidades:
 * - Mostrar info básica del plan (nombre, fechas, goal, status)
 * - Cliente asignado (si aplica)
 * - Botones de acción rápida
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import type { TrainingPlan } from "@nexia/shared/types/training";
import { useDeleteTrainingPlanMutation } from "@nexia/shared/api/trainingPlansApi";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";

interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    clientName?: string; // Nombre del cliente asignado (si aplica)
    onRefresh: () => void;
    onAddMacrocycle: () => void;
}

export const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({
    plan,
    clientName,
    onRefresh,
    onAddMacrocycle,
}) => {
    const navigate = useNavigate();
    const [deletePlan, { isLoading: isDeleting }] = useDeleteTrainingPlanMutation();

    // Formatear fechas
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Calcular duración del plan
    const getDuration = (): string => {
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        if (weeks < 4) return `${weeks} semanas`;
        const months = Math.floor(weeks / 4);
        return `${months} ${months === 1 ? "mes" : "meses"}`;
    };

    // Badge de status
    const getStatusBadge = () => {
        const statusColors: Record<string, string> = {
            active: "bg-green-100 text-green-800",
            completed: "bg-blue-100 text-blue-800",
            paused: "bg-yellow-100 text-yellow-800",
            cancelled: "bg-red-100 text-red-800",
        };

        const color = statusColors[plan.status] || "bg-gray-100 text-gray-800";

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {plan.status}
            </span>
        );
    };

    const handleEdit = () => {
        // TODO: Implementar edición inline o modal
        alert("Edit Plan - TODO: Implementar en Fase 3");
    };

    const handleDelete = async () => {
        if (!window.confirm(`¿Estás seguro de eliminar el plan "${plan.name}"?`)) return;

        try {
            await deletePlan(plan.id).unwrap();
            navigate("/dashboard/training-plans");
        } catch (error) {
            console.error("Error deleting plan:", error);
            alert("Error al eliminar el plan. Intenta de nuevo.");
        }
    };

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Top row: Icon + Info + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left: Icon + Info */}
                    <div className="flex items-center gap-4 lg:gap-6">
                        {/* Plan Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <svg
                                    className="w-10 h-10 lg:w-12 lg:h-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Plan Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className={`${TYPOGRAPHY.cardTitle} text-gray-900`}>
                                    {plan.name}
                                </h1>
                                {getStatusBadge()}
                            </div>

                            {/* Metrics row */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Goal:</span> {plan.goal}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Duration:</span> {getDuration()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Dates:</span>{" "}
                                    {formatDate(plan.start_date)} → {formatDate(plan.end_date)}
                                </span>
                                {clientName && (
                                    <span className="flex items-center gap-1">
                                        <span className="font-medium">Client:</span> {clientName}
                                    </span>
                                )}
                            </div>

                            {/* Description (if exists) */}
                            {plan.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {plan.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap gap-2 lg:gap-3">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddMacrocycle}
                            className="flex-1 lg:flex-initial"
                        >
                            + Add Macrocycle
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                            className="flex-1 lg:flex-initial"
                        >
                            Edit Plan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 lg:flex-initial text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            {isDeleting ? "Deleting..." : "Delete Plan"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="lg:ml-2"
                            title="Refresh data"
                        >
                            ↻
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};