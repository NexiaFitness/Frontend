/**
 * TodaySessionsWidget — Sesiones del día según DASHBOARD_LAYOUT_SPEC
 *
 * Muestra hasta N sesiones programadas para hoy. Estado vacío con botón "Nueva cita".
 * Link "Ver agenda completa" a /dashboard/scheduling.
 *
 * @author Frontend Team
 * @since v5.x - DASHBOARD_LAYOUT_SPEC
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetScheduledSessionsQuery } from "@nexia/shared/api/schedulingApi";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { ScheduledSession, SessionStatus } from "@nexia/shared/types/scheduling";
import { ArrowUpRight } from "lucide-react";
import { ClientAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/buttons";

const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
    scheduled: "Planificada",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
};

const sessionStatusStyle: Record<SessionStatus, string> = {
    scheduled: "bg-info/20 text-info",
    confirmed: "bg-success/20 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/20 text-destructive",
};

const SESSION_TYPE_LABEL: Record<string, string> = {
    training: "Entrenamiento",
    consultation: "Consulta",
    assessment: "Evaluación",
};

function formatTime(isoDate: string, startTime: string): string {
    return startTime.slice(0, 5); // HH:mm
}

export const TodaySessionsWidget: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const today = new Date().toISOString().slice(0, 10);
    const { data: sessions = [], isLoading } = useGetScheduledSessionsQuery(
        {
            trainer_id: trainerProfile?.id ?? 0,
            start_date: today,
            end_date: today,
            limit: 10,
        },
        { skip: !trainerProfile?.id }
    );

    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId: trainerProfile?.id ?? 0, page: 1, per_page: 50 },
        { skip: !trainerProfile?.id }
    );

    const clientMap = React.useMemo(() => {
        const map = new Map<number, { nombre: string; apellidos: string }>();
        (clientsData?.items || []).forEach((c) => {
            map.set(c.id, { nombre: c.nombre, apellidos: c.apellidos });
        });
        return map;
    }, [clientsData]);

    const getClientName = (clientId: number) => {
        const c = clientMap.get(clientId);
        return c ? `${c.nombre} ${c.apellidos}`.trim() : `Cliente #${clientId}`;
    };

    if (isLoading) {
        return (
            <div>
                <div className="mb-4 flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Hoy</h2>
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">—</span>
                </div>
                <div className="h-32 rounded-lg bg-surface animate-pulse" />
            </div>
        );
    }

    const validSessions = (sessions as ScheduledSession[]).filter((s) => s.status !== "cancelled");

    return (
        <div>
            <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">Hoy</h2>
                <span className="rounded-full bg-info/20 px-2.5 py-0.5 text-xs font-semibold text-info">
                    {validSessions.length}
                </span>
            </div>

            {validSessions.length === 0 ? (
                <div className="rounded-lg bg-surface p-8 text-center">
                    <p className="text-muted-foreground">No tienes sesiones programadas hoy.</p>
                    <Button
                        variant="primary"
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate("/dashboard/scheduling/new")}
                    >
                        Nueva cita
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {validSessions.slice(0, 5).map((session) => {
                        const client = clientMap.get(session.client_id);
                        return (
                            <div
                                key={session.id}
                                className="flex w-full cursor-pointer items-center gap-4 rounded-lg bg-surface p-4 transition-colors hover:bg-surface-2"
                                onClick={() => navigate(`/dashboard/scheduling/${session.id}/edit`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        navigate(`/dashboard/scheduling/${session.id}/edit`);
                                    }
                                }}
                            >
                                <span className="w-12 shrink-0 font-mono text-sm text-muted-foreground">
                                    {formatTime(session.scheduled_date, session.start_time)}
                                </span>
                                <ClientAvatar
                                    clientId={session.client_id}
                                    nombre={client?.nombre}
                                    apellidos={client?.apellidos}
                                    size="sm"
                                    className="h-8 w-8 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">
                                        {getClientName(session.client_id)}
                                    </p>
                                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                                        {SESSION_TYPE_LABEL[session.session_type] || session.session_type}
                                    </span>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sessionStatusStyle[session.status]}`}
                                >
                                    {SESSION_STATUS_LABEL[session.status]}
                                </span>
                            </div>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/scheduling")}
                        className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        Ver agenda completa
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};
