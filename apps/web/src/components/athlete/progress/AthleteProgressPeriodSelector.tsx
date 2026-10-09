/**
 * AthleteProgressPeriodSelector.tsx — Control 30d / 90d / Todo.
 * Contexto: estado en URL; hidden si el historial no supera 30 días.
 * @author Frontend Team
 * @since v1.0.3
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_PROGRESS_PERIODS,
    athleteProgressPeriodShortLabel,
    type AthleteProgressPeriodId,
} from "@nexia/shared/utils/athlete/athleteProgressPeriod";
import {
    ATHLETE_PROGRESS_PERIOD_GROUP,
    ATHLETE_PROGRESS_PERIOD_OPTION,
    ATHLETE_PROGRESS_PERIOD_OPTION_ACTIVE,
} from "./athleteProgressViewPresentation";

export interface AthleteProgressPeriodSelectorProps {
    value: AthleteProgressPeriodId;
    onChange: (period: AthleteProgressPeriodId) => void;
}

export const AthleteProgressPeriodSelector: React.FC<
    AthleteProgressPeriodSelectorProps
> = ({ value, onChange }) => {
    return (
        <div
            role="radiogroup"
            aria-label="Periodo de progreso"
            className={ATHLETE_PROGRESS_PERIOD_GROUP}
        >
            {ATHLETE_PROGRESS_PERIODS.map((period) => {
                const selected = period === value;
                return (
                    <button
                        key={period}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                            ATHLETE_PROGRESS_PERIOD_OPTION,
                            selected && ATHLETE_PROGRESS_PERIOD_OPTION_ACTIVE
                        )}
                        onClick={() => onChange(period)}
                    >
                        {athleteProgressPeriodShortLabel(period)}
                    </button>
                );
            })}
        </div>
    );
};
