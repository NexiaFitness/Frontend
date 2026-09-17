/**
 * TodaySessionsWidget — Sesiones de entrenamiento del día (dashboard premium).
 * QA-10 / G7: listado unificado GET /sessions (programa + suelta), no solo citas.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetSessionsQuery } from "@nexia/shared/api/sessionsApi";
import { useGetTrainerClientsQuery } from "@nexia/shared/api/clientsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import type { SessionOut } from "@nexia/shared/types/sessions";
import { formatLocalDateOnly } from "@nexia/shared/training/activePeriodBlock";
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

const SESSION_STATUS_LABEL: Record<string, string> = {
    planned: "Planificada",
    completed: "Completada",
    cancelled: "Cancelada",
};

const SESSION_KIND_LABEL: Record<string, string> = {
    training: "Programa",
    standalone: "Sesión libre",
};

function formatSessionTime(session: SessionOut): string {
    if (session.session_time) {
        return session.session_time.slice(0, 5);
    }
    if (session.planned_duration) {
        return `${session.planned_duration} min`;
    }
    return "—";
}

function getTrainingSessionDetailUrl(s: SessionOut): string {
    return s.session_kind === "training"
        ? `/dashboard/session-programming/sessions/${s.id}`
        : `/dashboard/standalone-sessions/${s.id}`;
}

export const TodaySessionsWidget: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined, {
        skip: !isAuthenticated,
    });

    const today = formatLocalDateOnly(new Date());
    const { data: sessionsResponse, isLoading } = useGetSessionsQuery(
        {
            trainerId: trainerProfile?.id ?? 0,
            dateFrom: today,
            dateTo: today,
            limit: 20,
            orderBy: "session_date",
            order: "asc",
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

    const getClientName = (session: SessionOut) => {
        if (session.client_name?.trim()) return session.client_name.trim();
        const c = clientMap.get(session.client_id);
        return c ? `${c.nombre} ${c.apellidos}`.trim() : `Cliente #${session.client_id}`;
    };

    if (isLoading) {
        return (
            <section className={TRAINER_DASHBOARD_WIDGET}>
                <NexiaGlassAccentRim />
                <div className={TRAINER_DASHBOARD_LOADING_BLOCK} />
            </section>
        );
    }

    const validSessions = (sessionsResponse?.items ?? []).filter((s) => s.status !== "cancelled");

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
                    <p className={TRAINER_DASHBOARD_EMPTY_TITLE}>{TRAINER_DASHBOARD_COPY.noTrainingSessionsToday}</p>
                    <Button
                        variant="primary"
                        size="sm"
                        className={TRAINER_DASHBOARD_PRIMARY_CTA}
                        onClick={() => navigate("/dashboard/sessions")}
                    >
                        {TRAINER_DASHBOARD_COPY.viewAllSessions}
                    </Button>
                </div>
            ) : (
                <>
                    <div className={TRAINER_DASHBOARD_LIST}>
                        {validSessions.slice(0, 5).map((session) => {
                            const client = clientMap.get(session.client_id);
                            return (
                                <button
                                    key={`${session.session_kind}-${session.id}`}
                                    type="button"
                                    className={TRAINER_DASHBOARD_LIST_ITEM}
                                    onClick={() => navigate(getTrainingSessionDetailUrl(session))}
                                >
                                    <span className={TRAINER_DASHBOARD_LIST_ITEM_TIME}>
                                        {formatSessionTime(session)}
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
                                            {getClientName(session)}
                                        </p>
                                        <span className={TRAINER_DASHBOARD_TYPE_CHIP}>
                                            {SESSION_KIND_LABEL[session.session_kind] ?? session.session_type}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "shrink-0",
                                            TRAINER_DASHBOARD_SESSION_STATUS_BADGE[
                                                session.status as keyof typeof TRAINER_DASHBOARD_SESSION_STATUS_BADGE
                                            ] ?? TRAINER_DASHBOARD_SESSION_STATUS_BADGE.planned,
                                        )}
                                    >
                                        {SESSION_STATUS_LABEL[session.status] ?? session.status}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/sessions")}
                        className={cn(TRAINER_DASHBOARD_LINK, "mt-3")}
                    >
                        {TRAINER_DASHBOARD_COPY.viewAllSessions}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                </>
            )}
        </section>
    );
};
