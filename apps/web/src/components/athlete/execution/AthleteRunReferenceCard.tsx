/**
 * AthleteRunReferenceCard.tsx — Referencia, mejor marca y sugerencia (F3e-FE-01).
 * Solo lectura en fase `doing` — sin botón «Usar».
 */

import React from "react";
import { History, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteRunReference } from "@nexia/shared/types/athleteRunReference";
import { hasAthleteRunReferencePoint } from "@nexia/shared/types/athleteRunReference";
import { shouldShowRunSuggestion } from "@nexia/shared/types/athleteRunSuggestion";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteRunReferenceEmptyState } from "./AthleteRunReferenceEmptyState";
import { AthleteRunReferenceCardSkeleton } from "./AthleteRunReferenceCardSkeleton";
import {
    ATHLETE_RUN_FIELD_HINT,
    ATHLETE_RUN_PB_VALUE,
    ATHLETE_RUN_REFERENCE_CARD,
    ATHLETE_RUN_REFERENCE_META,
    ATHLETE_RUN_REFERENCE_SECTION_LABEL,
    ATHLETE_RUN_REFERENCE_VALUE,
    ATHLETE_RUN_SUGGESTION_VALUE,
    formatRunPersonalBestLine,
    formatRunReferenceLine,
} from "./athleteRunPresentation";

export interface AthleteRunReferenceCardProps {
    data?: AthleteRunReference;
    isLoading?: boolean;
    className?: string;
}

function ReferenceSection({
    label,
    valueLine,
    meta,
    valueClassName,
    icon,
}: {
    label: string;
    valueLine: string;
    meta?: string | null;
    valueClassName: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                {icon}
                <p className={ATHLETE_RUN_REFERENCE_SECTION_LABEL}>{label}</p>
            </div>
            <p className={valueClassName}>{valueLine}</p>
            {meta ? <p className={ATHLETE_RUN_REFERENCE_META}>{meta}</p> : null}
        </div>
    );
}

export const AthleteRunReferenceCard: React.FC<AthleteRunReferenceCardProps> = ({
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
    const suggestion = data.suggestion;
    const showSuggestion = shouldShowRunSuggestion(suggestion);

    const hasReference = hasAthleteRunReferencePoint(reference);
    const hasPb = personalBest?.weight_kg != null && personalBest.weight_kg > 0;

    if (!hasReference && !hasPb && !showSuggestion) {
        return <AthleteRunReferenceEmptyState />;
    }

    return (
        <div className={cn("relative", ATHLETE_RUN_REFERENCE_CARD, className)}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-4">
                {hasReference ? (
                    <ReferenceSection
                        label="Referencia"
                        valueLine={formatRunReferenceLine(
                            reference.weight_kg,
                            reference.reps,
                            reference.rpe
                        )}
                        meta={reference.session_date_label}
                        valueClassName={ATHLETE_RUN_REFERENCE_VALUE}
                        icon={<History className="size-3.5 shrink-0 text-primary/75" aria-hidden />}
                    />
                ) : null}

                {hasPb ? (
                    <ReferenceSection
                        label="Mejor marca"
                        valueLine={formatRunPersonalBestLine(
                            personalBest.weight_kg,
                            personalBest.reps
                        )}
                        meta={personalBest.session_date_label}
                        valueClassName={ATHLETE_RUN_PB_VALUE}
                        icon={<Trophy className="size-3.5 shrink-0 text-warning/80" aria-hidden />}
                    />
                ) : null}

                {showSuggestion && suggestion ? (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-3.5 shrink-0 text-primary/80" aria-hidden />
                            <p className={ATHLETE_RUN_REFERENCE_SECTION_LABEL}>Sugerencia</p>
                        </div>
                        <p className={ATHLETE_RUN_SUGGESTION_VALUE}>
                            {suggestion.suggested_value} kg
                        </p>
                        <p className={ATHLETE_RUN_FIELD_HINT}>{suggestion.explanation}</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
