/**
 * AthleteRunTimedReferenceCard — Referencia timed en doing (F4 AMRAP/EMOM/for_time).
 */

import React from "react";
import { History, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import {
    formatTimedPersonalBestLine,
    formatTimedReferenceValueLine,
    hasAthleteRunTimedReferencePoint,
} from "@nexia/shared/utils/athlete/timedBlockRunUtils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteRunReferenceEmptyState } from "./AthleteRunReferenceEmptyState";
import { AthleteRunReferenceCardSkeleton } from "./AthleteRunReferenceCardSkeleton";
import {
    ATHLETE_RUN_PB_VALUE,
    ATHLETE_RUN_REFERENCE_CARD,
    ATHLETE_RUN_REFERENCE_META,
    ATHLETE_RUN_REFERENCE_SECTION_LABEL,
    ATHLETE_RUN_REFERENCE_VALUE,
} from "./athleteRunPresentation";

export interface AthleteRunTimedReferenceCardProps {
    groupKind: string;
    data?: AthleteRunReference;
    isLoading?: boolean;
    className?: string;
}

export const AthleteRunTimedReferenceCard: React.FC<AthleteRunTimedReferenceCardProps> = ({
    groupKind,
    data,
    isLoading = false,
    className,
}) => {
    if (isLoading) {
        return <AthleteRunReferenceCardSkeleton />;
    }

    if (!data) {
        return <AthleteRunReferenceEmptyState />;
    }

    const reference = data.reference;
    const personalBest = data.personal_best;
    const hasReference = hasAthleteRunTimedReferencePoint(groupKind, reference);
    const hasPb =
        groupKind === "amrap"
            ? (personalBest?.rounds_completed ?? 0) > 0
            : groupKind === "for_time"
              ? (personalBest?.total_seconds ?? 0) > 0
              : groupKind === "emom"
                ? (personalBest?.rounds_completed ?? 0) > 0
                : false;

    if (!hasReference && !hasPb) {
        return <AthleteRunReferenceEmptyState />;
    }

    return (
        <div className={cn("relative", ATHLETE_RUN_REFERENCE_CARD, className)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-4">
                {hasReference && reference ? (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <History className="size-3.5 shrink-0 text-primary/75" aria-hidden />
                            <p className={ATHLETE_RUN_REFERENCE_SECTION_LABEL}>Referencia</p>
                        </div>
                        <p className={ATHLETE_RUN_REFERENCE_VALUE}>
                            {formatTimedReferenceValueLine(groupKind, reference)}
                        </p>
                        {reference.session_date_label ? (
                            <p className={ATHLETE_RUN_REFERENCE_META}>
                                {reference.session_date_label}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {hasPb && personalBest ? (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Trophy className="size-3.5 shrink-0 text-warning/80" aria-hidden />
                            <p className={ATHLETE_RUN_REFERENCE_SECTION_LABEL}>Mejor marca</p>
                        </div>
                        <p className={ATHLETE_RUN_PB_VALUE}>
                            {formatTimedPersonalBestLine(
                                groupKind,
                                personalBest.metric,
                                personalBest.rounds_completed,
                                personalBest.total_seconds,
                                personalBest.reps
                            )}
                        </p>
                        {personalBest.session_date_label ? (
                            <p className={ATHLETE_RUN_REFERENCE_META}>
                                {personalBest.session_date_label}
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
