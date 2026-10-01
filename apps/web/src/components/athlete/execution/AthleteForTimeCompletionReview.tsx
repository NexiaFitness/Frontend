/**
 * AthleteForTimeCompletionReview.tsx — Cierre FOR TIME: min/seg editables + RPE (B4).
 *
 * @author Frontend Team
 * @since 2026-10-01
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    clampForTimeTotalSeconds,
    combineForTimeMinSec,
    splitForTimeTotalSeconds,
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
const NUMERIC_INPUT_CLASS =
    "h-12 min-h-12 w-16 min-w-[3rem] rounded-lg border border-border bg-background text-center text-2xl font-semibold tabular-nums text-foreground";

export const AthleteForTimeCompletionReview: React.FC<AthleteForTimeCompletionReviewProps> = ({
    totalSeconds,
    onTotalSecondsChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    const { minutes: syncedMinutes, seconds: syncedSeconds } =
        splitForTimeTotalSeconds(totalSeconds);
    const [minutes, setMinutes] = useState(String(syncedMinutes));
    const [seconds, setSeconds] = useState(syncedSeconds.toString().padStart(2, "0"));
    const focusRef = useRef({ minutes: false, seconds: false });

    useEffect(() => {
        if (focusRef.current.minutes || focusRef.current.seconds) return;
        const parts = splitForTimeTotalSeconds(totalSeconds);
        setMinutes(String(parts.minutes));
        setSeconds(parts.seconds.toString().padStart(2, "0"));
    }, [totalSeconds]);

    const pushTotal = useCallback(
        (mins: number, secs: number) => {
            const combined = combineForTimeMinSec(mins, secs);
            if (combined == null || combined <= 0) return;
            onTotalSecondsChange(clampForTimeTotalSeconds(combined));
        },
        [onTotalSecondsChange]
    );

    const applySeconds = useCallback(
        (next: number) => {
            const clamped = clampForTimeTotalSeconds(next);
            if (clamped <= 0) return;
            onTotalSecondsChange(clamped);
            const parts = splitForTimeTotalSeconds(clamped);
            setMinutes(String(parts.minutes));
            setSeconds(parts.seconds.toString().padStart(2, "0"));
        },
        [onTotalSecondsChange]
    );

    const onMinutesChange = (raw: string): void => {
        const digits = raw.replace(/\D/g, "");
        setMinutes(digits);
        const mins = digits === "" ? 0 : Number.parseInt(digits, 10);
        if (Number.isNaN(mins)) return;
        const secs = Number.parseInt(seconds, 10) || 0;
        pushTotal(mins, secs);
    };

    const onSecondsChange = (raw: string): void => {
        const digits = raw.replace(/\D/g, "").slice(0, 2);
        setSeconds(digits);
        if (digits === "") return;
        const secs = Number.parseInt(digits, 10);
        if (Number.isNaN(secs) || secs >= 60) return;
        const mins = Number.parseInt(minutes, 10) || 0;
        pushTotal(mins, secs);
    };

    const onSecondsBlur = (): void => {
        focusRef.current.seconds = false;
        const secs = Number.parseInt(seconds, 10);
        if (Number.isNaN(secs) || secs >= 60) {
            const parts = splitForTimeTotalSeconds(totalSeconds);
            setSeconds(parts.seconds.toString().padStart(2, "0"));
            return;
        }
        setSeconds(secs.toString().padStart(2, "0"));
        const mins = Number.parseInt(minutes, 10) || 0;
        pushTotal(mins, secs);
    };

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Cierre FOR TIME</p>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        Tiempo total del bloque en minutos y segundos. Ajusta si el cronómetro
                        no refleja tu tiempo real.
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
                        <div className="flex items-center gap-1">
                            <label className="sr-only" htmlFor="for-time-minutes">
                                Minutos
                            </label>
                            <input
                                id="for-time-minutes"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                className={NUMERIC_INPUT_CLASS}
                                value={minutes}
                                onFocus={() => {
                                    focusRef.current.minutes = true;
                                }}
                                onBlur={() => {
                                    focusRef.current.minutes = false;
                                    if (minutes === "") {
                                        setMinutes("0");
                                    }
                                }}
                                onChange={(event) => onMinutesChange(event.target.value)}
                                aria-label="Minutos"
                            />
                            <span className="text-2xl font-semibold text-muted-foreground" aria-hidden>
                                :
                            </span>
                            <label className="sr-only" htmlFor="for-time-seconds">
                                Segundos
                            </label>
                            <input
                                id="for-time-seconds"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                className={NUMERIC_INPUT_CLASS}
                                value={seconds}
                                onFocus={() => {
                                    focusRef.current.seconds = true;
                                }}
                                onBlur={onSecondsBlur}
                                onChange={(event) => onSecondsChange(event.target.value)}
                                aria-label="Segundos"
                            />
                        </div>
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
