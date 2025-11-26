/**
 * ScheduledSessionCard.tsx — Mini-card para mostrar sesión agendada en calendario
 *
 * Contexto:
 * - Componente compacto para mostrar dentro de días del calendario
 * - Muestra hora, cliente y tipo de sesión
 * - Clickable para abrir modal de edición
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React from "react";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import { SCHEDULED_SESSION_TYPE, SESSION_STATUS } from "@nexia/shared/types/scheduling";

interface ScheduledSessionCardProps {
    session: ScheduledSession;
    onClick: () => void;
}

const getSessionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        [SCHEDULED_SESSION_TYPE.TRAINING]: "Entrenamiento",
        [SCHEDULED_SESSION_TYPE.CONSULTATION]: "Consulta",
        [SCHEDULED_SESSION_TYPE.ASSESSMENT]: "Evaluación",
    };
    return labels[type] || type;
};

const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        [SESSION_STATUS.SCHEDULED]: "bg-blue-100 text-blue-700",
        [SESSION_STATUS.CONFIRMED]: "bg-green-100 text-green-700",
        [SESSION_STATUS.COMPLETED]: "bg-slate-100 text-slate-700",
        [SESSION_STATUS.CANCELLED]: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
};

export const ScheduledSessionCard: React.FC<ScheduledSessionCardProps> = ({
    session,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className="w-full p-1.5 bg-white border border-slate-200 rounded-md hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer text-left"
        >
            <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                        {session.start_time}
                    </p>
                    <p className="text-[10px] text-slate-600 truncate">
                        {getSessionTypeLabel(session.session_type)}
                    </p>
                </div>
                <span
                    className={`text-[9px] px-1 py-0.5 rounded ${getStatusColor(session.status)} font-medium flex-shrink-0`}
                >
                    {session.status === SESSION_STATUS.SCHEDULED ? "Agendada" :
                        session.status === SESSION_STATUS.CONFIRMED ? "Confirmada" :
                        session.status === SESSION_STATUS.COMPLETED ? "Completada" :
                        "Cancelada"}
                </span>
            </div>
        </div>
    );
};

