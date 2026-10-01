/**
 * AthleteForTimeCompletionReview.tsx — Cierre FOR TIME: tiempo total editable + RPE (B4).
 */

import React, { useCallback, useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    clampForTimeTotalSeconds,
    formatForTimeDuration,
    parseForTimeMmSs,
} from "@nexia/shared/utils/athlete/forTimeResult";
import { AthleteRoundEffortSection } from "./AthleteRoundEffortSection";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "./athleteRunPresentation";

export interface AthleteForTimeCompletionReviewProps {
    totalSeconds: number;
    onTotalSecondsChange: (seconds: number) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

const STEP_SECONDS = 5;

export const AthleteForTimeCompletionReview: React.FC<AthleteForTimeCompletionReviewProps> = ({
    totalSeconds,
    onTotalSecondsChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    const [mmSsInput, setMmSsInput] = useState(() => formatForTimeDuration(totalSeconds));

    useEffect(() => {
        setMmSsInput(formatForTimeDuration(totalSeconds));
    }, [totalSeconds]);

    const applySeconds = useCallback(
        (next: number) => {
            const clamped = clampForTimeTotalSeconds(next);
            onTotalSecondsChange(clamped);
            setMmSsInput(formatForTimeDuration(clamped));
        },
        [onTotalSecondsChange]
    );

    const onInputBlur = (): void => {
        const parsed = parseForTimeMmSs(mmSsInput);
        if (parsed != null) {
            applySeconds(parsed);
            return;
        }
        setMmSsInput(formatForTimeDuration(totalSeconds));
    };

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Cierre FOR TIME</p>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        Tiempo total del bloque en mm:ss. Ajusta si el cronómetro no refleja tu
                        tiempo real.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <button
                            type="button"
                            className="inline-flex h-12 min-h-12 w-12 min-w-12 items-center justify-center rounded-lg border border-border bg-background"
                            aria-label="Restar 5 segundos"
                            onClick={() => applySeconds(totalSeconds - STEP_SECONDS)}
                        >
                            <Minus className="h-5 w-5" aria-hidden />
                        </button>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="h-12 min-h-12 w-28 rounded-lg border border-border bg-background text-center text-2xl font-semibold tabular-nums text-foreground"
                            value={mmSsInput}
                            onChange={(event) => setMmSsInput(event.target.value)}
                            onBlur={onInputBlur}
                            aria-label="Tiempo total mm:ss"
                        />
                        <button
                            type="button"
                            className="inline-flex h-12 min-h-12 w-12 min-w-12 items-center justify-center rounded-lg border border-border bg-background"
                            aria-label="Sumar 5 segundos"
                            onClick={() => applySeconds(totalSeconds + STEP_SECONDS)}
                        >
                            <Plus className="h-5 w-5" aria-hidden />
                        </button>
                    </div>
                </div>
            </div>

            <AthleteRoundEffortSection
                variant="block"
                value={roundRpe}
                onChange={onRoundRpeChange}
            />
        </div>
    );
};
