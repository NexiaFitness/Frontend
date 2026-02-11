/**
 * ClientSessionsTab.tsx — Tab unificado "Sesiones" del cliente
 *
 * Propósito:
 * - Vista única que combina sesiones de entrenamiento y citas agendadas.
 * - Calendario mensual con dos capas: sesiones de entrenamiento + citas (scheduled sessions).
 * - Lista cronológica filtrable debajo del calendario.
 * - Botones de acción: Crear sesión, Agendar cita.
 *
 * Contexto:
 * - Ola 1 TICK-S01/S02: reúne datos de sesiones y entrenamientos del cliente.
 * - Consume useGetClientTrainingSessionsQuery y useGetScheduledSessionsQuery.
 * - No reemplaza los tabs existentes hasta TICK-S03; este componente existe para validar datos y UX.
 *
 * Mantenimiento:
 * - Tipos desde @nexia/shared (TrainingSession, ScheduledSession).
 * - No añadir lógica de negocio aquí; solo presentación y navegación.
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
import type { PlanTrainingSession } from "@nexia/shared";
import { SessionCalendar } from "@/components/sessionProgramming";
import { ScheduledSessionCalendar } from "@/components/scheduling";
import { SessionCard } from "@/components/trainingSessions";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientSessionsTabProps {
    clientId: number;
}

type ListFilterType = "all" | "session" | "appointment";
type SessionStatusFilter = "all" | "planned" | "completed" | "cancelled";

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
        navigate(`/dashboard/session-programming/create-session?clientId=${clientId}`);
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
        <div className="space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Sesiones
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
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

            {/* Calendario dual: dos capas (sesiones + citas) para el mismo mes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h2 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-3`}>
                        Sesiones de entrenamiento
                    </h2>
                    <SessionCalendar
                        sessions={trainingSessions}
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                        onDateClick={handleDateClickSession}
                    />
                </div>
                <div>
                    <h2 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-3`}>
                        Citas agendadas
                    </h2>
                    <ScheduledSessionCalendar
                        sessions={scheduledSessions}
                        currentMonth={currentMonth}
                        onMonthChange={setCurrentMonth}
                        onSessionClick={handleSessionClickScheduled}
                    />
                </div>
            </div>

            {/* Lista cronológica con filtros */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-4`}>
                    Lista cronológica
                </h2>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">Tipo:</span>
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
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors ${
                                listFilterType === value
                                    ? "border-[#4A67B3] text-[#4A67B3] bg-[#4A67B3]/5"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {listFilterType === "all" || listFilterType === "session" ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-sm font-medium text-gray-600">Estado sesión:</span>
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
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors ${
                                    sessionStatusFilter === value
                                        ? "border-[#4A67B3] text-[#4A67B3] bg-[#4A67B3]/5"
                                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                ) : null}

                {filteredList.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4">
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
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                Cita
                                            </span>
                                            <p className="font-semibold text-gray-900 mt-0.5">
                                                {s.scheduled_date} · {s.start_time} - {s.end_time}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {s.session_type} · {s.status}
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-500">Ver / Editar</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};
