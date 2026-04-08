/**
 * ClientSessionsTab.tsx — Tab unificado "Sesiones" del cliente
 *
 * Propósito:
 * - Vista única: sesiones de entrenamiento + citas agendadas.
 * - Calendario mensual para sesiones de entrenamiento.
 * - Sección "Citas agendadas" como lista ordenada de cards (sin calendario).
 * - Lista cronológica unificada con filtros.
 * - Acciones en barra fija inferior (DashboardFixedFooter): Cancelar, Agendar cita, Crear sesión.
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

import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Calendar } from "lucide-react";
import { useGetClientQuery, useGetClientTrainingSessionsQuery } from "@nexia/shared/api/clientsApi";
import { useGetStandaloneSessionsByClientQuery } from "@nexia/shared/api/standaloneSessionsApi";
import { useGetScheduledSessionsQuery } from "@nexia/shared/api/schedulingApi";
import { isDateInRange } from "@nexia/shared/utils/periodBlockOverlap";
import type { TrainingSession } from "@nexia/shared/types/training";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import type { PlanTrainingSession } from "@nexia/shared";
import { SessionCalendar, type SessionCalendarSession } from "@/components/sessionProgramming";
import { ClientActivePlanScheduleLayout } from "@/components/clients/session/ClientActivePlanScheduleLayout";
import { ClientActivePlanSummaryPanel } from "@/components/clients/session/ClientActivePlanSummaryPanel";
import { useClientActivePlanSessionSchedule } from "@/hooks/clients/useClientActivePlanSessionSchedule";
import { SessionCard } from "@/components/trainingSessions";
import { DashboardFixedFooter, PageTitle } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { PaginationBar } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useToast } from "@/components/ui/feedback";

interface ClientSessionsTabProps {
    clientId: number;
}

type ListFilter = "all" | "planned" | "completed" | "cancelled" | "appointment";

const LIST_PAGE_SIZE = 9;

const LIST_FILTER_OPTIONS: { value: ListFilter; label: string }[] = [
    { value: "all", label: "Todo" },
    { value: "planned", label: "Planificadas" },
    { value: "completed", label: "Completadas" },
    { value: "cancelled", label: "Canceladas" },
    { value: "appointment", label: "Citas" },
];

const SCHED_TYPE_LABEL: Record<string, string> = {
    training: "Entrenamiento",
    consultation: "Consulta",
    assessment: "Evaluación",
};

const SCHED_STATUS_BADGE: Record<string, { cls: string; label: string }> = {
    scheduled: { cls: "bg-primary/10 text-primary border-primary/30", label: "Agendada" },
    confirmed: { cls: "bg-success/10 text-success border-success/30", label: "Confirmada" },
    completed: { cls: "bg-muted text-muted-foreground border-border", label: "Completada" },
    cancelled: { cls: "bg-destructive/10 text-destructive border-destructive/30", label: "Cancelada" },
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
    const { showWarning } = useToast();
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [periodCalMonth, setPeriodCalMonth] = useState(() => new Date());

    const {
        activePlanForClient,
        isLoadingActivePlan,
        periodBlocks,
        planSessions,
        sessionDatesInPlan,
        exceptionDates,
    } = useClientActivePlanSessionSchedule(clientId);

    const { data: clientProfile } = useGetClientQuery(clientId);

    const handlePeriodCalendarDay = useCallback(
        (dateStr: string) => {
            if (!activePlanForClient) return;
            if (!isDateInRange(dateStr, activePlanForClient.start_date, activePlanForClient.end_date)) {
                showWarning("Solo puedes abrir el constructor en fechas dentro de la vigencia del plan activo.", 4000);
                return;
            }
            navigate(
                `/dashboard/clients/${clientId}/sessions/new/constructor?date=${encodeURIComponent(dateStr)}`,
                { replace: false }
            );
        },
        [activePlanForClient, clientId, navigate, showWarning]
    );
    const [listFilter, setListFilter] = useState<ListFilter>("all");
    const [listPage, setListPage] = useState(1);
    const [listOpen, setListOpen] = useState(true);

    const handleFilterChange = useCallback((f: ListFilter) => {
        setListFilter(f);
        setListPage(1);
    }, []);

    const activeCalMonth = activePlanForClient ? periodCalMonth : currentMonth;

    const { start_date: startDate, end_date: endDate } = useMemo(
        () => monthToStartEnd(activeCalMonth),
        [activeCalMonth]
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
        data: standaloneSessions = [],
        isLoading: isLoadingStandalone,
        isError: isErrorStandalone,
    } = useGetStandaloneSessionsByClientQuery(
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

    const isLoading =
        isLoadingSessions || isLoadingStandalone || isLoadingScheduled || isLoadingActivePlan;
    const isError = isErrorSessions || isErrorStandalone || isErrorScheduled;
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

    const handleFooterCancel = () => {
        navigate(`/dashboard/clients/${clientId}`);
    };

    const handleDateClickSession = (
        _date: Date,
        sessionsForDay: SessionCalendarSession[]
    ) => {
        if (sessionsForDay.length > 0 && sessionsForDay[0]?.id) {
            const s = sessionsForDay[0];
            const path = "session_kind" in s && s.session_kind === "standalone"
                ? `/dashboard/standalone-sessions/${s.id}`
                : `/dashboard/session-programming/sessions/${s.id}`;
            navigate(path);
        }
    };

    const handleSessionClickScheduled = (session: ScheduledSession) => {
        navigate(`/dashboard/scheduling/${session.id}/edit`);
    };

    const handleViewSessionDetail = (session: SessionListItem | PlanTrainingSession | TrainingSession) => {
        const path = "session_kind" in session && session.session_kind === "standalone"
            ? `/dashboard/standalone-sessions/${session.id}`
            : `/dashboard/session-programming/sessions/${session.id}`;
        navigate(path);
    };

    // P2: Merge training + standalone en lista unificada para calendario y lista
    const allSessions: SessionListItem[] = useMemo(() => {
        const list: SessionListItem[] = [];
        trainingSessions.forEach((s) => {
            list.push({ ...s, session_kind: "training" as const });
        });
        standaloneSessions.forEach((s) => {
            list.push({ ...s, session_kind: "standalone" as const });
        });
        list.sort((a, b) => (b.session_date ?? "").localeCompare(a.session_date ?? ""));
        return list;
    }, [trainingSessions, standaloneSessions]);

    // Lista unificada cronológica: sesiones + citas, ordenadas por fecha
    const mergedList = useMemo(() => {
        const items: Array<
            | { type: "session"; date: string; item: SessionListItem }
            | { type: "appointment"; date: string; item: ScheduledSession }
        > = [];
        allSessions.forEach((s) => {
            const d = s.session_date ?? "";
            if (d) items.push({ type: "session", date: d, item: s });
        });
        scheduledSessions.forEach((s) => {
            items.push({ type: "appointment", date: s.scheduled_date, item: s });
        });
        items.sort((a, b) => b.date.localeCompare(a.date) || 0);
        return items;
    }, [allSessions, scheduledSessions]);

    const filteredList = useMemo(() => {
        if (listFilter === "all") return mergedList;
        if (listFilter === "appointment") return mergedList.filter((e) => e.type === "appointment");
        return mergedList.filter(
            (e) => e.type === "session" && (e.item as PlanTrainingSession | TrainingSession).status === listFilter,
        );
    }, [mergedList, listFilter]);

    const listTotalPages = Math.max(1, Math.ceil(filteredList.length / LIST_PAGE_SIZE));
    const safeListPage = Math.min(listPage, listTotalPages);

    const paginatedList = useMemo(
        () => filteredList.slice((safeListPage - 1) * LIST_PAGE_SIZE, safeListPage * LIST_PAGE_SIZE),
        [filteredList, safeListPage],
    );

    const handleListPageChange = useCallback((page: number) => {
        setListPage(page);
    }, []);

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

    const sessionCount = mergedList.filter((e) => e.type === "session").length;
    const appointmentCount = mergedList.filter((e) => e.type === "appointment").length;

    return (
        <section className="space-y-6 pb-24">
            {/* Header — same pattern as PlanPeriodizationSection */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <PageTitle titleAs="h3" title="Sesiones del cliente" />
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleScheduleAppointment}
                    >
                        + Agendar cita
                    </Button>
                    <Button type="button" variant="primary" size="sm" onClick={handleAddSession}>
                        + Crear sesión
                    </Button>
                </div>
            </div>

            {/* Calendar + Panel — directly in the tab, no wrapper div */}
            {activePlanForClient ? (
                <ClientActivePlanScheduleLayout
                    activePlan={activePlanForClient}
                    periodBlocks={periodBlocks}
                    sessionDates={sessionDatesInPlan}
                    exceptionDates={exceptionDates}
                    currentMonth={periodCalMonth}
                    onMonthChange={setPeriodCalMonth}
                    onDayClick={handlePeriodCalendarDay}
                    habitualTrainingDays={clientProfile?.training_days ?? null}
                    panelContent={
                        <ClientActivePlanSummaryPanel
                            clientId={clientId}
                            activePlan={activePlanForClient}
                            periodBlocks={periodBlocks}
                            planSessions={planSessions}
                            scheduledSessions={scheduledSessions}
                            onScheduledSessionClick={handleSessionClickScheduled}
                        />
                    }
                />
            ) : (
                <SessionCalendar
                    sessions={allSessions}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    onDateClick={handleDateClickSession}
                />
            )}

            {/* Collapsible chronological list */}
            <div>
                <button
                    type="button"
                    onClick={() => setListOpen((v) => !v)}
                    className="flex w-full items-center gap-2 group"
                >
                    <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${listOpen ? "" : "-rotate-90"}`}
                        aria-hidden
                    />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                        Lista cronológica
                    </h4>
                    <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                        {sessionCount > 0 && `${sessionCount} sesión${sessionCount !== 1 ? "es" : ""}`}
                        {sessionCount > 0 && appointmentCount > 0 && " · "}
                        {appointmentCount > 0 && `${appointmentCount} cita${appointmentCount !== 1 ? "s" : ""}`}
                        {sessionCount === 0 && appointmentCount === 0 && "vacía"}
                    </span>
                </button>

                {listOpen && (
                    <div className="mt-3 space-y-3">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            {LIST_FILTER_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleFilterChange(value)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                                        listFilter === value
                                            ? "border-primary text-primary bg-primary/10"
                                            : "border-border text-muted-foreground hover:border-input hover:text-foreground"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Items */}
                        {filteredList.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic py-3">
                                No hay sesiones ni citas que coincidan con los filtros.
                            </p>
                        ) : (
                            <>
                                <ul className="space-y-3">
                                    {paginatedList.map((entry) => {
                                        if (entry.type === "session") {
                                            const s = entry.item as SessionListItem;
                                            return (
                                                <li key={`s-${s.session_kind}-${s.id}`}>
                                                    <SessionCard
                                                        session={s}
                                                        onViewDetail={handleViewSessionDetail}
                                                    />
                                                </li>
                                            );
                                        }
                                        const s = entry.item;
                                        const badge = SCHED_STATUS_BADGE[s.status] ?? SCHED_STATUS_BADGE.scheduled;
                                        return (
                                            <li key={`a-${s.id}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSessionClickScheduled(s)}
                                                    className="w-full text-left rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                            <h4 className="text-base font-semibold text-foreground truncate">
                                                                {SCHED_TYPE_LABEL[s.session_type] ?? s.session_type}
                                                            </h4>
                                                            <span className={`shrink-0 px-2 py-1 text-xs font-medium rounded border ${badge.cls}`}>
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                                                        {new Date(s.scheduled_date + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                                                        {" · "}
                                                        {s.start_time}–{s.end_time}
                                                    </p>
                                                    {s.notes && (
                                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                            {s.notes}
                                                        </p>
                                                    )}
                                                    <span className="inline-block mt-2 text-xs font-medium text-primary">
                                                        Ver / Editar →
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <PaginationBar
                                    currentPage={safeListPage}
                                    totalPages={listTotalPages}
                                    totalItems={filteredList.length}
                                    pageSize={LIST_PAGE_SIZE}
                                    onPageChange={handleListPageChange}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            <DashboardFixedFooter>
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline-destructive"
                        size="sm"
                        onClick={handleFooterCancel}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleScheduleAppointment}
                    >
                        + Agendar cita
                    </Button>
                    <Button type="button" variant="primary" size="sm" onClick={handleAddSession}>
                        + Crear sesión
                    </Button>
                </div>
            </DashboardFixedFooter>
        </section>
    );
};
