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
} from "./athletePlanPresentation";

export interface AthletePlanYearTimelineProps {
    months: AthletePlanMonthTimelineItem[];
}

export const AthletePlanYearTimeline: React.FC<AthletePlanYearTimelineProps> = ({ months }) => {
    if (months.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Carga por mes">
            <AthleteSectionHeading title="Carga por mes" />
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
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
                                "text-[10px] font-semibold uppercase",
                                month.isCurrent ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {month.label}
                        </span>
                        <span className="text-[11px] font-bold tabular-nums text-foreground">
                            {formatAthleteLoadLevel(month.volumeLevel)}
                        </span>
                        <span className="text-[9px] tabular-nums text-muted-foreground">
                            Int {formatAthleteLoadLevel(month.intensityLevel)}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};
