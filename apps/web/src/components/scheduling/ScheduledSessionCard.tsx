/**
 * ScheduledSessionCard.tsx — Mini-card para mostrar sesión agendada en calendario
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v8.1.0 — Migrado a design tokens
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

const getStatusClasses = (status: string): string => {
    const classes: Record<string, string> = {
        [SESSION_STATUS.SCHEDULED]: "bg-primary/15 text-primary",
        [SESSION_STATUS.CONFIRMED]: "bg-success/15 text-success",
        [SESSION_STATUS.COMPLETED]: "bg-muted text-muted-foreground",
        [SESSION_STATUS.CANCELLED]: "bg-destructive/15 text-destructive",
    };
    return classes[status] || "bg-muted text-muted-foreground";
};

const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
        [SESSION_STATUS.SCHEDULED]: "Agendada",
        [SESSION_STATUS.CONFIRMED]: "Confirmada",
        [SESSION_STATUS.COMPLETED]: "Completada",
        [SESSION_STATUS.CANCELLED]: "Cancelada",
    };
    return labels[status] || status;
};

export const ScheduledSessionCard: React.FC<ScheduledSessionCardProps> = ({
    session,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className="w-full p-1.5 bg-card border border-border/50 rounded-md hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer text-left"
        >
            <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                        {session.start_time}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {getSessionTypeLabel(session.session_type)}
                    </p>
                </div>
                <span
                    className={`text-[9px] px-1 py-0.5 rounded font-medium flex-shrink-0 ${getStatusClasses(session.status)}`}
                >
                    {getStatusLabel(session.status)}
                </span>
            </div>
        </div>
    );
};
