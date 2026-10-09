/**
 * WeekStripPremium.tsx — Calendario semanal glass + ring (V01 canónico).
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
import { AthleteProgressRing } from "@/components/athlete/AthleteProgressRing";
import {
    WEEK_STRIP_SECTION_LABEL,
    WEEK_STRIP_SHELL,
    weekStripSectionAriaLabel,
} from "./weekStripPresentation";

export interface WeekStripPremiumProps {
    days: WeekDayStripItem[];
    onDayClick?: (day: WeekDayStripItem) => void;
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
        <section
            aria-label={weekStripSectionAriaLabel(done, planned)}
            className="space-y-2"
        >
            <h2 className={cn(WEEK_STRIP_SECTION_LABEL, "px-0.5")}>Esta semana</h2>

            <div className={WEEK_STRIP_SHELL}>
                <NexiaGlassAccentRim />

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

                    {planned > 0 && (
                        <AthleteProgressRing
                            progress={done / planned}
                            displayValue={`${done}/${planned}`}
                            ariaLabel={`${done} de ${planned} sesiones completadas esta semana`}
                            size="md"
                        />
                    )}
                </div>
            </div>
        </section>
    );
};
