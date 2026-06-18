/**
 * WeekStripPremium.tsx — Calendario semanal glass + segmentos + ring draw-in (V01 canónico).
 * Respaldo plano: `WeekStripClassic.tsx`.
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    countWeekStripStats,
    getDayProgressState,
    type WeekProgressDotState,
} from "@nexia/shared/utils/athlete/athleteWeekInsightUtils";
import { AthleteWeekProgressRing } from "./AthleteWeekProgressRing";
import { WeekSessionSegmentBar } from "./WeekSessionSegmentBar";
import {
    WEEK_STRIP_SECTION_LABEL,
    WEEK_STRIP_SHELL,
} from "./weekStripPresentation";

export interface WeekStripPremiumProps {
    days: WeekDayStripItem[];
    onDayClick?: (day: WeekDayStripItem) => void;
}

function sessionCountLabel(done: number, planned: number): string {
    if (planned === 0) return "Sin sesiones";
    if (planned === 1) {
        return done === 1 ? "1/1 hecha" : "1 sesión";
    }
    return `${done}/${planned}`;
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

export const WeekStripPremium: React.FC<WeekStripPremiumProps> = ({ days, onDayClick }) => {
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
        <section aria-label="Esta semana" className="space-y-2">
            <div className="flex items-baseline justify-between gap-2 px-0.5">
                <h2 className={WEEK_STRIP_SECTION_LABEL}>Esta semana</h2>
                <p className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                    {sessionCountLabel(done, planned)}
                </p>
            </div>

            <div className={WEEK_STRIP_SHELL}>
                <NexiaGlassAccentRim />

                {planned > 0 && (
                    <WeekSessionSegmentBar done={done} planned={planned} className="relative" />
                )}

                <div className="relative flex items-center gap-2 sm:gap-3">
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
                                        className={cn(
                                            "size-1.5 rounded-full",
                                            dayDotClass(state, day.isToday)
                                        )}
                                        aria-hidden
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {planned > 0 && <AthleteWeekProgressRing done={done} planned={planned} />}
                </div>
            </div>
        </section>
    );
};
