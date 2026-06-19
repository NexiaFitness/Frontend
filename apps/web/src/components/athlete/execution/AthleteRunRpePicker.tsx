/**
 * AthleteRunRpePicker.tsx — RPE 6–10 con estilo escala V07 + hint educativo.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    ATHLETE_RATING_ANCHOR,
    ATHLETE_RATING_PROGRESS,
    ATHLETE_RATING_SEGMENT,
    ATHLETE_RATING_SEGMENT_FILLED,
    ATHLETE_RATING_SEGMENT_ROW,
    ATHLETE_RATING_SEGMENT_SELECTED,
    ATHLETE_RATING_TRACK,
    ATHLETE_RATING_VALUE_PILL,
} from "@/components/athlete/feedback/athleteRatingPresentation";
import { ATHLETE_RUN_FIELD_HINT, ATHLETE_RUN_FIELD_LABEL } from "./athleteRunPresentation";

const RPE_OPTIONS = [6, 7, 8, 9, 10] as const;

export interface AthleteRunRpePickerProps {
    value: number | null;
    onChange: (value: number | null) => void;
    /** Ocultar título/hint — p. ej. cuando el padre ya contextualiza (ronda compartida). */
    hideHeader?: boolean;
}

export const AthleteRunRpePicker: React.FC<AthleteRunRpePickerProps> = ({
    value,
    onChange,
    hideHeader = false,
}) => {
    const progressPercent =
        value != null ? ((value - 6) / 4) * 100 : 0;

    return (
        <div className="space-y-2">
            {!hideHeader ? (
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <span className={ATHLETE_RUN_FIELD_LABEL}>Esfuerzo percibido (RPE)</span>
                        <p className={ATHLETE_RUN_FIELD_HINT}>
                            Del 6 al 10: qué tan duro se sintió. Opcional — ayuda a tu entrenador.
                        </p>
                    </div>
                    {value != null && (
                        <span className={ATHLETE_RATING_VALUE_PILL.warning} aria-hidden>
                            {value}
                        </span>
                    )}
                </div>
            ) : value != null ? (
                <div className="flex justify-end">
                    <span className={ATHLETE_RATING_VALUE_PILL.warning} aria-hidden>
                        {value}
                    </span>
                </div>
            ) : null}

            <div className={ATHLETE_RATING_TRACK} role="radiogroup" aria-label="RPE esfuerzo percibido">
                {value != null && (
                    <div
                        className={ATHLETE_RATING_PROGRESS.warning}
                        style={{ width: `calc(${progressPercent}% - 0.25rem)` }}
                        aria-hidden
                    />
                )}
                <div className={ATHLETE_RATING_SEGMENT_ROW}>
                    {RPE_OPTIONS.map((step) => {
                        const isSelected = value === step;
                        const isFilled = value != null && step <= value;

                        return (
                            <button
                                key={step}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => onChange(isSelected ? null : step)}
                                className={cn(
                                    ATHLETE_RATING_SEGMENT,
                                    !isSelected && isFilled && ATHLETE_RATING_SEGMENT_FILLED.warning,
                                    isSelected && ATHLETE_RATING_SEGMENT_SELECTED.warning
                                )}
                            >
                                {step}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={ATHLETE_RATING_ANCHOR}>
                <span>Fácil</span>
                <span>Máximo</span>
            </div>
        </div>
    );
};
