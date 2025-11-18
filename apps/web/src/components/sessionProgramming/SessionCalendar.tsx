/**
 * SessionCalendar.tsx — Calendario mensual de sesiones de entrenamiento
 *
 * Contexto:
 * - Calendario simple sin librerías externas
 * - Muestra mes actual con navegación
 * - Badge "Session" en días con sesiones
 * - Grid responsive 7 columnas (Lun-Dom)
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import React, { useMemo } from "react";
import type { TrainingSession } from "@nexia/shared/types/training";

export interface SessionCalendarProps {
    sessions: TrainingSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date) => void;
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

export const SessionCalendar: React.FC<SessionCalendarProps> = ({
    sessions,
    currentMonth,
    onMonthChange,
    onDateClick,
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
            const sessionDate = new Date(session.session_date);
            return (
                sessionDate.getFullYear() === year &&
                sessionDate.getMonth() === month
            );
        });
    }, [sessions, year, month]);

    // Crear mapa de sesiones por día
    const sessionsByDay = useMemo(() => {
        const map = new Map<number, TrainingSession[]>();
        sessionsInMonth.forEach((session) => {
            const day = new Date(session.session_date).getDate();
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
                    const hasSessions = sessionsByDay.has(day);
                    const isCurrentDay = isToday(day);
                    const daySessions = sessionsByDay.get(day) || [];

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
                                items-center
                                justify-start
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

                            {/* Badge "Sesión" si hay sesiones */}
                            {hasSessions && (
                                <span className="text-[10px] md:text-xs px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full font-medium">
                                    Sesión
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-200" />
                    <span>Programada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400" />
                    <span>Completada</span>
                </div>
            </div>
        </div>
    );
};

