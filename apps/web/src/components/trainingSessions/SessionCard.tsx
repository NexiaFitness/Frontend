/**
 * SessionCard Component
 * Card para mostrar una sesión de entrenamiento con métricas y estado
 * 
 * Reutilizable en: TrainingPlanDetail, ClientWorkoutsTab
 * 
 * @author Frontend Team - NEXIA
 * @since v6.0.0
 */

import React from "react";
import type { PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";

// Union type para compatibilidad durante transición
// Ambos tipos tienen campos compatibles para visualización
type SessionCardSession = PlanTrainingSession | LegacyTrainingSession;

interface SessionCardProps {
    session: SessionCardSession;
    onEdit?: (session: SessionCardSession) => void;
    onDelete?: (session: SessionCardSession) => void;
    onViewDetail?: (session: SessionCardSession) => void;
}

interface MetricItemProps {
    label: string;
    value: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => {
    return (
        <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
        </div>
    );
};

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    onEdit,
    onDelete,
    onViewDetail,
}) => {
    const getStatusBadge = (status: string) => {
        const badges = {
            completed: { bg: "bg-green-100", text: "text-green-800", label: "Completada" },
            planned: { bg: "bg-blue-100", text: "text-blue-800", label: "Planificada" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada" },
            in_progress: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En progreso" },
            skipped: { bg: "bg-gray-100", text: "text-gray-800", label: "Saltada" },
            modified: { bg: "bg-orange-100", text: "text-orange-800", label: "Modificada" },
        };
        return badges[status as keyof typeof badges] || badges.planned;
    };

    const badge = getStatusBadge(session.status);

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-gray-900">
                            {session.session_name}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${badge.bg} ${badge.text}`}>
                            {badge.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        📅 {session.session_date ? new Date(session.session_date).toLocaleDateString() : "Sin fecha"} • {session.session_type}
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {session.planned_duration && (
                    <MetricItem
                        label="Duración plan."
                        value={`${session.planned_duration} min`}
                    />
                )}
                {session.actual_duration && (
                    <MetricItem
                        label="Duración real"
                        value={`${session.actual_duration} min`}
                    />
                )}
                {session.planned_intensity && (
                    <MetricItem
                        label="Intensidad plan."
                        value={session.planned_intensity.toFixed(1)}
                    />
                )}
                {session.actual_intensity && (
                    <MetricItem
                        label="Intensidad real"
                        value={session.actual_intensity.toFixed(1)}
                    />
                )}
                {session.planned_volume && (
                    <MetricItem
                        label="Volumen plan."
                        value={session.planned_volume.toString()}
                    />
                )}
                {session.actual_volume && (
                    <MetricItem
                        label="Volumen real"
                        value={session.actual_volume.toString()}
                    />
                )}
            </div>

            {session.notes && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-600">{session.notes}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
                {onViewDetail && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(session)}
                        className="w-full md:w-auto"
                    >
                        Ver Detalles
                    </Button>
                )}
                {onEdit && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(session)}
                        className="w-full md:w-auto"
                    >
                        Editar
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(session)}
                        className="w-full md:w-auto"
                    >
                        Eliminar
                    </Button>
                )}
            </div>
        </div>
    );
};

