/**
 * SessionCalendar.tsx — Calendario mensual de sesiones de entrenamiento
 *
 * Glass shell alineado con planificación. Tokens: sessionCalendarPresentation.ts
 */

import React, { useMemo, useCallback } from "react";
import { BaseMonthCalendar, type CalendarDayInfo } from "@/components/ui/calendar/BaseMonthCalendar";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import {
    CLIENT_SESSIONS_CALENDAR_SHELL,
    CLIENT_SESSIONS_CALENDAR_WRAP,
} from "@/components/clients/session/clientSessionsTabPresentation";
import {
    SESSION_CALENDAR_BADGE,
    SESSION_CALENDAR_CELL_BASE,
    SESSION_CALENDAR_CELL_HAS_SESSION,
    SESSION_CALENDAR_CELL_SELECTED,
    SESSION_CALENDAR_CELL_TODAY,
    SESSION_CALENDAR_DAY_NUM,
    SESSION_CALENDAR_DAY_NUM_ACTIVE,
    SESSION_CALENDAR_DAY_NUM_MUTED,
    SESSION_CALENDAR_DAY_NUM_TODAY,
    SESSION_CALENDAR_INNER_CLASS,
    SESSION_CALENDAR_LEGEND,
    SESSION_CALENDAR_LEGEND_SWATCH,
} from "./sessionCalendarPresentation";

export type SessionCalendarSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

export interface SessionCalendarProps {
    sessions: SessionCalendarSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date, sessionsForDay: SessionCalendarSession[]) => void;
    /** ISO local YYYY-MM-DD — resalta el día elegido (panel «Nueva sesión»). */
    selectedDateIso?: string | null;
}

function parseSessionDateLocal(sessionDate: string | null | undefined): Date | null {
    if (!sessionDate) return null;
    const match = String(sessionDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return new Date(sessionDate);
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
}

function isoFromParts(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
}

export const SessionCalendar: React.FC<SessionCalendarProps> = ({
    sessions,
    currentMonth,
    onMonthChange,
    onDateClick,
    selectedDateIso = null,
}) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const sessionsByDay = useMemo(() => {
        const map = new Map<number, SessionCalendarSession[]>();
        sessions.forEach((session) => {
            const sessionDate = parseSessionDateLocal(session.session_date);
            if (!sessionDate || sessionDate.getFullYear() !== year || sessionDate.getMonth() !== month) {
                return;
            }
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
        [onDateClick, year, month, sessionsByDay],
    );

    const renderCell = useCallback(
        (dayInfo: CalendarDayInfo) => {
            const { dayOfMonth, isToday } = dayInfo;
            const hasSessions = sessionsByDay.has(dayOfMonth);
            const dayIso = isoFromParts(year, month, dayOfMonth);
            const isSelected =
                selectedDateIso != null && selectedDateIso === dayIso;

            return (
                <div
                    onClick={() => handleDateClick(dayOfMonth)}
                    className={cn(
                        SESSION_CALENDAR_CELL_BASE,
                        hasSessions && SESSION_CALENDAR_CELL_HAS_SESSION,
                        isToday && SESSION_CALENDAR_CELL_TODAY,
                        isSelected && SESSION_CALENDAR_CELL_SELECTED,
                    )}
                >
                    <span
                        className={cn(
                            SESSION_CALENDAR_DAY_NUM,
                            isToday
                                ? SESSION_CALENDAR_DAY_NUM_TODAY
                                : hasSessions
                                  ? SESSION_CALENDAR_DAY_NUM_ACTIVE
                                  : SESSION_CALENDAR_DAY_NUM_MUTED,
                        )}
                    >
                        {dayOfMonth}
                    </span>

                    {hasSessions ? (
                        <span className={SESSION_CALENDAR_BADGE}>Sesión</span>
                    ) : null}
                </div>
            );
        },
        [sessionsByDay, handleDateClick, year, month, selectedDateIso],
    );

    const footer = useMemo(
        () => (
            <div className={SESSION_CALENDAR_LEGEND}>
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            SESSION_CALENDAR_LEGEND_SWATCH,
                            "border-border/60 bg-surface/50",
                        )}
                    />
                    <span>Programada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            SESSION_CALENDAR_LEGEND_SWATCH,
                            "border-success/40 bg-success/15",
                        )}
                    />
                    <span>Completada</span>
                </div>
            </div>
        ),
        [],
    );

    return (
        <div className={CLIENT_SESSIONS_CALENDAR_WRAP} data-testid="client-sessions-calendar">
            <div className={CLIENT_SESSIONS_CALENDAR_SHELL}>
                <NexiaGlassAccentRim />
                <BaseMonthCalendar
                    currentMonth={currentMonth}
                    onMonthChange={onMonthChange}
                    renderCell={renderCell}
                    footer={footer}
                    className={SESSION_CALENDAR_INNER_CLASS}
                />
            </div>
        </div>
    );
};
