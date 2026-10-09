/**
 * AthleteSessionListItem.tsx — Fila sesión canónica (V02 + historial V10).
 * Contexto: misma card en Mis sesiones y Mi progreso; copy de V04 (cualidad / músculos).
 * Notas: sin barra de cumplimiento a ancho; el % va en badge. VOL/INT decorativos (la fila es el hit).
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { ChevronRight, Clock } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { NEXIA_ROW_CHEVRON } from "@/components/ui/surface/platformPremiumPresentation";
import { cn } from "@/lib/utils";
import { AthleteSessionPlannedLoadBars } from "@/components/athlete/AthleteSessionPlannedLoadBars";
import {
    ATHLETE_SESSION_COMPLETION_BADGE,
    ATHLETE_SESSION_LIST_BODY,
    ATHLETE_SESSION_LIST_ITEM,
    ATHLETE_SESSION_LIST_ITEM_TODAY,
    ATHLETE_SESSION_LIST_META,
    ATHLETE_SESSION_LIST_TITLE,
    ATHLETE_SESSION_STATUS_BADGE,
    resolveAthleteSessionCompletionTone,
    resolveAthleteSessionStatusBadge,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { AthleteRunSessionRegistrationMetaRow } from "@nexia/shared/types/athleteRunProgress";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    resolveAgendaTrainingHeadline,
    resolveAgendaTrainingSubline,
} from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";
import {
    athleteSessionListRegistrationLabel,
    resolveAthleteSessionListRegistrationCue,
} from "@nexia/shared/utils/athlete/athleteSessionRegistrationPolicy";
import {
    formatAthleteDate,
    getCompletedSessionCompletionPercent,
    getSessionStatusLabel,
    isAthleteExtraSession,
    isPartiallyClosedSession,
    isSessionToday,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { hasAthleteSessionPlannedLoad } from "@nexia/shared/utils/athlete/athleteSessionPlannedLoad";

export interface AthleteSessionListItemProps {
    session: TrainingSession;
    onSelect: (sessionId: number) => void;
    registrationMeta?: AthleteRunSessionRegistrationMetaRow;
    hasActivePlan?: boolean;
}

export const AthleteSessionListItem: React.FC<AthleteSessionListItemProps> = ({
    session,
    onSelect,
    registrationMeta,
    hasActivePlan = false,
}) => {
    const registrationCue = resolveAthleteSessionListRegistrationCue(
        session,
        registrationMeta
    );
    const registrationLabel = athleteSessionListRegistrationLabel(registrationCue);
    const statusLabel = getSessionStatusLabel(session);
    const completion = getCompletedSessionCompletionPercent(session);
    const isPartial = isPartiallyClosedSession(session);
    const isToday = isSessionToday(session);
    const tone =
        completion != null
            ? resolveAthleteSessionCompletionTone(completion, isPartial)
            : null;
    const statusVariant = resolveAthleteSessionStatusBadge(session);
    const title = resolveAgendaTrainingHeadline(session) ?? session.session_name;
    const muscles = resolveAgendaTrainingSubline(session);
    const showLoad = hasAthleteSessionPlannedLoad(session);

    return (
        <button
            type="button"
            onClick={() => onSelect(session.id)}
            className={cn(
                ATHLETE_SESSION_LIST_ITEM,
                "group",
                isToday && cn(ATHLETE_SESSION_LIST_ITEM_TODAY, "pt-5"),
                !isToday && "pt-4"
            )}
            aria-label={[
                statusLabel,
                title,
                session.session_date ? formatAthleteDate(session.session_date) : null,
                muscles,
                completion != null ? `${Math.round(completion)} por ciento` : null,
            ]
                .filter(Boolean)
                .join(", ")}
        >
            {isToday && <NexiaGlassAccentRim />}

            <div className={ATHLETE_SESSION_LIST_BODY}>
                <div className="flex flex-wrap items-center gap-2">
                    <span className={ATHLETE_SESSION_STATUS_BADGE[statusVariant]}>
                        {statusLabel}
                    </span>
                    {isAthleteExtraSession(session, hasActivePlan) && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                            Sesión extra
                        </span>
                    )}
                    {session.session_date && (
                        <span className={ATHLETE_SESSION_LIST_META}>
                            {formatAthleteDate(session.session_date)}
                        </span>
                    )}
                    {completion != null && tone && (
                        <span className={ATHLETE_SESSION_COMPLETION_BADGE[tone]}>
                            {Math.round(completion)}%
                        </span>
                    )}
                </div>

                <p className={ATHLETE_SESSION_LIST_TITLE}>{title}</p>

                {muscles ? <p className={ATHLETE_SESSION_LIST_META}>{muscles}</p> : null}

                {registrationLabel ? (
                    <p
                        className={cn(
                            "text-left text-sm font-medium",
                            registrationCue === "register_now" ||
                                registrationCue === "complete_registration"
                                ? "text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        {registrationLabel}
                    </p>
                ) : null}

                {session.planned_duration != null ? (
                    <p className="flex items-center gap-1.5 text-caption text-muted-foreground">
                        <Clock className="size-3.5 text-primary/60" aria-hidden />
                        {session.planned_duration} min
                    </p>
                ) : null}
            </div>

            {showLoad ? (
                <AthleteSessionPlannedLoadBars session={session} interactive={false} />
            ) : null}

            <ChevronRight className={cn("relative", NEXIA_ROW_CHEVRON)} aria-hidden />
        </button>
    );
};
