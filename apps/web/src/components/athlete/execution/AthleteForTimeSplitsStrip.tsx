/**
 * AthleteForTimeSplitsStrip.tsx — Splits acumulados visibles durante FOR TIME (V05).
 */

import React, { useMemo } from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    buildForTimeSplitViews,
    formatForTimeDuration,
    formatForTimeSegmentDelta,
} from "@nexia/shared/utils/athlete/forTimeResult";
import {
    ATHLETE_RUN_FOR_TIME_SPLITS_CARD,
    ATHLETE_RUN_FOR_TIME_SPLITS_CUMULATIVE,
    ATHLETE_RUN_FOR_TIME_SPLITS_LABEL,
    ATHLETE_RUN_FOR_TIME_SPLITS_ROUND,
    ATHLETE_RUN_FOR_TIME_SPLITS_ROW,
    ATHLETE_RUN_FOR_TIME_SPLITS_SEGMENT,
} from "./athleteRunPresentation";

export interface AthleteForTimeSplitsStripProps {
    cumulativeSplits: readonly number[];
}

export const AthleteForTimeSplitsStrip: React.FC<AthleteForTimeSplitsStripProps> = ({
    cumulativeSplits,
}) => {
    const splitViews = useMemo(
        () => buildForTimeSplitViews(cumulativeSplits),
        [cumulativeSplits]
    );

    if (splitViews.length === 0) return null;

    return (
        <div className={ATHLETE_RUN_FOR_TIME_SPLITS_CARD}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
                <p className={ATHLETE_RUN_FOR_TIME_SPLITS_LABEL}>Splits por ronda</p>
                <div className="space-y-2">
                    {splitViews.map((split) => (
                        <div key={split.roundIndex} className={ATHLETE_RUN_FOR_TIME_SPLITS_ROW}>
                            <span className={ATHLETE_RUN_FOR_TIME_SPLITS_ROUND}>
                                R{split.roundIndex}
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
            </div>
        </div>
    );
};
