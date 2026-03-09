/**
 * useWeekPlanningData.ts — Hook para Vista semana L-D (Fase 5)
 *
 * Combina: planning calendar (ResolvedDayPlan por día), sesiones del plan,
 * coherencia por sesión. No incluye standalone sessions (decisión arquitectura).
 *
 * @author Frontend Team
 * @since Fase 5 — Vista semana L-D
 */

import { useMemo } from "react";
import { useGetPlanningCalendarQuery } from "../../api/planningApi";
import { useGetTrainingSessionsByClientQuery } from "../../api/trainingSessionsApi";
import type { ResolvedDayPlan } from "../../types/planningCargas";
import type { TrainingSession } from "../../types/trainingSessions";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

/** Fecha ISO YYYY-MM-DD */
function toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Obtiene el lunes de la semana N (1-4) dentro del mes.
 * Semana 1 = semana que contiene el día 1; semana 2 = siguiente, etc.
 */
export function getWeekStartDate(monthStr: string, week: number): Date {
    const [y, m] = monthStr.split("-").map(Number);
    const firstOfMonth = new Date(y, m - 1, 1);
    const weekday = (firstOfMonth.getDay() + 6) % 7;
    const firstMonday = new Date(y, m - 1, 1 - weekday);
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
    return weekStart;
}

/**
 * Genera las 7 fechas (L-D) de la semana a partir del lunes.
 */
export function getWeekDates(weekStart: Date): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        dates.push(toDateStr(d));
    }
    return dates;
}

export interface WeekDayData {
    date: string;
    dayLabel: string;
    planned: { volume: number | null; intensity: number | null };
    programmed: { volume: number | null; intensity: number | null } | null;
    session: TrainingSession | null;
    coherencePct: number | null;
    hasPlanSession: boolean;
}

interface UseWeekPlanningDataParams {
    clientId: number | null | undefined;
    planId: number;
    month: string | null | undefined;
    week: number;
}

interface UseWeekPlanningDataReturn {
    days: WeekDayData[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}

/**
 * Datos agregados para la vista semana: planificado, programado, coherencia por día.
 * Standalone sessions no se incluyen; si un día solo tiene standalone, se muestra "sin plan".
 */
export function useWeekPlanningData({
    clientId,
    planId,
    month,
    week,
}: UseWeekPlanningDataParams): UseWeekPlanningDataReturn {
    const weekStart = useMemo(
        () => (month ? getWeekStartDate(month, week) : null),
        [month, week]
    );
    const weekDates = useMemo(
        () => (weekStart ? getWeekDates(weekStart) : []),
        [weekStart]
    );

    const { data: calendarData, isLoading: calendarLoading } = useGetPlanningCalendarQuery(
        { client_id: clientId!, month: month! },
        { skip: !clientId || !month }
    );

    const { data: sessions = [], isLoading: sessionsLoading } = useGetTrainingSessionsByClientQuery(
        clientId ?? 0,
        { skip: clientId == null || clientId === 0 }
    );

    const sessionsInWeekByDate = useMemo(() => {
        const map = new Map<string, TrainingSession[]>();
        const planSessions = sessions.filter(
            (s) => s.training_plan_id === planId && s.session_date
        );
        for (const session of planSessions) {
            const dateStr = String(session.session_date).slice(0, 10);
            if (weekDates.includes(dateStr)) {
                if (!map.has(dateStr)) map.set(dateStr, []);
                map.get(dateStr)!.push(session);
            }
        }
        return map;
    }, [sessions, planId, weekDates]);

    const calendarByDate = useMemo(() => {
        const map = new Map<string, ResolvedDayPlan>();
        if (!calendarData) return map;
        for (const item of calendarData) {
            const dateStr = String(item.date).slice(0, 10);
            map.set(dateStr, item);
        }
        return map;
    }, [calendarData]);

    const days: WeekDayData[] = weekDates.map((dateStr, idx) => {
        const resolved = calendarByDate.get(dateStr);
        const daySessions = sessionsInWeekByDate.get(dateStr) ?? [];
        const session = daySessions[0] ?? null;

        return {
            date: dateStr,
            dayLabel: DAY_LABELS[idx],
            planned: {
                volume: resolved?.resolved_volume ?? null,
                intensity: resolved?.resolved_intensity ?? null,
            },
            programmed: session
                ? {
                    volume: session.planned_volume ?? null,
                    intensity: session.planned_intensity ?? null,
                }
                : null,
            session,
            coherencePct: null,
            hasPlanSession: session != null,
        };
    });

    return {
        days,
        isLoading: calendarLoading || sessionsLoading,
        isError: false,
        error: null,
    };
}

