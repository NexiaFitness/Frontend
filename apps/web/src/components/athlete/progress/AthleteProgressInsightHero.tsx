/**
 * AthleteProgressInsightHero.tsx — Frase de veredicto de Mi progreso.
 * @author Frontend Team
 * @since v1.0.3
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteProgressInsight } from "@nexia/shared/utils/athlete/athleteProgressInsight";
import { ATHLETE_PROGRESS_INSIGHT } from "./athleteProgressViewPresentation";

export interface AthleteProgressInsightHeroProps {
    insight: AthleteProgressInsight;
    onSublineClick?: () => void;
}

export const AthleteProgressInsightHero: React.FC<AthleteProgressInsightHeroProps> = ({
    insight,
    onSublineClick,
}) => {
    return (
        <section className={ATHLETE_PROGRESS_INSIGHT} aria-label="Resumen de tu progreso">
            <NexiaGlassAccentRim />
            <p className="relative text-base font-semibold leading-snug text-foreground">
                {insight.headline}
            </p>
            {insight.subline &&
                (onSublineClick ? (
                    <button
                        type="button"
                        className="relative min-h-touch-athlete text-left text-sm text-primary"
                        onClick={onSublineClick}
                    >
                        {insight.subline}
                    </button>
                ) : (
                    <p className="relative text-sm text-muted-foreground">{insight.subline}</p>
                ))}
        </section>
    );
};
