/**
 * AthletePlanYearTimeline.tsx — Timeline anual legible vol/int (V08).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import type { AthletePlanMonthTimelineItem } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import { formatAthleteLoadLevel } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import {
    ATHLETE_PLAN_TIMELINE_ITEM,
    ATHLETE_PLAN_TIMELINE_ITEM_CURRENT,
    ATHLETE_PLAN_TIMELINE_LOAD_INT,
    ATHLETE_PLAN_TIMELINE_LOAD_LABEL,
    ATHLETE_PLAN_TIMELINE_LOAD_ROW,
    ATHLETE_PLAN_TIMELINE_LOAD_VOL,
    ATHLETE_PLAN_TIMELINE_MONTH,
} from "./athletePlanPresentation";

export interface AthletePlanYearTimelineProps {
    months: AthletePlanMonthTimelineItem[];
}

function MonthLoadRows({
    volumeLevel,
    intensityLevel,
}: {
    volumeLevel: number;
    intensityLevel: number;
}) {
    return (
        <div className="space-y-0.5">
            <div className={ATHLETE_PLAN_TIMELINE_LOAD_ROW}>
                <span className={ATHLETE_PLAN_TIMELINE_LOAD_LABEL}>Vol</span>
                <span className={ATHLETE_PLAN_TIMELINE_LOAD_VOL}>
                    {formatAthleteLoadLevel(volumeLevel)}
                </span>
            </div>
            <div className={ATHLETE_PLAN_TIMELINE_LOAD_ROW}>
                <span className={ATHLETE_PLAN_TIMELINE_LOAD_LABEL}>Int</span>
                <span className={ATHLETE_PLAN_TIMELINE_LOAD_INT}>
                    {formatAthleteLoadLevel(intensityLevel)}
                </span>
            </div>
        </div>
    );
}

export const AthletePlanYearTimeline: React.FC<AthletePlanYearTimelineProps> = ({ months }) => {
    if (months.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Carga por mes">
            <AthleteSectionHeading
                title="Carga por mes"
                description="Vol = volumen (cuánto trabajo). Int = intensidad (qué tan duro). Escala 1–10 en cada mes."
            />
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {months.map((month) => (
                    <div
                        key={month.month}
                        className={cn(
                            month.isCurrent
                                ? ATHLETE_PLAN_TIMELINE_ITEM_CURRENT
                                : ATHLETE_PLAN_TIMELINE_ITEM
                        )}
                    >
                        <span
                            className={cn(
                                ATHLETE_PLAN_TIMELINE_MONTH,
                                month.isCurrent ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {month.label}
                        </span>
                        <MonthLoadRows
                            volumeLevel={month.volumeLevel}
                            intensityLevel={month.intensityLevel}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
};
