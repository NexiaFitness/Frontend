/**
 * AthleteEmomCompletionReview.tsx — EMOM D6: Sí/No + nota opcional (FE-4).
 * Contexto: nota en payload_json.athlete_note del timed-result.
 * @author Frontend Team
 * @since v8.3.0
 */

import React, { useMemo } from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthleteEmomInterval } from "@nexia/shared/utils/athlete/buildAthleteRunSteps";
import { AthleteRoundEffortSection } from "@/components/athlete/execution/AthleteRoundEffortSection";
import {
    ATHLETE_RUN_AMRAP_HINT,
    ATHLETE_RUN_AMRAP_ROUNDS_CARD,
    ATHLETE_RUN_AMRAP_ROUNDS_LABEL,
    ATHLETE_RUN_AMRAP_SUMMARY,
    ATHLETE_RUN_EMOM_CHOICE_BTN,
    ATHLETE_RUN_EMOM_CHOICE_ROW,
    ATHLETE_RUN_LOGGER_REVEAL,
} from "@/components/athlete/execution/athleteRunPresentation";

export interface AthleteEmomCompletionReviewProps {
    intervals: AthleteEmomInterval[];
    intervalSeconds: number | null;
    asPlanned: boolean | null;
    onAsPlannedChange: (value: boolean) => void;
    athleteNote: string;
    onAthleteNoteChange: (value: string) => void;
    roundRpe: number | null;
    onRoundRpeChange: (value: number | null) => void;
}

export const AthleteEmomCompletionReview: React.FC<AthleteEmomCompletionReviewProps> = ({
    intervals,
    intervalSeconds,
    asPlanned,
    onAsPlannedChange,
    athleteNote,
    onAthleteNoteChange,
    roundRpe,
    onRoundRpeChange,
}) => {
    const intervalTotal = intervals.length;

    const completionSummary = useMemo(() => {
        if (asPlanned === null) return null;
        if (asPlanned) {
            return `${intervalTotal}/${intervalTotal} intervalos`;
        }
        const failedLabel =
            intervalSeconds != null && intervalSeconds > 0
                ? ` · ${intervalSeconds} s por intervalo`
                : "";
        return `No como previsto · ${intervalTotal} intervalos${failedLabel}`;
    }, [asPlanned, intervalSeconds, intervalTotal]);

    return (
        <div className={`space-y-3 ${ATHLETE_RUN_LOGGER_REVEAL}`}>
            <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1] space-y-3">
                    <p className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>Cierre EMOM</p>
                    <p className={ATHLETE_RUN_AMRAP_HINT}>
                        ¿Completaste el EMOM entero como estaba previsto?
                    </p>
                    <div className={ATHLETE_RUN_EMOM_CHOICE_ROW} role="group" aria-label="EMOM completado">
                        <button
                            type="button"
                            className={ATHLETE_RUN_EMOM_CHOICE_BTN(asPlanned === true)}
                            onClick={() => onAsPlannedChange(true)}
                        >
                            Sí
                        </button>
                        <button
                            type="button"
                            className={ATHLETE_RUN_EMOM_CHOICE_BTN(asPlanned === false)}
                            onClick={() => onAsPlannedChange(false)}
                        >
                            No
                        </button>
                    </div>
                    {completionSummary ? (
                        <p className={ATHLETE_RUN_AMRAP_SUMMARY}>{completionSummary}</p>
                    ) : null}
                </div>
            </div>

            {asPlanned === false ? (
                <div className={ATHLETE_RUN_AMRAP_ROUNDS_CARD}>
                    <NexiaGlassAccentRim />
                    <div className="relative z-[1] space-y-2">
                        <label htmlFor="emom-athlete-note" className={ATHLETE_RUN_AMRAP_ROUNDS_LABEL}>
                            Nota (opcional)
                        </label>
                        <textarea
                            id="emom-athlete-note"
                            rows={3}
                            value={athleteNote}
                            onChange={(event) => onAthleteNoteChange(event.target.value)}
                            placeholder="Ej.: me costó la última ventana por fatiga"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        />
                    </div>
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
