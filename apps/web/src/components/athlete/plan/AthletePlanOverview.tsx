/**
 * AthletePlanOverview.tsx — Composición premium Mi plan (V08).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { WeekStrip } from "@/components/athlete/WeekStrip";
import type { AthletePlanViewModel } from "@/hooks/athlete/useAthletePlan";
import { ATHLETE_PLAN_LINK } from "./athletePlanPresentation";
import { AthletePlanActiveHero } from "./AthletePlanActiveHero";
import { AthletePlanPageHeader } from "./AthletePlanPageHeader";
import { AthletePlanQualitiesSection } from "./AthletePlanQualitiesSection";
import { AthletePlanYearTimeline } from "./AthletePlanYearTimeline";

export interface AthletePlanOverviewProps {
    viewModel: AthletePlanViewModel;
}

export const AthletePlanOverview: React.FC<AthletePlanOverviewProps> = ({ viewModel }) => {
    const navigate = useNavigate();
    const { summary, planGoalLabel, activeBlock, weekStrip, monthTimeline } = viewModel;

    if (!summary || !activeBlock) return null;

    return (
        <div className="space-y-6">
            <AthletePlanPageHeader
                planTitle={activeBlock.planTitle}
                planGoalLabel={planGoalLabel}
            />

            <AthletePlanActiveHero
                active={activeBlock}
                sessionsCompleted={summary.summary.sessions_completed}
                sessionsPlanned={summary.summary.total_sessions_planned}
            />

            <WeekStrip days={weekStrip} />

            <AthletePlanQualitiesSection qualities={summary.physical_qualities} />

            <AthletePlanYearTimeline months={monthTimeline} />

            <button type="button" className={ATHLETE_PLAN_LINK} onClick={() => navigate("/dashboard/progress")}>
                Ver mi progreso
            </button>
        </div>
    );
};
