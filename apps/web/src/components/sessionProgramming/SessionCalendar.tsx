/**
 * SessionCalendar.tsx — Calendario mensual de sesiones de entrenamiento
 *
 * Migrado a BaseMonthCalendar. Renderiza badges de sesión, origen de
 * planificación (M/S/D), volumen/intensidad y estado de entrenabilidad.
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v8.2.0 - Migrado a BaseMonthCalendar
 */

import React, { useMemo, useCallback } from "react";
import { BaseMonthCalendar, type CalendarDayInfo } from "@/components/ui/calendar/BaseMonthCalendar";
import type { PlanTrainingSession } from "@nexia/shared";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { ResolvedDayPlan } from "@nexia/shared/types/planningCargas";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";

export type SessionCalendarSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

export interface SessionCalendarProps {
    sessions: SessionCalendarSession[];
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    onDateClick?: (date: Date, sessionsForDay: SessionCalendarSession[]) => void;
    planningDays?: ResolvedDayPlan[];
}

const SOURCE_LABEL: Record<string, string> = {
    month: "M",
    week: "S",
    day: "D",
};

const SOURCE_SEMANTIC_LABEL: Record<string, string> = {
    month: "Heredado",
    week: "Override",
    day: "Override",
};

const SOURCE_BADGE_CLASSES: Record<string, string> = {
    month: "bg-muted text-muted-foreground border-border",
    week: "bg-primary/10 text-primary border-primary/30",
    day: "bg-success/10 text-success border-success/30",
};

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
    planningDays,
}) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const planningByDay = useMemo(() => {
        if (!planningDays || planningDays.length === 0) return new Map<number, ResolvedDayPlan>();
        const map = new Map<number, ResolvedDayPlan>();
        const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
        planningDays.forEach((plan) => {
            if (!plan.date || !plan.date.startsWith(monthStr)) return;
            const day = parseInt(plan.date.slice(8, 10), 10);
            if (day >= 1 && day <= 31) map.set(day, plan);
        });
        return map;
    }, [planningDays, year, month]);

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
            const plan = planningByDay.get(dayOfMonth);
            const sourceLabel = plan?.source ? SOURCE_LABEL[plan.source] ?? plan.source : null;
            const isTrainable = plan?.is_trainable ?? true;

            return (
                <div
                    onClick={() => handleDateClick(dayOfMonth)}
                    className={`
                        bg-surface min-h-[80px] md:min-h-[100px] p-1 md:p-2
                        transition-all cursor-pointer flex flex-col items-center justify-start
                        ${hasSessions ? "bg-muted/30 hover:bg-muted/50" : "hover:bg-muted/20"}
                        ${isToday ? "ring-2 ring-primary/30 ring-inset" : ""}
                        ${plan && !isTrainable ? "opacity-75" : ""}
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

                    {sourceLabel && plan?.source && (
                        <span
                            className={`text-[10px] font-medium px-1 py-0.5 rounded border mt-0.5 ${SOURCE_BADGE_CLASSES[plan.source] ?? "bg-warning/10 text-warning border-warning/30"}`}
                            title={`${SOURCE_SEMANTIC_LABEL[plan.source] ?? plan.source} (${plan.source === "month" ? "Mes" : plan.source === "week" ? "Semana" : "Día"})`}
                        >
                            {sourceLabel}
                        </span>
                    )}

                    {plan && (plan.resolved_volume != null || plan.resolved_intensity != null) && (
                        <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                            {plan.resolved_volume != null ? `V${Math.round(plan.resolved_volume * 100)}` : ""}
                            {plan.resolved_volume != null && plan.resolved_intensity != null ? "/" : ""}
                            {plan.resolved_intensity != null ? `I${Math.round(plan.resolved_intensity * 100)}` : ""}
                        </span>
                    )}

                    {plan && !isTrainable && (
                        <span className="text-[9px] font-medium text-destructive mt-0.5">
                            No ent.
                        </span>
                    )}
                </div>
            );
        },
        [sessionsByDay, planningByDay, handleDateClick]
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
                {planningDays && planningDays.length > 0 && (
                    <>
                        <div className="flex items-center gap-2">
                            <span className="px-1 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">M</span>
                            <span>Heredado (Mes)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-medium">S</span>
                            <span>Override (Semana)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-1 py-0.5 rounded bg-success/10 text-success border border-success/30 font-medium">D</span>
                            <span>Override (Día)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-destructive font-medium text-xs">No ent.</span>
                            <span>No entrenable</span>
                        </div>
                    </>
                )}
            </div>
        ),
        [planningDays]
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
