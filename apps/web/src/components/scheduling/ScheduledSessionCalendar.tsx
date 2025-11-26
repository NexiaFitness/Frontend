/**
 * ScheduledSessionCalendar.tsx — Calendario mensual de sesiones agendadas
 *
 * Contexto:
 * - Calendario adaptado para ScheduledSession (citas/reuniones)
 * - Similar a SessionCalendar pero muestra mini-cards de sesiones
 * - Permite click en día vacío o en sesión existente
 * - Grid responsive 7 columnas (Lun-Dom)
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 */

import React, { useMemo } from "react";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import { ScheduledSessionCard } from "./ScheduledSessionCard";

export interface ScheduledSessionCalendarProps {
    sessions: ScheduledSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date) => void;
    onSessionClick?: (session: ScheduledSession) => void;
}

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

export const ScheduledSessionCalendar: React.FC<ScheduledSessionCalendarProps> = ({
    sessions,
    currentMonth,
    onMonthChange,
    onDateClick,
    onSessionClick,
}) => {
    // Obtener año y mes actual
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Obtener primer día del mes y último día
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Obtener día de la semana del primer día (0 = Domingo, ajustamos a Lunes = 0)
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Convierte Dom=0 a Lun=0

    // Filtrar sesiones del mes actual
    const sessionsInMonth = useMemo(() => {
        return sessions.filter((session) => {
            const sessionDate = new Date(session.scheduled_date);
            return (
                sessionDate.getFullYear() === year &&
                sessionDate.getMonth() === month
            );
        });
    }, [sessions, year, month]);

    // Crear mapa de sesiones por día
    const sessionsByDay = useMemo(() => {
        const map = new Map<number, ScheduledSession[]>();
        sessionsInMonth.forEach((session) => {
            const day = new Date(session.scheduled_date).getDate();
            if (!map.has(day)) {
                map.set(day, []);
            }
            map.get(day)!.push(session);
        });
        return map;
    }, [sessionsInMonth]);

    // Verificar si una fecha es hoy
    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };

    // Navegación de meses
    const handlePreviousMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        onMonthChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        onMonthChange(newDate);
    };

    // Manejar click en día
    const handleDateClick = (day: number) => {
        if (onDateClick) {
            const date = new Date(year, month, day);
            onDateClick(date);
        }
    };

    // Manejar click en sesión
    const handleSessionClick = (session: ScheduledSession, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onSessionClick) {
            onSessionClick(session);
        }
    };

    // Generar días del mes
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generar espacios vacíos al inicio para alinear el primer día
    const emptyDays = Array.from({ length: firstDayWeekday }, (_, i) => i);

    return (
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
            {/* Header con mes y navegación */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                    {MONTHS[month]} {year}
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Mes anterior"
                    >
                        <svg
                            className="w-5 h-5 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="Mes siguiente"
                    >
                        <svg
                            className="w-5 h-5 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Grid de días de la semana */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs md:text-sm font-semibold text-slate-600 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid de días del mes */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {/* Días vacíos al inicio */}
                {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {/* Días del mes */}
                {days.map((day) => {
                    const daySessions = sessionsByDay.get(day) || [];
                    const hasSessions = daySessions.length > 0;
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day}
                            onClick={() => handleDateClick(day)}
                            className={`
                                aspect-square
                                p-1 md:p-2
                                rounded-lg
                                border-2
                                transition-all
                                cursor-pointer
                                flex flex-col
                                items-start
                                justify-start
                                min-h-[80px] md:min-h-[100px]
                                ${hasSessions
                                    ? "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                    : "bg-white border-transparent hover:bg-slate-50"
                                }
                                ${isCurrentDay
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : ""
                                }
                            `}
                        >
                            {/* Número del día */}
                            <span
                                className={`
                                    text-xs md:text-sm
                                    font-medium
                                    mb-1
                                    ${isCurrentDay
                                        ? "text-blue-600 font-bold"
                                        : hasSessions
                                            ? "text-slate-700"
                                            : "text-slate-500"
                                    }
                                `}
                            >
                                {day}
                            </span>

                            {/* Mini-cards de sesiones */}
                            <div className="w-full space-y-1 flex-1 overflow-y-auto">
                                {daySessions.slice(0, 3).map((session) => (
                                    <div key={session.id} onClick={(e) => handleSessionClick(session, e)}>
                                        <ScheduledSessionCard
                                            session={session}
                                            onClick={() => {}}
                                        />
                                    </div>
                                ))}
                                {daySessions.length > 3 && (
                                    <p className="text-[9px] text-slate-500 px-1">
                                        +{daySessions.length - 3} más
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
                    <span>Agendada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                    <span>Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-100 border border-slate-300" />
                    <span>Completada</span>
                </div>
            </div>
        </div>
    );
};

