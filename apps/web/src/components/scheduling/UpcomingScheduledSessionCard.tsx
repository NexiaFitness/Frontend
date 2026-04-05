/**
 * UpcomingScheduledSessionCard.tsx — Card para mostrar próxima sesión agendada
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v8.1.0 — Migrado a design tokens
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
    return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
};

const formatTime = (timeStr: string): string => timeStr.substring(0, 5);

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

export const UpcomingScheduledSessionCard: React.FC<UpcomingScheduledSessionCardProps> = ({
    session,
    onSessionClick,
}) => {
    if (!session) {
        return (
            <div className="rounded-lg bg-surface border border-border/50 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Próxima Sesión
                </h3>
                <p className="text-sm text-muted-foreground italic">
                    No hay sesiones próximas
                </p>
            </div>
        );
    }

    return (
        <div
            className={`rounded-lg bg-surface border border-border/50 p-5 transition-colors ${
                onSessionClick ? "cursor-pointer hover:border-primary/30" : ""
            }`}
            onClick={onSessionClick}
        >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Próxima Sesión
            </h3>

            <div className="space-y-2">
                <div>
                    <p className="text-2xl font-bold text-foreground mb-1">
                        {formatDate(session.scheduled_date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground">
                        {getSessionTypeLabel(session.session_type)}
                    </span>
                    <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusClasses(session.status)}`}
                    >
                        {getStatusLabel(session.status)}
                    </span>
                </div>

                {session.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {session.location}
                    </p>
                )}

                {session.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.notes}
                    </p>
                )}
            </div>
        </div>
    );
};
