/**
 * AthleteTodayAppointmentsCard — Citas del día bajo el hero de entreno (AG-2).
 *
 * @author Frontend Team
 * @since 2026-10-06
 */

import React from "react";
import { CalendarClock } from "lucide-react";
import type { CalendarEvent } from "@nexia/shared/types/calendar";
import {
    formatCalendarEventClockMadrid,
    resolveCalendarEventDisplayTitle,
} from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import { ATHLETE_TODAY_APPOINTMENTS_CARD } from "@/components/athlete/athleteAgendaPresentation";
import { cn } from "@/lib/utils";

export interface AthleteTodayAppointmentsCardProps {
    appointments: CalendarEvent[];
    className?: string;
}

export const AthleteTodayAppointmentsCard: React.FC<AthleteTodayAppointmentsCardProps> = ({
    appointments,
    className,
}) => {
    if (appointments.length === 0) return null;

    return (
        <div
            className={cn(ATHLETE_TODAY_APPOINTMENTS_CARD, className)}
            data-testid="athlete-today-appointments"
        >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarClock className="size-4 shrink-0 text-primary" aria-hidden />
                <span>También hoy</span>
            </div>
            <ul className="space-y-2">
                {appointments.map((event) => {
                    const clock = formatCalendarEventClockMadrid(
                        event.starts_at,
                        event.has_explicit_time
                    );
                    return (
                        <li
                            key={event.id}
                            className="flex items-baseline justify-between gap-3 text-sm"
                        >
                            <span className="font-medium text-foreground">
                                {resolveCalendarEventDisplayTitle(event)}
                            </span>
                            {clock ? (
                                <span className="tabular-nums text-muted-foreground">{clock}</span>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
