/**
 * AthleteAppointmentDetailSheet — Detalle cita (hora, lugar, enlace).
 */

import React from "react";
import { ExternalLink } from "lucide-react";
import type { CalendarEvent } from "@nexia/shared/types/calendar";
import {
    formatCalendarEventClockMadrid,
    resolveCalendarEventDisplayTitle,
} from "@nexia/shared/utils/athlete/athleteCalendarUtils";
import { BottomSheet } from "@/components/ui/layout/BottomSheet";
import { Button } from "@/components/ui/buttons";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";

export interface AthleteAppointmentDetailSheetProps {
    event: CalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
}

export const AthleteAppointmentDetailSheet: React.FC<AthleteAppointmentDetailSheetProps> = ({
    event,
    isOpen,
    onClose,
}) => {
    if (!event) return null;
    const clock = formatCalendarEventClockMadrid(event.starts_at, event.has_explicit_time);
    const title = resolveCalendarEventDisplayTitle(event);

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4 text-sm">
                {clock ? (
                    <p>
                        <span className="text-muted-foreground">Hora: </span>
                        <span className="font-medium text-foreground tabular-nums">{clock}</span>
                    </p>
                ) : null}
                {event.location ? (
                    <p>
                        <span className="text-muted-foreground">Lugar: </span>
                        <span className="font-medium text-foreground">{event.location}</span>
                    </p>
                ) : null}
                {event.notes ? (
                    <p className="text-muted-foreground whitespace-pre-wrap">{event.notes}</p>
                ) : null}
                {event.meeting_link ? (
                    <Button
                        variant="primary"
                        className={ATHLETE_PRIMARY_CTA}
                        onClick={() => {
                            window.open(event.meeting_link!, "_blank", "noopener,noreferrer");
                        }}
                    >
                        Unirse a la videollamada
                        <ExternalLink className="size-4 shrink-0" aria-hidden />
                    </Button>
                ) : null}
            </div>
        </BottomSheet>
    );
};
