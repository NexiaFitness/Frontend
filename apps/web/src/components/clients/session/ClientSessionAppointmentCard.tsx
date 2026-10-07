/**
 * Tarjeta de cita agendada — misma rejilla y altura que SessionCard (lista cronológica).
 */

import React, { useId } from "react";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { Button } from "@/components/ui/buttons";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import { cn } from "@/lib/utils";
import {
    PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS,
    PERIOD_BLOCK_CARD_DATE_TEXT_CLASS,
    PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS,
    PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS,
    PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS,
    PERIOD_BLOCK_CARD_FOOTER_CLASS,
    PERIOD_BLOCK_CARD_HEADER_CLASS,
    PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS,
    PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS,
} from "@/components/trainingPlans/periodization/periodBlockCardPresentation";
import {
    SESSION_CARD_BODY_LIST_CLASS,
    SESSION_CARD_CARGA_STACK_CLASS,
    SESSION_CARD_FOOTER_PIN_CLASS,
    SESSION_CARD_MAIN_STACK_CLASS,
    SESSION_CARD_SHELL_LIST_CLASS,
    SESSION_CARD_STATUS_BADGE_BASE,
} from "@/components/trainingSessions/sessionCardPresentation";

const TYPE_LABEL: Record<string, string> = {
    training: "Entrenamiento",
    consultation: "Consulta",
    assessment: "Evaluación",
};

const STATUS_BADGE: Record<string, { cls: string; label: string; dot: string }> = {
    scheduled: {
        cls: "border-primary/30 bg-primary/10 text-primary",
        label: "Agendada",
        dot: "bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]",
    },
    confirmed: {
        cls: "border-success/30 bg-success/10 text-success",
        label: "Confirmada",
        dot: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.55)]",
    },
    completed: {
        cls: "border-border bg-muted/30 text-muted-foreground",
        label: "Completada",
        dot: "bg-muted-foreground",
    },
    cancelled: {
        cls: "border-destructive/30 bg-destructive/10 text-destructive",
        label: "Cancelada",
        dot: "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.55)]",
    },
};

export interface ClientSessionAppointmentCardProps {
    appointment: ScheduledSession;
    onOpen: (appointment: ScheduledSession) => void;
}

export const ClientSessionAppointmentCard: React.FC<ClientSessionAppointmentCardProps> = ({
    appointment,
    onOpen,
}) => {
    const titleId = useId();
    const badge = STATUS_BADGE[appointment.status] ?? STATUS_BADGE.scheduled;
    const typeLabel = TYPE_LABEL[appointment.session_type] ?? appointment.session_type;

    const dateLabel = new Date(appointment.scheduled_date + "T12:00:00").toLocaleDateString(
        "es-ES",
        { day: "numeric", month: "short", year: "numeric" },
    );

    const fmtTime = (t: string | null | undefined) =>
        t != null && String(t).length >= 4 ? String(t).slice(0, 5) : "—";
    const timeRange = `${fmtTime(appointment.start_time)}–${fmtTime(appointment.end_time)}`;

    return (
        <article
            aria-labelledby={titleId}
            className={cn(SESSION_CARD_SHELL_LIST_CLASS, "text-left")}
        >
            <NexiaGlassAccentRim />

            <header className={cn(PERIOD_BLOCK_CARD_HEADER_CLASS, "shrink-0")}>
                <div className="flex min-w-0 items-start gap-2">
                    <span
                        className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", badge.dot)}
                        aria-hidden
                    />
                    <div className="min-w-0">
                        <p id={titleId} className={PERIOD_BLOCK_CARD_DATE_TEXT_CLASS}>
                            {dateLabel}
                        </p>
                        <span
                            className={cn(
                                SESSION_CARD_STATUS_BADGE_BASE,
                                "mt-1 border px-2 py-0.5 text-[10px]",
                                badge.cls,
                            )}
                        >
                            {badge.label}
                        </span>
                    </div>
                </div>
                <span className={PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS}>
                    {appointment.duration_minutes} min
                </span>
            </header>

            <div className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS} aria-hidden>
                <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
            </div>

            <div className={SESSION_CARD_MAIN_STACK_CLASS}>
                <div className={SESSION_CARD_BODY_LIST_CLASS}>
                    <div className={PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS}>
                        <p className={PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS}>Cita</p>
                        <p className="truncate text-xs font-semibold text-foreground">{typeLabel}</p>
                        {appointment.notes ? (
                            <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                                {appointment.notes}
                            </p>
                        ) : (
                            <p className="text-[11px] text-muted-foreground">Agenda del cliente</p>
                        )}
                    </div>

                    <div className={PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS}>
                        <p className={PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS}>Horario</p>
                        <div className={SESSION_CARD_CARGA_STACK_CLASS}>
                            <div className="flex flex-col justify-center gap-2.5 py-0.5">
                                <p className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-foreground">
                                    <Clock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                                    {timeRange}
                                </p>
                                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                                    {dateLabel}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={SESSION_CARD_FOOTER_PIN_CLASS}>
                <div className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS} aria-hidden>
                    <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
                </div>
                <footer className={PERIOD_BLOCK_CARD_FOOTER_CLASS}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className="w-full"
                        onClick={() => onOpen(appointment)}
                    >
                        Ver cita
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                </footer>
            </div>
        </article>
    );
};
