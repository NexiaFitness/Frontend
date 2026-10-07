/**
 * AthleteSessionPreviewHeader.tsx — Cabecera plana vista previa (V04, sin card hero).
 */

import React from "react";
import { ClipboardList, Clock, Dumbbell } from "lucide-react";
import { useGetTrainingPlanQuery } from "@nexia/shared/api/trainingPlansApi";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    ATHLETE_SESSION_META_PILL,
    ATHLETE_SESSION_PREVIEW_HEADLINE,
    ATHLETE_SESSION_PREVIEW_PATTERNS,
    ATHLETE_SESSION_PREVIEW_PATTERNS_LABEL,
    ATHLETE_SESSION_PREVIEW_SUBLINE,
    ATHLETE_SESSION_STATUS_BADGE,
    resolveAthleteSessionStatusBadge,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    formatAthleteDateLong,
    getSessionStatusLabel,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    resolveAgendaTrainingHeadline,
    resolveAgendaTrainingPatternsForPreview,
    resolveAgendaTrainingSublineForPreview,
} from "@nexia/shared/utils/athlete/athleteAgendaViewUtils";
import { AthleteSessionPlannedLoadBars } from "@/components/athlete/AthleteSessionPlannedLoadBars";

export interface AthleteSessionPreviewHeaderProps {
    session: TrainingSession;
    exerciseCount: number;
    setCount: number;
}

export const AthleteSessionPreviewHeader: React.FC<AthleteSessionPreviewHeaderProps> = ({
    session,
    exerciseCount,
    setCount,
}) => {
    const statusVariant = resolveAthleteSessionStatusBadge(session);
    const qualityHeadline = resolveAgendaTrainingHeadline(session);
    const patternSubline = resolveAgendaTrainingPatternsForPreview(session);
    const muscleSubline = resolveAgendaTrainingSublineForPreview(session);
    const title = qualityHeadline ?? session.session_name;

    const planId = session.training_plan_id;
    const { data: plan } = useGetTrainingPlanQuery(planId ?? 0, {
        skip: planId == null || planId <= 0,
    });

    return (
        <header className="space-y-4">
            <span className={ATHLETE_SESSION_STATUS_BADGE[statusVariant]}>
                {getSessionStatusLabel(session)}
            </span>

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <h1 className={ATHLETE_SESSION_PREVIEW_HEADLINE}>{title}</h1>
                    {patternSubline ? (
                        <p className={ATHLETE_SESSION_PREVIEW_PATTERNS}>
                            <span className={ATHLETE_SESSION_PREVIEW_PATTERNS_LABEL}>
                                Patrones{" "}
                            </span>
                            {patternSubline}
                        </p>
                    ) : null}
                    {muscleSubline ? (
                        <p className={ATHLETE_SESSION_PREVIEW_SUBLINE}>{muscleSubline}</p>
                    ) : null}
                    {session.session_date ? (
                        <p className="text-sm text-muted-foreground">
                            {formatAthleteDateLong(session.session_date)}
                        </p>
                    ) : null}
                </div>
                <AthleteSessionPlannedLoadBars session={session} interactive />
            </div>

            <div className="flex flex-wrap gap-2">
                {planId != null && plan?.name ? (
                    <span className={ATHLETE_SESSION_META_PILL}>
                        <ClipboardList className="size-3.5 text-primary/70" aria-hidden />
                        {plan.name}
                    </span>
                ) : null}
                {session.planned_duration != null && (
                    <span className={ATHLETE_SESSION_META_PILL}>
                        <Clock className="size-3.5 text-primary/70" aria-hidden />
                        {session.planned_duration} min estimados
                    </span>
                )}
                <span className={ATHLETE_SESSION_META_PILL}>
                    <Dumbbell className="size-3.5 text-primary/70" aria-hidden />
                    {exerciseCount} ejercicios · {setCount} series
                </span>
            </div>

            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};

export const AthleteSessionExercisesLabel: React.FC = () => (
    <AthleteSectionHeading title="Tu sesión" as="p" />
);
