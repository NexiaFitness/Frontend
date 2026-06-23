/**
 * AthleteForTimeCompletionReview.tsx — Cierre FOR TIME: total + splits + RPE (V05).
 */

import React, { useMemo } from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    buildForTimeSplitViews,
    formatForTimeDuration,
    formatForTimeSegmentDelta,
} from "@nexia/shared/utils/athlete/forTimeResult";
import { AthleteRoundEffortSection } from "./AthleteRoundEffortSection";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_FOR_TIME_SPLITS_CUMULATIVE,
    ATHLETE_RUN_FOR_TIME_SPLITS_ROW,
    ATHLETE_RUN_FOR_TIME_SPLITS_ROUND,
    ATHLETE_RUN_FOR_TIME_SPLITS_SEGMENT,
    ATHLETE_RUN_FOR_TIME_TOTAL_VALUE,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "./athleteRunPresentation";

export interface AthleteForTimeCompletionReviewProps {
    totalSeconds: number;
    cumulativeSplits: readonly number[];
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

export const AthleteForTimeCompletionReview: React.FC<AthleteForTimeCompletionReviewProps> = ({
    totalSeconds,
    cumulativeSplits,
    roundRpe,
    onRoundRpeChange,
}) => {
    const splitViews = useMemo(
        () => buildForTimeSplitViews(cumulativeSplits),
        [cumulativeSplits]
    );

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Cierre FOR TIME</p>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        Tiempo total del bloque. Revisa los splits por ronda antes de confirmar.
                    </p>
                    <p className={ATHLETE_RUN_FOR_TIME_TOTAL_VALUE}>
                        {formatForTimeDuration(totalSeconds)}
                    </p>
                </div>
            </div>

            {splitViews.length > 0 ? (
                <div className="space-y-2">
                    <p className={ATHLETE_RUN_AMRAP_PARTIAL_ROW_LABEL}>Desglose por ronda</p>
                    {splitViews.map((split) => (
                        <div key={split.roundIndex} className={ATHLETE_RUN_FOR_TIME_SPLITS_ROW}>
                            <span className={ATHLETE_RUN_FOR_TIME_SPLITS_ROUND}>
                                Ronda {split.roundIndex}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={ATHLETE_RUN_FOR_TIME_SPLITS_CUMULATIVE}>
                                    {formatForTimeDuration(split.cumulativeSeconds)}
                                </span>
                                <span className={ATHLETE_RUN_FOR_TIME_SPLITS_SEGMENT}>
                                    {formatForTimeSegmentDelta(split.segmentSeconds)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <AthleteRoundEffortSection
                variant="block"
                value={roundRpe}
                onChange={onRoundRpeChange}
            />
        </div>
    );
};
