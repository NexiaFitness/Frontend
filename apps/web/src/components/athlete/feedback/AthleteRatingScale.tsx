/**
 * AthleteRatingScale.tsx — Escala táctil 1–10 premium (V07 feedback).
 * Segmentos en glass track; sin range HTML nativo.
 */

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_RATING_ANCHOR,
    ATHLETE_RATING_FIELD,
    ATHLETE_RATING_LABEL,
    ATHLETE_RATING_PROGRESS,
    ATHLETE_RATING_SEGMENT,
    ATHLETE_RATING_SEGMENT_FILLED,
    ATHLETE_RATING_SEGMENT_ROW,
    ATHLETE_RATING_SEGMENT_SELECTED,
    ATHLETE_RATING_TRACK,
    ATHLETE_RATING_VALUE_PILL,
    type AthleteRatingColor,
} from "./athleteRatingPresentation";

export interface AthleteRatingScaleProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    color?: AthleteRatingColor;
    lowAnchor?: string;
    highAnchor?: string;
    readOnly?: boolean;
    onChange: (value: number) => void;
}

export const AthleteRatingScale: React.FC<AthleteRatingScaleProps> = ({
    label,
    value,
    min = 1,
    max = 10,
    color = "primary",
    lowAnchor = "Bajo",
    highAnchor = "Alto",
    readOnly = false,
    onChange,
}) => {
    const steps = useMemo(
        () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
        [min, max]
    );

    const progressPercent =
        max === min ? 100 : ((value - min) / (max - min)) * 100;

    return (
        <div className={ATHLETE_RATING_FIELD}>
            <div className="flex items-center justify-between gap-3">
                <span className={ATHLETE_RATING_LABEL}>{label}</span>
                <span className={ATHLETE_RATING_VALUE_PILL[color]} aria-hidden>
                    {value}
                </span>
            </div>

            <div
                className={ATHLETE_RATING_TRACK}
                role="radiogroup"
                aria-label={label}
            >
                <div
                    className={ATHLETE_RATING_PROGRESS[color]}
                    style={{ width: `calc(${progressPercent}% - 0.25rem)` }}
                    aria-hidden
                />
                <div className={ATHLETE_RATING_SEGMENT_ROW}>
                    {steps.map((step) => {
                        const isSelected = step === value;
                        const isFilled = step <= value;

                        return (
                            <button
                                key={step}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                disabled={readOnly}
                                onClick={() => onChange(step)}
                                className={cn(
                                    ATHLETE_RATING_SEGMENT,
                                    !isSelected &&
                                        isFilled &&
                                        ATHLETE_RATING_SEGMENT_FILLED[color],
                                    isSelected && ATHLETE_RATING_SEGMENT_SELECTED[color],
                                    readOnly && "cursor-not-allowed opacity-60"
                                )}
                            >
                                {step}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={ATHLETE_RATING_ANCHOR}>
                <span>{lowAnchor}</span>
                <span>{highAnchor}</span>
            </div>
        </div>
    );
};
