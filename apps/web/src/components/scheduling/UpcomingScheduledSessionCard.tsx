/**
 * UpcomingScheduledSessionCard.tsx — Card para mostrar próxima sesión agendada
 *
 * Contexto:
 * - Componente para sidebar de SchedulingPage
 * - Muestra detalles de próxima cita o mensaje si no hay
 * - Diseño similar a UpcomingSessionCard pero para ScheduledSession
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React from "react";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import { SCHEDULED_SESSION_TYPE, SESSION_STATUS } from "@nexia/shared/types/scheduling";

interface UpcomingScheduledSessionCardProps {
    session: ScheduledSession | null;
    onSessionClick?: () => void;
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
    });
};

const formatTime = (timeStr: string): string => {
    return timeStr.substring(0, 5); // HH:mm
};

const getSessionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        [SCHEDULED_SESSION_TYPE.TRAINING]: "Entrenamiento",
        [SCHEDULED_SESSION_TYPE.CONSULTATION]: "Consulta",
        [SCHEDULED_SESSION_TYPE.ASSESSMENT]: "Evaluación",
    };
    return labels[type] || type;
};

const getStatusBadgeColor = (status: string): string => {
    const colors: Record<string, string> = {
        [SESSION_STATUS.SCHEDULED]: "bg-blue-100 text-blue-700",
        [SESSION_STATUS.CONFIRMED]: "bg-green-100 text-green-700",
        [SESSION_STATUS.COMPLETED]: "bg-slate-100 text-slate-700",
        [SESSION_STATUS.CANCELLED]: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
};

export const UpcomingScheduledSessionCard: React.FC<UpcomingScheduledSessionCardProps> = ({
    session,
    onSessionClick,
}) => {
    if (!session) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">
                    Próxima Sesión
                </h3>
                <p className="text-sm text-slate-500 italic">
                    No hay sesiones próximas
                </p>
            </div>
        );
    }

    return (
        <div
            className={`bg-white rounded-lg shadow p-4 ${onSessionClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            onClick={onSessionClick}
        >
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
                Próxima Sesión
            </h3>

            <div className="space-y-2">
                <div>
                    <p className="text-2xl font-bold text-slate-800 mb-1">
                        {formatDate(session.scheduled_date)}
                    </p>
                    <p className="text-sm text-slate-600">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-700">
                        {getSessionTypeLabel(session.session_type)}
                    </span>
                    <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(session.status)}`}
                    >
                        {session.status === SESSION_STATUS.SCHEDULED ? "Agendada" :
                            session.status === SESSION_STATUS.CONFIRMED ? "Confirmada" :
                            session.status === SESSION_STATUS.COMPLETED ? "Completada" :
                            "Cancelada"}
                    </span>
                </div>

                {session.location && (
                    <p className="text-xs text-slate-500">
                        📍 {session.location}
                    </p>
                )}

                {session.notes && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                        {session.notes}
                    </p>
                )}
            </div>
        </div>
    );
};

