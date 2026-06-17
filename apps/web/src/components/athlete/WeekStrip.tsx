/**
 * WeekStrip.tsx — Calendario semanal motivacional (navegación + progreso L-D).
 * Contexto: portal atleta V01 F3b — una sola representación semanal con ring.
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    countWeekStripStats,
    getDayProgressState,
    type WeekProgressDotState,
} from "@nexia/shared/utils/athlete/athleteWeekInsightUtils";

export interface WeekStripProps {
    days: WeekDayStripItem[];
    /** Móvil: abre UX-FE-02 sheet. Desktop: omitir → navega a V02 filtrado. */
    onDayClick?: (day: WeekDayStripItem) => void;
}

function sessionCountLabel(done: number, planned: number): string {
    if (planned === 0) return "Sin sesiones";
    if (planned === 1) {
        return done === 1 ? "1/1 hecha" : "1 sesión";
    }
    return `${done}/${planned}`;
}

function WeekProgressRing({ done, planned }: { done: number; planned: number }) {
    const radius = 17;
    const circumference = 2 * Math.PI * radius;
    const progress = planned > 0 ? done / planned : 0;
    const dashOffset = circumference * (1 - progress);

    return (
        <div
            className="relative flex size-14 shrink-0 items-center justify-center"
            role="img"
            aria-label={`${done} de ${planned} sesiones completadas esta semana`}
        >
            <svg
                className="size-full -rotate-90"
                viewBox="0 0 44 44"
                aria-hidden
            >
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    className="stroke-muted/40"
                    strokeWidth="3.5"
                />
                <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <span className="absolute text-center text-[11px] font-bold leading-none text-primary tabular-nums">
                {done}/{planned}
            </span>
        </div>
    );
}

function dayDateBoxClass(
    state: WeekProgressDotState,
    isToday: boolean
): string {
    if (state === "done") {
        return "bg-success/20 text-success ring-1 ring-success/45 shadow-[0_0_10px_-2px] shadow-success/40";
    }
    if (state === "pending" && isToday) {
        return "bg-primary/15 text-primary ring-2 ring-primary shadow-[0_0_14px_-2px] shadow-primary/50 motion-safe:animate-pulse motion-reduce:animate-none";
    }
    if (state === "pending") {
        return "bg-foreground/5 text-foreground ring-1 ring-primary/40";
    }
    return "text-muted-foreground/80";
}

function dayDotClass(state: WeekProgressDotState, isToday: boolean): string {
    if (state === "done") {
        return "bg-success shadow-[0_0_6px] shadow-success/55";
    }
    if (state === "pending") {
        return cn(
            "bg-primary shadow-[0_0_6px] shadow-primary/45",
            isToday && "motion-safe:animate-pulse motion-reduce:animate-none"
        );
    }
    return "bg-muted-foreground/25";
}

export const WeekStrip: React.FC<WeekStripProps> = ({ days, onDayClick }) => {
    const navigate = useNavigate();

    const { done, planned } = useMemo(() => countWeekStripStats(days), [days]);

    const handleDayClick = (day: WeekDayStripItem) => {
        if (onDayClick) {
            onDayClick(day);
            return;
        }
        navigate("/dashboard/sessions", {
            state: { filterDate: day.dateKey },
        });
    };

    return (
        <section aria-label="Esta semana" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Esta semana
                </h2>
                <p className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {sessionCountLabel(done, planned)}
                </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <div className="grid min-w-0 flex-1 grid-cols-7 gap-0.5">
                    {days.map((day) => {
                        const state = getDayProgressState(day);

                        return (
                            <button
                                key={day.dateKey}
                                type="button"
                                onClick={() => handleDayClick(day)}
                                className="flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-md px-0.5 py-1 transition-colors hover:bg-foreground/5 active:bg-foreground/10"
                                aria-label={`${day.label} ${day.dayNumber}${
                                    state === "done"
                                        ? ", sesión completada"
                                        : state === "pending"
                                          ? ", sesión pendiente"
                                          : ""
                                }`}
                            >
                                <span
                                    className={cn(
                                        "text-[9px] font-semibold uppercase leading-none",
                                        day.isToday ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {day.label}
                                </span>
                                <span
                                    className={cn(
                                        "flex size-8 items-center justify-center rounded-lg text-sm font-bold tabular-nums transition-all",
                                        dayDateBoxClass(state, day.isToday)
                                    )}
                                >
                                    {day.dayNumber}
                                </span>
                                <span
                                    className={cn("size-1.5 rounded-full", dayDotClass(state, day.isToday))}
                                    aria-hidden
                                />
                            </button>
                        );
                    })}
                </div>

                {planned > 0 && <WeekProgressRing done={done} planned={planned} />}
            </div>
        </section>
    );
};
