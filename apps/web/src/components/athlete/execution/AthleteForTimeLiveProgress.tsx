/**
 * AthleteForTimeLiveProgress.tsx — Rail de rondas, confirmación y splits en zona visible (V05).
 */

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { ForTimeSplitView } from "@nexia/shared/utils/athlete/forTimeResult";
import {
    formatForTimeDuration,
    formatForTimeSegmentDelta,
} from "@nexia/shared/utils/athlete/forTimeResult";
import type { ForTimeRoundAdvanceCue } from "@/hooks/athlete/useAthleteForTimeFlow";
import {
    ATHLETE_RUN_FOR_TIME_ADVANCE_CUE,
    ATHLETE_RUN_FOR_TIME_ADVANCE_CUE_HINT,
    ATHLETE_RUN_FOR_TIME_ADVANCE_CUE_TITLE,
    ATHLETE_RUN_FOR_TIME_LIVE_CARD,
    ATHLETE_RUN_FOR_TIME_NEXT_ACTION,
    ATHLETE_RUN_FOR_TIME_RAIL,
    ATHLETE_RUN_FOR_TIME_RAIL_STEP,
    ATHLETE_RUN_FOR_TIME_RAIL_STEP_CURRENT,
    ATHLETE_RUN_FOR_TIME_RAIL_STEP_LABEL,
    ATHLETE_RUN_FOR_TIME_RAIL_STEP_META,
    ATHLETE_RUN_FOR_TIME_RAIL_STEP_VALUE,
    ATHLETE_RUN_FOR_TIME_SPLITS_LABEL,
} from "./athleteRunPresentation";

export interface AthleteForTimeLiveProgressProps {
    roundIndex: number;
    roundTotal: number;
    splitViews: readonly ForTimeSplitView[];
    roundAdvanceCue: ForTimeRoundAdvanceCue | null;
    blockWorkIsReady?: boolean;
}

function resolveStepState(
    stepRoundIndex: number,
    currentRoundIndex: number,
    splitViews: readonly ForTimeSplitView[]
): "done" | "current" | "upcoming" {
    const split = splitViews.find((item) => item.roundIndex === stepRoundIndex);
    if (split) return "done";
    if (stepRoundIndex === currentRoundIndex + 1) return "current";
    return "upcoming";
}

export const AthleteForTimeLiveProgress: React.FC<AthleteForTimeLiveProgressProps> = ({
    roundIndex,
    roundTotal,
    splitViews,
    roundAdvanceCue,
    blockWorkIsReady = false,
}) => {
    const steps = useMemo(
        () => Array.from({ length: roundTotal }, (_, index) => index + 1),
        [roundTotal]
    );

    const nextActionHint = useMemo(() => {
        if (blockWorkIsReady) return null;
        if (roundAdvanceCue && !roundAdvanceCue.isLastRound) {
            return `Haz la ronda ${roundAdvanceCue.completedRoundIndex + 1} y pulsa «Ronda completada» cuando termines.`;
        }
        if (roundIndex >= roundTotal - 1) {
            return "Última ronda — al terminar pulsa «Registrar tiempo final» abajo.";
        }
        return `Completa los ejercicios de la ronda ${roundIndex + 1} y pulsa «Ronda ${roundIndex + 1} completada» abajo.`;
    }, [blockWorkIsReady, roundAdvanceCue, roundIndex, roundTotal]);

    if (blockWorkIsReady || roundTotal === 0) return null;

    return (
        <div className={ATHLETE_RUN_FOR_TIME_LIVE_CARD}>
            <NexiaGlassAccentRim />
            <div className="relative z-[1] space-y-3">
                <p className={ATHLETE_RUN_FOR_TIME_SPLITS_LABEL}>Progreso FOR TIME</p>

                <div className={ATHLETE_RUN_FOR_TIME_RAIL}>
                    {steps.map((stepRoundIndex) => {
                        const state = resolveStepState(stepRoundIndex, roundIndex, splitViews);
                        const split = splitViews.find(
                            (item) => item.roundIndex === stepRoundIndex
                        );

                        return (
                            <div
                                key={stepRoundIndex}
                                className={ATHLETE_RUN_FOR_TIME_RAIL_STEP(state)}
                            >
                                <p className={ATHLETE_RUN_FOR_TIME_RAIL_STEP_LABEL}>
                                    Ronda {stepRoundIndex}
                                </p>
                                {state === "done" && split ? (
                                    <>
                                        <div className="mt-1 flex items-center justify-center gap-1">
                                            <Check
                                                className="size-3.5 text-success"
                                                aria-hidden
                                            />
                                            <span className={ATHLETE_RUN_FOR_TIME_RAIL_STEP_VALUE}>
                                                {formatForTimeDuration(split.cumulativeSeconds)}
                                            </span>
                                        </div>
                                        <p className={ATHLETE_RUN_FOR_TIME_RAIL_STEP_META}>
                                            {formatForTimeSegmentDelta(split.segmentSeconds)}
                                        </p>
                                    </>
                                ) : null}
                                {state === "current" ? (
                                    <p className={ATHLETE_RUN_FOR_TIME_RAIL_STEP_CURRENT}>
                                        En curso
                                    </p>
                                ) : null}
                                {state === "upcoming" ? (
                                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                                        Pendiente
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                {roundAdvanceCue ? (
                    <div className={ATHLETE_RUN_FOR_TIME_ADVANCE_CUE} role="status">
                        <p className={ATHLETE_RUN_FOR_TIME_ADVANCE_CUE_TITLE}>
                            Ronda {roundAdvanceCue.completedRoundIndex} registrada ·{" "}
                            {formatForTimeDuration(roundAdvanceCue.cumulativeSeconds)}{" "}
                            <span className="text-success/90">
                                ({formatForTimeSegmentDelta(roundAdvanceCue.segmentSeconds)})
                            </span>
                        </p>
                        <p className={ATHLETE_RUN_FOR_TIME_ADVANCE_CUE_HINT}>
                            {roundAdvanceCue.isLastRound
                                ? "Tiempo total guardado — revisa el cierre y confirma el bloque."
                                : `Sigue con la ronda ${roundAdvanceCue.completedRoundIndex + 1}. El cronómetro no se detiene.`}
                        </p>
                    </div>
                ) : null}

                {nextActionHint && !roundAdvanceCue ? (
                    <p className={ATHLETE_RUN_FOR_TIME_NEXT_ACTION}>{nextActionHint}</p>
                ) : null}
            </div>
        </div>
    );
};
