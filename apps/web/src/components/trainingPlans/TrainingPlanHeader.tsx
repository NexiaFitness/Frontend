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

interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    clientName?: string; // Nombre del cliente asignado (si aplica)
    onRefresh: () => void;
    onAddMacrocycle: () => void;
}

export const TrainingPlanHeader: React.FC<TrainingPlanHeaderProps> = ({
    plan,
    clientName,
    onRefresh: _onRefresh,
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

        const statusLabels: Record<string, string> = {
            active: "Activo",
            completed: "Completado",
            paused: "Pausado",
            cancelled: "Cancelado",
        };

        const color = statusColors[plan.status] || "bg-gray-100 text-gray-800";
        const label = statusLabels[plan.status] || plan.status;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {label}
            </span>
        );
    };

    const handleEdit = () => {
        navigate(`/dashboard/training-plans/${plan.id}/edit`);
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
            <div className="px-4 sm:px-6 lg:px-8 pt-10 pb-6">
                {/* Fila 1: Icono + Nombre + Métricas + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12 mb-6">
                    {/* Left: Icono + Info */}
                    <div className="flex items-start gap-4 flex-1">
                        {/* Plan Icon */}
                        <div className="flex-shrink-0">
                            <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md"
                                style={{
                                    background: 'linear-gradient(135deg, #4A67B3 0%, #3a5db3 50%, #2d4a9e 100%)',
                                }}
                            >
                                <svg
                                    className="w-8 h-8"
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
                        <div className="flex-1">
                            {/* Nombre */}
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                {plan.name}
                            </h1>

                            {/* Metrics Grid - Similar a ClientHeader */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-1 text-sm">
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Objetivo</span>
                                    <p className="text-gray-900 font-medium">{plan.goal}</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Duración</span>
                                    <p className="text-gray-900 font-medium">{getDuration()}</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Inicio</span>
                                    <p className="text-gray-900 font-medium">{formatDate(plan.start_date)}</p>
                                </div>
                                <div>
                                    <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Fin</span>
                                    <p className="text-gray-900 font-medium">{formatDate(plan.end_date)}</p>
                                </div>
                                {clientName ? (
                                    <div>
                                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Cliente</span>
                                        <p className="text-gray-900 font-medium">{clientName}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Estado</span>
                                        <div className="mt-0.5">
                                            {getStatusBadge()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions - Botones en columna */}
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onAddMacrocycle}
                        >
                            + Añadir Macrociclo
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEdit}
                        >
                            Editar Plan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar Plan"}
                        </Button>
                    </div>
                </div>

                {/* Línea azul debajo de Fila 1 */}
                <div className="border-b mb-4" style={{ borderColor: '#4A67B3' }}></div>

                {/* Fila 2: Estado y Descripción */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Estado */}
                    <div>
                        <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Estado</span>
                        <div className="mt-0.5">
                            {getStatusBadge()}
                        </div>
                    </div>

                    {/* Descripción (si existe) */}
                    {plan.description && (
                        <div className="md:col-span-2 lg:col-span-3">
                            <span className="text-xs uppercase tracking-wide" style={{ color: '#4A67B3' }}>Descripción</span>
                            <p className="text-gray-900 font-medium text-sm mt-0.5">{plan.description}</p>
                        </div>
                    )}
                </div>

                {/* Línea azul debajo de Fila 2 (si hay descripción) */}
                {plan.description && (
                    <div className="border-b mb-4" style={{ borderColor: '#4A67B3' }}></div>
                )}
            </div>
        </div>
    );
};