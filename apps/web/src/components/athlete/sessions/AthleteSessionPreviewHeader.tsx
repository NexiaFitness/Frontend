/**
 * AthleteSessionPreviewHeader.tsx — Cabecera plana vista previa (V04, sin card hero).
 */

import React from "react";
import { Clock, Dumbbell } from "lucide-react";
import {
    ATHLETE_DIVIDER,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import {
    ATHLETE_SESSION_META_PILL,
    ATHLETE_SESSION_STATUS_BADGE,
    resolveAthleteSessionStatusBadge,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    formatAthleteDateLong,
    getSessionStatusLabel,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";

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

    return (
        <header className="space-y-4">
            <span className={ATHLETE_SESSION_STATUS_BADGE[statusVariant]}>
                {getSessionStatusLabel(session)}
            </span>

            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {session.session_name}
                </h1>
                {session.session_date && (
                    <p className="text-sm text-muted-foreground">
                        {formatAthleteDateLong(session.session_date)}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
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

            <div className={`w-full ${ATHLETE_DIVIDER}`} aria-hidden />
        </header>
    );
};

export const AthleteSessionExercisesLabel: React.FC = () => (
    <p className={ATHLETE_SECTION_LABEL}>Ejercicios</p>
);
