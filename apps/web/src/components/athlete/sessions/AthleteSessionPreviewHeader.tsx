/**
 * AthleteSessionPreviewHeader.tsx — Cabecera plana vista previa (V04, sin card hero).
 */

import React from "react";
import { Clock, Dumbbell } from "lucide-react";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    ATHLETE_SESSION_META_PILL,
    ATHLETE_SESSION_STATUS_BADGE,
    resolveAthleteSessionStatusBadge,
} from "@/components/athlete/sessions/athleteSessionsPresentation";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { buildSessionLoadVisualModel } from "@nexia/shared/utils/athlete/athleteSessionLoadVisual";
import {
    formatAthleteDateLong,
    getSessionStatusLabel,
} from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { AthleteSessionLoadIndicator } from "@/components/athlete/AthleteSessionLoadIndicator";

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
    const loadModel = buildSessionLoadVisualModel({
        plannedVolume: session.planned_volume,
        plannedIntensity: session.planned_intensity,
        sessionCount: 1,
    });

    return (
        <header className="space-y-4">
            <span className={ATHLETE_SESSION_STATUS_BADGE[statusVariant]}>
                {getSessionStatusLabel(session)}
            </span>

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {session.session_name}
                    </h1>
                    {session.session_date && (
                        <p className="text-sm text-muted-foreground">
                            {formatAthleteDateLong(session.session_date)}
                        </p>
                    )}
                </div>
                <AthleteSessionLoadIndicator
                    model={loadModel}
                    sheetTitle="Carga de la sesión"
                    helpText="El color indica lo intenso que es el entrenamiento; el tamaño, cuánto trabajo hay."
                />
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

            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};

export const AthleteSessionExercisesLabel: React.FC = () => (
    <AthleteSectionHeading title="Ejercicios" as="p" />
);
