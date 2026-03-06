/**
 * ClientSessionsTab.tsx — Tab unificado "Sesiones" del cliente
 *
 * Propósito:
 * - Vista única: sesiones de entrenamiento + citas agendadas.
 * - Calendario mensual para sesiones de entrenamiento.
 * - Sección "Citas agendadas" como lista ordenada de cards (sin calendario).
 * - Lista cronológica unificada con filtros.
 * - Botones: Crear sesión, Agendar cita.
 *
 * Contexto:
 * - Ola 1 TICK-S01/S02: reúne datos de sesiones y entrenamientos del cliente.
 * - Consume useGetClientTrainingSessionsQuery y useGetScheduledSessionsQuery.
 *
 * Mantenimiento:
 * - Tipos desde @nexia/shared (TrainingSession, ScheduledSession).
 *
 * @author Frontend Team
 * @since v6.2.0 - Ola 1 Sesiones unificadas
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetClientTrainingSessionsQuery } from "@nexia/shared/api/clientsApi";
import { useGetScheduledSessionsQuery } from "@nexia/shared/api/schedulingApi";
import type { TrainingSession } from "@nexia/shared/types/training";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import {
    SCHEDULED_SESSION_TYPE,
    SESSION_STATUS,
} from "@nexia/shared/types/scheduling";
import type { PlanTrainingSession } from "@nexia/shared";
import { SessionCalendar } from "@/components/sessionProgramming";
import { SessionCard } from "@/components/trainingSessions";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";

interface ClientSessionsTabProps {
    clientId: number;
}

type ListFilterType = "all" | "session" | "appointment";
type SessionStatusFilter = "all" | "planned" | "completed" | "cancelled";

const SESSION_TYPE_LABELS: Record<string, string> = {
    [SCHEDULED_SESSION_TYPE.TRAINING]: "Entrenamiento",
    [SCHEDULED_SESSION_TYPE.CONSULTATION]: "Consulta",
    [SCHEDULED_SESSION_TYPE.ASSESSMENT]: "Evaluación",
};

const SESSION_STATUS_LABELS: Record<string, string> = {
    [SESSION_STATUS.SCHEDULED]: "Agendada",
    [SESSION_STATUS.CONFIRMED]: "Confirmada",
    [SESSION_STATUS.COMPLETED]: "Completada",
    [SESSION_STATUS.CANCELLED]: "Cancelada",
};

const SESSION_STATUS_STYLES: Record<string, string> = {
    [SESSION_STATUS.SCHEDULED]: "bg-primary/10 text-primary border-primary/30",
    [SESSION_STATUS.CONFIRMED]: "bg-success/10 text-success border-success/30",
    [SESSION_STATUS.COMPLETED]: "bg-muted text-muted-foreground border-border",
    [SESSION_STATUS.CANCELLED]: "bg-destructive/10 text-destructive border-destructive/30",
};

/** Fecha del mes en formato YYYY-MM-DD para el rango de scheduled */
function monthToStartEnd(date: Date): { start_date: string; end_date: string } {
    const y = date.getFullYear();
    const m = date.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return {
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
    };
}

export const ClientSessionsTab: React.FC<ClientSessionsTabProps> = ({ clientId }) => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [listFilterType, setListFilterType] = useState<ListFilterType>("all");
    const [sessionStatusFilter, setSessionStatusFilter] = useState<SessionStatusFilter>("all");

    const { start_date: startDate, end_date: endDate } = useMemo(
        () => monthToStartEnd(currentMonth),
        [currentMonth]
    );

    const {
        data: trainingSessions = [],
        isLoading: isLoadingSessions,
        isError: isErrorSessions,
        error: sessionsError,
    } = useGetClientTrainingSessionsQuery(
        { clientId, skip: 0, limit: 1000 },
        { refetchOnMountOrArgChange: true }
    );

    const {
        data: scheduledSessions = [],
        isLoading: isLoadingScheduled,
        isError: isErrorScheduled,
    } = useGetScheduledSessionsQuery({
        client_id: clientId,
        start_date: startDate,
        end_date: endDate,
        skip: 0,
        limit: 500,
    });

    const isLoading = isLoadingSessions || isLoadingScheduled;
    const isError = isErrorSessions || isErrorScheduled;
    const errorMessage =
        sessionsError && typeof sessionsError === "object" && "data" in sessionsError
            ? String((sessionsError as { data: unknown }).data)
            : "No se pudieron cargar los datos";

    const handleAddSession = () => {
        navigate(`/dashboard/clients/${clientId}/sessions/new`);
    };

    const handleScheduleAppointment = () => {
        navigate(`/dashboard/scheduling/new?clientId=${clientId}`);
    };

    const handleDateClickSession = (
        _date: Date,
        sessionsForDay: (PlanTrainingSession | TrainingSession)[]
    ) => {
        if (sessionsForDay.length > 0 && sessionsForDay[0]?.id) {
            navigate(`/dashboard/session-programming/sessions/${sessionsForDay[0].id}`);
        }
    };

    const handleSessionClickScheduled = (session: ScheduledSession) => {
        navigate(`/dashboard/scheduling/${session.id}/edit`);
    };

    const handleViewSessionDetail = (session: PlanTrainingSession | TrainingSession) => {
        navigate(`/dashboard/session-programming/sessions/${session.id}`);
    };

    // Lista unificada cronológica: sesiones + citas, ordenadas por fecha
    const mergedList = useMemo(() => {
        const items: Array<
            | { type: "session"; date: string; item: PlanTrainingSession | TrainingSession }
            | { type: "appointment"; date: string; item: ScheduledSession }
        > = [];
        trainingSessions.forEach((s) => {
            const d = s.session_date ?? "";
            if (d) items.push({ type: "session", date: d, item: s });
        });
        scheduledSessions.forEach((s) => {
            items.push({ type: "appointment", date: s.scheduled_date, item: s });
        });
        items.sort((a, b) => a.date.localeCompare(b.date) || 0);
        return items;
    }, [trainingSessions, scheduledSessions]);

    const filteredList = useMemo(() => {
        return mergedList.filter((entry) => {
            if (listFilterType === "session" && entry.type !== "session") return false;
            if (listFilterType === "appointment" && entry.type !== "appointment") return false;
            if (entry.type === "session") {
                const s = entry.item as PlanTrainingSession | TrainingSession;
                if (sessionStatusFilter === "all") return true;
                return s.status === sessionStatusFilter;
            }
            return true;
        });
    }, [mergedList, listFilterType, sessionStatusFilter]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-6">
                <Alert variant="error">{errorMessage}</Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-semibold text-foreground">
                    Sesiones
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Sesiones de entrenamiento y citas agendadas del cliente
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={handleAddSession}>
                    + Crear sesión
                </Button>
                <Button variant="outline" size="sm" onClick={handleScheduleAppointment}>
                    + Agendar cita
                </Button>
            </div>

            {/* Calendario de sesiones de entrenamiento */}
            <section className="rounded-xl border border-border p-4 sm:p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">
                    Sesiones de entrenamiento
                </h3>
                <SessionCalendar
                    sessions={trainingSessions}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onDateClick={handleDateClickSession}
                />
            </section>

            {/* Citas agendadas — lista ordenada por fecha, sin calendario */}
            <section className="rounded-xl border border-border p-4 sm:p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">
                    Citas agendadas
                </h3>
                {scheduledSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                        No hay citas agendadas para este mes.
                    </p>
                ) : (
                    <ul
                        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                        role="list"
                        aria-label="Lista de citas agendadas"
                    >
                        {[...scheduledSessions]
                            .sort(
                                (a, b) =>
                                    a.scheduled_date.localeCompare(b.scheduled_date) ||
                                    a.start_time.localeCompare(b.start_time)
                            )
                            .map((s) => (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSessionClickScheduled(s)}
                                        className="w-full text-left rounded-lg border border-border bg-transparent p-4 transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-foreground truncate">
                                                    {s.scheduled_date} · {s.start_time}–{s.end_time}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {SESSION_TYPE_LABELS[s.session_type] ?? s.session_type}
                                                </p>
                                            </div>
                                            <span
                                                className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-md border ${SESSION_STATUS_STYLES[s.status] ?? "bg-muted text-muted-foreground border-border"}`}
                                            >
                                                {SESSION_STATUS_LABELS[s.status] ?? s.status}
                                            </span>
                                        </div>
                                        <span className="inline-block mt-2 text-xs text-muted-foreground">
                                            Ver / Editar →
                                        </span>
                                    </button>
                                </li>
                            ))}
                    </ul>
                )}
            </section>

            {/* Lista cronológica con filtros */}
            <section className="rounded-xl border border-border p-4 sm:p-6">
                <h3 className="text-base font-semibold text-foreground mb-4">
                    Lista cronológica
                </h3>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
                    {(
                        [
                            { value: "all" as const, label: "Todos" },
                            { value: "session" as const, label: "Sesiones" },
                            { value: "appointment" as const, label: "Citas" },
                        ] as const
                    ).map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setListFilterType(value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                                listFilterType === value
                                    ? "border-primary text-primary bg-primary/10"
                                    : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {listFilterType === "all" || listFilterType === "session" ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-sm font-medium text-muted-foreground">Estado sesión:</span>
                        {(
                            [
                                { value: "all" as const, label: "Todos" },
                                { value: "planned" as const, label: "Planificadas" },
                                { value: "completed" as const, label: "Completadas" },
                                { value: "cancelled" as const, label: "Canceladas" },
                            ] as const
                        ).map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setSessionStatusFilter(value)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                                    sessionStatusFilter === value
                                        ? "border-primary text-primary bg-primary/10"
                                        : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                ) : null}

                {filteredList.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-4">
                        No hay sesiones ni citas que coincidan con los filtros.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {filteredList.map((entry) => {
                            if (entry.type === "session") {
                                return (
                                    <li key={`s-${entry.item.id}`}>
                                        <SessionCard
                                            session={entry.item}
                                            onViewDetail={handleViewSessionDetail}
                                        />
                                    </li>
                                );
                            }
                            const s = entry.item;
                            return (
                                <li
                                    key={`a-${s.id}`}
                                    className="rounded-lg border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
                                    onClick={() => handleSessionClickScheduled(s)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleSessionClickScheduled(s);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Cita
                                            </span>
                                            <p className="font-semibold text-foreground mt-0.5">
                                                {s.scheduled_date} · {s.start_time} - {s.end_time}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {s.session_type} · {s.status}
                                            </p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">Ver / Editar</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};
