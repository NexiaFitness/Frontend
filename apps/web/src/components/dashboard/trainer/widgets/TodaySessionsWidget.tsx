/**
 * TodaySessionsWidget — Sesiones del día (dashboard premium).
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
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    TRAINER_DASHBOARD_COPY,
    TRAINER_DASHBOARD_COUNT_BADGE,
    TRAINER_DASHBOARD_EMPTY_TITLE,
    TRAINER_DASHBOARD_LINK,
    TRAINER_DASHBOARD_LIST,
    TRAINER_DASHBOARD_LIST_ITEM,
    TRAINER_DASHBOARD_LIST_ITEM_NAME,
    TRAINER_DASHBOARD_LIST_ITEM_TIME,
    TRAINER_DASHBOARD_LOADING_BLOCK,
    TRAINER_DASHBOARD_PRIMARY_CTA,
    TRAINER_DASHBOARD_SESSION_STATUS_BADGE,
    TRAINER_DASHBOARD_TYPE_CHIP,
    TRAINER_DASHBOARD_WIDGET,
    TRAINER_DASHBOARD_WIDGET_HEADER,
    TRAINER_DASHBOARD_WIDGET_TITLE,
    TRAINER_DASHBOARD_WIDGET_TITLE_ROW,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
    scheduled: "Planificada",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
};

const SESSION_TYPE_LABEL: Record<string, string> = {
    training: "Entrenamiento",
    consultation: "Consulta",
    assessment: "Evaluación",
};

function formatTime(_isoDate: string, startTime: string): string {
    return startTime.slice(0, 5);
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
        { skip: !trainerProfile?.id },
    );

    const { data: clientsData } = useGetTrainerClientsQuery(
        { trainerId: trainerProfile?.id ?? 0, page: 1, per_page: 50 },
        { skip: !trainerProfile?.id },
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
            <section className={TRAINER_DASHBOARD_WIDGET}>
                <NexiaGlassAccentRim />
                <div className={TRAINER_DASHBOARD_LOADING_BLOCK} />
            </section>
        );
    }

    const validSessions = (sessions as ScheduledSession[]).filter((s) => s.status !== "cancelled");

    return (
        <section className={TRAINER_DASHBOARD_WIDGET}>
            <NexiaGlassAccentRim />
            <div className={TRAINER_DASHBOARD_WIDGET_HEADER}>
                <div className={TRAINER_DASHBOARD_WIDGET_TITLE_ROW}>
                    <h2 className={TRAINER_DASHBOARD_WIDGET_TITLE}>{TRAINER_DASHBOARD_COPY.todayTitle}</h2>
                    <span className={TRAINER_DASHBOARD_COUNT_BADGE}>{validSessions.length}</span>
                </div>
            </div>

            {validSessions.length === 0 ? (
                <div className="py-6 text-center">
                    <p className={TRAINER_DASHBOARD_EMPTY_TITLE}>{TRAINER_DASHBOARD_COPY.noSessionsToday}</p>
                    <Button
                        variant="primary"
                        size="sm"
                        className={TRAINER_DASHBOARD_PRIMARY_CTA}
                        onClick={() => navigate("/dashboard/scheduling/new")}
                    >
                        {TRAINER_DASHBOARD_COPY.newAppointment}
                    </Button>
                </div>
            ) : (
                <>
                    <div className={TRAINER_DASHBOARD_LIST}>
                        {validSessions.slice(0, 5).map((session) => {
                            const client = clientMap.get(session.client_id);
                            return (
                                <button
                                    key={session.id}
                                    type="button"
                                    className={TRAINER_DASHBOARD_LIST_ITEM}
                                    onClick={() => navigate(`/dashboard/scheduling/${session.id}/edit`)}
                                >
                                    <span className={TRAINER_DASHBOARD_LIST_ITEM_TIME}>
                                        {formatTime(session.scheduled_date, session.start_time)}
                                    </span>
                                    <ClientAvatar
                                        clientId={session.client_id}
                                        nombre={client?.nombre}
                                        apellidos={client?.apellidos}
                                        size="sm"
                                        className="h-8 w-8 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className={TRAINER_DASHBOARD_LIST_ITEM_NAME}>
                                            {getClientName(session.client_id)}
                                        </p>
                                        <span className={TRAINER_DASHBOARD_TYPE_CHIP}>
                                            {SESSION_TYPE_LABEL[session.session_type] || session.session_type}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "shrink-0",
                                            TRAINER_DASHBOARD_SESSION_STATUS_BADGE[session.status],
                                        )}
                                    >
                                        {SESSION_STATUS_LABEL[session.status]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/scheduling")}
                        className={cn(TRAINER_DASHBOARD_LINK, "mt-3")}
                    >
                        {TRAINER_DASHBOARD_COPY.viewSchedule}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                </>
            )}
        </section>
    );
};
