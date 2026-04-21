/**
 * SessionCalendar.tsx — Calendario mensual de sesiones de entrenamiento
 *
 * Migrado a BaseMonthCalendar. Renderiza badges de sesión y estado.
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v9.0.0 - Removed legacy planning overlay (monthly/weekly/daily)
 */

import React, { useMemo, useCallback } from "react";
import { BaseMonthCalendar, type CalendarDayInfo } from "@/components/ui/calendar/BaseMonthCalendar";
import type { PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";

export type SessionCalendarSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

export interface SessionCalendarProps {
    sessions: SessionCalendarSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date, sessionsForDay: SessionCalendarSession[]) => void;
}

function parseSessionDateLocal(sessionDate: string | null | undefined): Date | null {
    if (!sessionDate) return null;
    const match = String(sessionDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return new Date(sessionDate);
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
}

export const SessionCalendar: React.FC<SessionCalendarProps> = ({
    sessions,
    currentMonth,
    onMonthChange,
    onDateClick,
}) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const sessionsByDay = useMemo(() => {
        const map = new Map<number, SessionCalendarSession[]>();
        sessions.forEach((session) => {
            const sessionDate = parseSessionDateLocal(session.session_date);
            if (!sessionDate || sessionDate.getFullYear() !== year || sessionDate.getMonth() !== month) return;
            const day = sessionDate.getDate();
            if (!map.has(day)) map.set(day, []);
            map.get(day)!.push(session);
        });
        return map;
    }, [sessions, year, month]);

    const handleDateClick = useCallback(
        (day: number) => {
            if (onDateClick) {
                onDateClick(new Date(year, month, day), sessionsByDay.get(day) || []);
            }
        },
        [onDateClick, year, month, sessionsByDay]
    );

    const renderCell = useCallback(
        (dayInfo: CalendarDayInfo) => {
            const { dayOfMonth, isToday } = dayInfo;
            const hasSessions = sessionsByDay.has(dayOfMonth);

            return (
                <div
                    onClick={() => handleDateClick(dayOfMonth)}
                    className={`
                        bg-surface min-h-[80px] md:min-h-[100px] p-1 md:p-2
                        transition-all cursor-pointer flex flex-col items-center justify-start
                        ${hasSessions ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/20"}
                        ${isToday ? "ring-2 ring-primary/30 ring-inset" : ""}
                    `}
                >
                    <span
                        className={`text-xs md:text-sm font-medium mb-1 ${
                            isToday
                                ? "text-primary font-bold"
                                : hasSessions
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                        }`}
                    >
                        {dayOfMonth}
                    </span>

                    {hasSessions && (
                        <span className="text-[10px] md:text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-medium border border-primary/30">
                            Sesión
                        </span>
                    )}
                </div>
            );
        },
        [sessionsByDay, handleDateClick]
    );

    const footer = useMemo(
        () => (
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/30 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-border bg-muted/50" />
                    <span>Programada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-success bg-success/20" />
                    <span>Completada</span>
                </div>
            </div>
        ),
        []
    );

    return (
        <BaseMonthCalendar
            currentMonth={currentMonth}
            onMonthChange={onMonthChange}
            renderCell={renderCell}
            footer={footer}
            className="border border-border"
        />
    );
};
