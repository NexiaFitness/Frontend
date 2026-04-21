/**
 * ScheduledSessionCalendar.tsx — Calendario mensual de sesiones agendadas
 *
 * Usa BaseMonthCalendar como base reutilizable.
 * Renderiza mini-cards de sesiones agendadas dentro de cada celda.
 *
 * @author NEXIA Frontend Team
 * @since v1.0.0
 * @updated v8.1.0 — Migrado a BaseMonthCalendar + design tokens
 */

import React, { useMemo } from "react";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import { BaseMonthCalendar, type CalendarDayInfo } from "@/components/ui/calendar";
import { ScheduledSessionCard } from "./ScheduledSessionCard";

export interface ScheduledSessionCalendarProps {
    sessions: ScheduledSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date) => void;
    onSessionClick?: (session: ScheduledSession) => void;
}

export const ScheduledSessionCalendar: React.FC<ScheduledSessionCalendarProps> = ({
    sessions,
    currentMonth,
    onMonthChange,
    onDateClick,
    onSessionClick,
}) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const sessionsInMonth = useMemo(() => {
        return sessions.filter((session) => {
            const d = new Date(session.scheduled_date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
    }, [sessions, year, month]);

    const sessionsByDay = useMemo(() => {
        const map = new Map<number, ScheduledSession[]>();
        sessionsInMonth.forEach((session) => {
            const day = new Date(session.scheduled_date).getDate();
            if (!map.has(day)) map.set(day, []);
            map.get(day)!.push(session);
        });
        return map;
    }, [sessionsInMonth]);

    const totalSessions = sessionsInMonth.length;

    const handleDateClick = (day: CalendarDayInfo) => {
        onDateClick?.(day.date);
    };

    const handleSessionClick = (session: ScheduledSession, e: React.MouseEvent) => {
        e.stopPropagation();
        onSessionClick?.(session);
    };

    const renderCell = (day: CalendarDayInfo) => {
        const daySessions = sessionsByDay.get(day.dayOfMonth) || [];
        const hasSessions = daySessions.length > 0;

        return (
            <button
                type="button"
                onClick={() => handleDateClick(day)}
                className={`
                    relative flex flex-col items-start justify-start p-1.5 md:p-2
                    min-h-[80px] md:min-h-[100px]
                    text-left transition-all cursor-pointer
                    ${hasSessions
                        ? "bg-surface hover:bg-surface-2"
                        : "bg-surface hover:bg-surface-2"
                    }
                    ${day.isToday ? "ring-1 ring-primary ring-inset" : ""}
                `}
            >
                <span
                    className={`
                        text-xs md:text-sm font-medium mb-1
                        ${day.isToday
                            ? "text-primary font-bold"
                            : hasSessions
                                ? "text-foreground"
                                : "text-muted-foreground"
                        }
                    `}
                >
                    {day.dayOfMonth}
                </span>

                <div className="w-full space-y-1 flex-1 overflow-y-auto">
                    {daySessions.slice(0, 3).map((session) => (
                        <div key={session.id} onClick={(e) => handleSessionClick(session, e)}>
                            <ScheduledSessionCard session={session} onClick={() => {}} />
                        </div>
                    ))}
                    {daySessions.length > 3 && (
                        <p className="text-[9px] text-muted-foreground px-1">
                            +{daySessions.length - 3} más
                        </p>
                    )}
                </div>
            </button>
        );
    };

    return (
        <BaseMonthCalendar
            currentMonth={currentMonth}
            onMonthChange={onMonthChange}
            renderCell={renderCell}
            subtitle={
                <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{totalSessions}</span>{" "}
                    {totalSessions === 1 ? "sesión agendada" : "sesiones agendadas"} este mes
                </p>
            }
            footer={
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-primary/20 border border-primary/40" />
                        <span>Agendada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-success/20 border border-success/40" />
                        <span>Confirmada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-muted border border-border" />
                        <span>Completada</span>
                    </div>
                </div>
            }
        />
    );
};
