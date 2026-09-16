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

import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronDown, Calendar } from "lucide-react";
import { useGetClientQuery, useGetClientTrainingSessionsQuery } from "@nexia/shared/api/clientsApi";
import { useGetStandaloneSessionsByClientQuery } from "@nexia/shared/api/standaloneSessionsApi";
import { useGetScheduledSessionsQuery } from "@nexia/shared/api/schedulingApi";
import { isDateInRange, parseISODateLocal } from "@nexia/shared/utils/periodBlockOverlap";
import type { TrainingSession } from "@nexia/shared/types/training";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import type { PlanTrainingSession } from "@nexia/shared";
import { ClientActivePlanScheduleLayout } from "@/components/clients/session/ClientActivePlanScheduleLayout";
import { ClientActivePlanSummaryPanel } from "@/components/clients/session/ClientActivePlanSummaryPanel";
import { ClientSessionPickDayPanel } from "@/components/clients/session/ClientSessionPickDayPanel";
import { PlanningShellBodyLayout } from "@/components/trainingPlans/periodization/PlanningShellBodyLayout";
import { PeriodizationCalendar } from "@/components/trainingPlans/periodization/PeriodizationCalendar";
import { IDLE_PERIOD_BLOCK_FORM_STATE } from "@/components/trainingPlans/periodization/usePeriodBlockForm";
import { PLANNING_SHELL_PANEL_STACK } from "@/components/trainingPlans/periodization/planningShellPresentation";
import { useClientActivePlanSessionSchedule } from "@/hooks/clients/useClientActivePlanSessionSchedule";
import { SessionCard } from "@/components/trainingSessions";
import { SESSION_CARD_LIST_ITEM_CLASS } from "@/components/trainingSessions/sessionCardPresentation";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    CLIENT_SESSIONS_APPOINTMENT_CARD,
    CLIENT_SESSIONS_APPOINTMENT_INNER,
    CLIENT_SESSIONS_APPOINTMENT_META,
    CLIENT_SESSIONS_APPOINTMENT_TITLE,
    CLIENT_SESSIONS_EMPTY_FILTER,
    CLIENT_SESSIONS_FILTER_CHIP,
    CLIENT_SESSIONS_FILTER_ROW,
    CLIENT_SESSIONS_LIST,
    CLIENT_SESSIONS_LIST_COUNT,
    CLIENT_SESSIONS_LIST_EYEBROW,
    CLIENT_SESSIONS_LIST_SECTION,
    CLIENT_SESSIONS_LIST_TOGGLE,
    CLIENT_SESSIONS_TAB_STACK,
} from "@/components/clients/session/clientSessionsTabPresentation";
import { DashboardFixedFooter, PageTitle } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/buttons";
import { PaginationBar } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { useToast } from "@/components/ui/feedback";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import {
    CLIENT_SESSIONS_CALENDAR_SECTION_ID,
    clearSessionsFocus,
    isSessionsCalendarFocus,
    scrollToClientSessionsCalendar,
} from "@/utils/clientSessionsUrl";
import { useReplicateSessionFlow } from "@/components/sessions/useReplicateSessionFlow";
import { ReplicateSessionModal } from "@/components/sessions/ReplicateSessionModal";
import { ReplicateSessionConflictModal } from "@/components/sessions/ReplicateSessionConflictModal";

interface ClientSessionsTabProps {
    clientId: number;
}

type ListFilter = "all" | "planned" | "completed" | "cancelled" | "appointment";

const LIST_PAGE_SIZE = 10;

const EMPTY_EXCEPTION_DATES = new Set<string>();

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
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { showWarning } = useToast();
    const initialMonth = useMemo(() => {
        const monthParam = searchParams.get("month");
        if (monthParam) {
            const parsed = parseISODateLocal(monthParam);
            if (parsed) return parsed;
        }
        return new Date();
    }, [searchParams]);
    const [currentMonth, setCurrentMonth] = useState(() => initialMonth);
    const [periodCalMonth, setPeriodCalMonth] = useState(() => initialMonth);
    const [pickedSessionDate, setPickedSessionDate] = useState<string | null>(null);
    const calendarFocusPendingRef = useRef(isSessionsCalendarFocus(searchParams));

    useEffect(() => {
        const monthParam = searchParams.get("month");
        if (!monthParam) return;
        const parsed = parseISODateLocal(monthParam);
        if (!parsed) return;
        setPeriodCalMonth(parsed);
        setCurrentMonth(parsed);
    }, [searchParams]);

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
            const existingOnDay = planSessions.find((s) => s.session_date === dateStr);
            if (existingOnDay?.id) {
                navigate(
                    `/dashboard/session-programming/sessions/${existingOnDay.id}`,
                    { state: returnToStateFromView(location) },
                );
                return;
            }
            const qs = new URLSearchParams({ clientId: String(clientId), date: dateStr, planId: String(activePlanForClient.id) });
            navigate(
                `/dashboard/session-programming/create-session?${qs.toString()}`,
                { replace: false }
            );
        },
        [activePlanForClient, clientId, navigate, showWarning, planSessions, location]
    );
    const [listFilter, setListFilter] = useState<ListFilter>("all");
    const [listPage, setListPage] = useState(1);
    const [replicateSession, setReplicateSession] = useState<SessionListItem | null>(null);

    const replicateFlow = useReplicateSessionFlow(
        replicateSession && replicateSession.session_kind === "training"
            ? {
                  id: replicateSession.id,
                  session_date: replicateSession.session_date,
                  session_name: replicateSession.session_name,
                  training_plan_id: replicateSession.training_plan_id ?? null,
                  period_block_id: replicateSession.period_block_id ?? null,
              }
            : { id: 0, session_date: null, session_name: '', training_plan_id: null, period_block_id: null }
    );
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

    useLayoutEffect(() => {
        if (!calendarFocusPendingRef.current) return;
        if (isLoading) return;

        calendarFocusPendingRef.current = false;
        scrollToClientSessionsCalendar();
        setSearchParams((prev) => clearSessionsFocus(prev), { replace: true });
    }, [isLoading, setSearchParams]);

    const isError = isErrorSessions || isErrorStandalone || isErrorScheduled;
    const errorMessage =
        sessionsError && typeof sessionsError === "object" && "data" in sessionsError
            ? String((sessionsError as { data: unknown }).data)
            : "No se pudieron cargar los datos";

    const handleAddSession = useCallback(() => {
        navigate(`/dashboard/session-programming/create-session?clientId=${clientId}`);
    }, [clientId, navigate]);

    const handleCreateSessionOnPickedDay = useCallback(() => {
        if (pickedSessionDate) {
            navigate(
                `/dashboard/session-programming/create-session?clientId=${clientId}&date=${pickedSessionDate}`,
            );
            return;
        }
        handleAddSession();
    }, [clientId, handleAddSession, navigate, pickedSessionDate]);

    const handleScheduleAppointment = () => {
        navigate(`/dashboard/scheduling/new?clientId=${clientId}`);
    };

    const handleSessionClickScheduled = (session: ScheduledSession) => {
        navigate(`/dashboard/scheduling/${session.id}/edit`);
    };

    const handleViewSessionDetail = (session: SessionListItem | PlanTrainingSession | TrainingSession) => {
        const path = "session_kind" in session && session.session_kind === "standalone"
            ? `/dashboard/standalone-sessions/${session.id}`
            : `/dashboard/session-programming/sessions/${session.id}`;
        navigate(path, { state: returnToStateFromView(location) });
    };

    const handleReplicate = (session: SessionListItem | PlanTrainingSession | TrainingSession) => {
        if ("session_kind" in session && session.session_kind === "training" && session.period_block_id) {
            setReplicateSession(session as SessionListItem);
            setTimeout(() => replicateFlow.openModal(), 0);
        }
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

    const sessionDatesForCalendar = useMemo(() => {
        const set = new Set<string>();
        allSessions.forEach((s) => {
            const raw = s.session_date;
            if (!raw) return;
            const match = String(raw).match(/^(\d{4}-\d{2}-\d{2})/);
            set.add(match ? match[1] : String(raw).slice(0, 10));
        });
        return set;
    }, [allSessions]);

    const navigateToSessionItem = useCallback(
        (s: SessionListItem) => {
            const path =
                s.session_kind === "standalone"
                    ? `/dashboard/standalone-sessions/${s.id}`
                    : `/dashboard/session-programming/sessions/${s.id}`;
            navigate(path, { state: returnToStateFromView(location) });
        },
        [location, navigate],
    );

    const handleNoPlanCalendarDay = useCallback(
        (dateStr: string) => {
            const onDay = allSessions.filter((s) => {
                const raw = s.session_date;
                if (!raw) return false;
                const match = String(raw).match(/^(\d{4}-\d{2}-\d{2})/);
                const iso = match ? match[1] : String(raw).slice(0, 10);
                return iso === dateStr;
            });
            if (onDay.length > 0 && onDay[0]?.id) {
                navigateToSessionItem(onDay[0]);
                return;
            }
            setPickedSessionDate(dateStr);
        },
        [allSessions, navigateToSessionItem],
    );

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
        <section className={CLIENT_SESSIONS_TAB_STACK}>
            <PageTitle titleAs="h3" title="Sesiones del cliente" />

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
                <PlanningShellBodyLayout
                    variant="createWhen"
                    data-testid="client-sessions-no-plan-schedule"
                    main={
                        <div
                            id={CLIENT_SESSIONS_CALENDAR_SECTION_ID}
                            data-testid="client-sessions-calendar"
                            className="min-w-0 scroll-mt-24"
                        >
                            <PeriodizationCalendar
                                currentMonth={currentMonth}
                                onMonthChange={setCurrentMonth}
                                blocks={[]}
                                sessionDates={sessionDatesForCalendar}
                                exceptionDates={EMPTY_EXCEPTION_DATES}
                                formState={IDLE_PERIOD_BLOCK_FORM_STATE}
                                onDayClick={handleNoPlanCalendarDay}
                                sessionPickerDate={pickedSessionDate}
                                habitualTrainingDays={clientProfile?.training_days ?? null}
                            />
                        </div>
                    }
                    sidebar={
                        <div className={PLANNING_SHELL_PANEL_STACK}>
                            <ClientSessionPickDayPanel
                                selectedDate={pickedSessionDate}
                                onCreateSession={handleCreateSessionOnPickedDay}
                            />
                        </div>
                    }
                />
            )}

            <div className={CLIENT_SESSIONS_LIST_SECTION}>
                <button
                    type="button"
                    onClick={() => setListOpen((v) => !v)}
                    className={CLIENT_SESSIONS_LIST_TOGGLE}
                >
                    <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${listOpen ? "" : "-rotate-90"}`}
                        aria-hidden
                    />
                    <h4 className={CLIENT_SESSIONS_LIST_EYEBROW}>Lista cronológica</h4>
                    <span className={CLIENT_SESSIONS_LIST_COUNT}>
                        {sessionCount > 0 && `${sessionCount} sesión${sessionCount !== 1 ? "es" : ""}`}
                        {sessionCount > 0 && appointmentCount > 0 && " · "}
                        {appointmentCount > 0 && `${appointmentCount} cita${appointmentCount !== 1 ? "s" : ""}`}
                        {sessionCount === 0 && appointmentCount === 0 && "vacía"}
                    </span>
                </button>

                {listOpen && (
                    <div className="mt-3 space-y-3">
                        <div className={CLIENT_SESSIONS_FILTER_ROW}>
                            {LIST_FILTER_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleFilterChange(value)}
                                    className={CLIENT_SESSIONS_FILTER_CHIP(listFilter === value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {filteredList.length === 0 ? (
                            <p className={CLIENT_SESSIONS_EMPTY_FILTER}>
                                No hay sesiones ni citas que coincidan con los filtros.
                            </p>
                        ) : (
                            <>
                                <ul className={CLIENT_SESSIONS_LIST}>
                                    {paginatedList.map((entry) => {
                                        if (entry.type === "session") {
                                            const s = entry.item as SessionListItem;
                                            return (
                                                <li
                                                    key={`s-${s.session_kind}-${s.id}`}
                                                    className={SESSION_CARD_LIST_ITEM_CLASS}
                                                >
                                                    <SessionCard
                                                        session={s}
                                                        onViewDetail={handleViewSessionDetail}
                                                        onReplicate={s.session_kind === "training" ? handleReplicate : undefined}
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
                                                    className={CLIENT_SESSIONS_APPOINTMENT_CARD}
                                                >
                                                    <NexiaGlassAccentRim />
                                                    <div className={CLIENT_SESSIONS_APPOINTMENT_INNER}>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className={CLIENT_SESSIONS_APPOINTMENT_TITLE}>
                                                                {SCHED_TYPE_LABEL[s.session_type] ?? s.session_type}
                                                            </h4>
                                                            <span
                                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.cls}`}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        </div>
                                                        <p className={CLIENT_SESSIONS_APPOINTMENT_META}>
                                                            <Calendar className="inline h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />{" "}
                                                            {new Date(s.scheduled_date + "T12:00:00").toLocaleDateString("es-ES", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                            {" · "}
                                                            {s.start_time}–{s.end_time}
                                                        </p>
                                                        {s.notes ? (
                                                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                                                {s.notes}
                                                            </p>
                                                        ) : null}
                                                    </div>
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

            <ReplicateSessionModal
                isOpen={replicateFlow.isOpen}
                onClose={() => replicateFlow.setIsOpen(false)}
                weeks={replicateFlow.weeks}
                selectedWeeks={replicateFlow.selectedWeeks}
                onToggleWeek={replicateFlow.toggleWeek}
                onReplicate={replicateFlow.handleReplicate}
                isLoading={replicateFlow.isReplicating}
                sessionName={replicateSession?.session_name ?? ''}
                hasBlock={replicateFlow.hasBlock}
                isBlockLoading={replicateFlow.isBlockLoading}
            />
            <ReplicateSessionConflictModal
                isOpen={replicateFlow.isConflictOpen}
                onClose={replicateFlow.handleCancelConflict}
                onConfirmReplace={replicateFlow.handleConfirmReplace}
                conflicts={replicateFlow.pendingConflicts}
                createdCount={replicateFlow.createdCount}
                isLoading={replicateFlow.isReplicating}
            />

            <DashboardFixedFooter>
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        onClick={handleScheduleAppointment}
                    >
                        <Calendar className="size-3.5 shrink-0" aria-hidden />
                        Agendar cita
                    </Button>
                    <Button type="button" variant="primary" size="sm" onClick={handleAddSession}>
                        + Crear sesión
                    </Button>
                </div>
            </DashboardFixedFooter>
        </section>
    );
};
