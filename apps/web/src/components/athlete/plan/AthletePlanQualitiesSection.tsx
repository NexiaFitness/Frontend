/**
 * AthletePlanQualitiesSection.tsx — Énfasis del plan con barras (V08).
 */

import React from "react";
import { TrendingUp } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";
import type { TrainingPlanDistributionItem } from "@nexia/shared/types/trainingAnalytics";
import { AthleteProgressBar } from "@/components/athlete/AthleteProgressBar";
import { ATHLETE_PLAN_QUALITY_ROW } from "./athletePlanPresentation";

export interface AthletePlanQualitiesSectionProps {
    qualities: TrainingPlanDistributionItem[];
}

export const AthletePlanQualitiesSection: React.FC<AthletePlanQualitiesSectionProps> = ({
    qualities,
}) => {
    if (qualities.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Énfasis del plan">
            <h2 className={`flex items-center gap-2 ${ATHLETE_SECTION_LABEL}`}>
                <TrendingUp className="size-3.5" aria-hidden />
                Énfasis del plan
            </h2>
            <ul className="space-y-2">
                {qualities.map((quality) => (
                    <li key={quality.name} className={`${ATHLETE_PLAN_QUALITY_ROW} relative`}>
                        <NexiaGlassAccentRim />
                        <div className="relative flex items-center justify-between gap-2 text-sm">
                            <span className="font-medium text-foreground">{quality.name}</span>
                            <span className="shrink-0 font-semibold tabular-nums text-primary">
                                {Math.round(quality.percentage)}%
                            </span>
                        </div>
                        <AthleteProgressBar
                            value={quality.percentage}
                            tone="primary"
                            aria-label={`${quality.name} ${Math.round(quality.percentage)} por ciento`}
                        />
                    </li>
                ))}
            </ul>
        </section>
    );
};
