/**
 * AthleteProgressRecordsSection.tsx — PRs recientes premium.
 */

import React from "react";
import { Trophy } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";
import type { RecentRecordRow } from "@nexia/shared/utils/athlete/athleteProgressUtils";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { ATHLETE_PROGRESS_RECORD_ROW, ATHLETE_TROPHY_ICON } from "./athleteProgressViewPresentation";

export interface AthleteProgressRecordsSectionProps {
    records: RecentRecordRow[];
    onSelectExercise: (record: RecentRecordRow) => void;
}

export const AthleteProgressRecordsSection: React.FC<AthleteProgressRecordsSectionProps> = ({
    records,
    onSelectExercise,
}) => {
    if (records.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Records recientes">
            <h2 className={`flex items-center gap-2 ${ATHLETE_SECTION_LABEL}`}>
                <Trophy className="size-3.5 text-warning" aria-hidden />
                Marcas personales
            </h2>
            <ul className="space-y-2">
                {records.map((rec) => (
                    <li key={`${rec.exerciseId}-${rec.trackingDate}`}>
                        <article className={ATHLETE_PROGRESS_RECORD_ROW}>
                            <NexiaGlassAccentRim />
                            <div className={`relative ${ATHLETE_TROPHY_ICON}`}>
                                <Trophy className="size-4" aria-hidden />
                            </div>
                            <div className="relative min-w-0 flex-1">
                                <p className="font-semibold text-foreground">{rec.exerciseName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {rec.maxWeight != null ? `${rec.maxWeight} kg` : "—"}
                                    {rec.maxReps != null ? ` × ${rec.maxReps}` : ""}
                                    {" · "}
                                    {formatAthleteDateLong(rec.trackingDate)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="relative shrink-0 text-sm font-medium text-primary hover:underline"
                                onClick={() => onSelectExercise(rec)}
                            >
                                Ver
                            </button>
                        </article>
                    </li>
                ))}
            </ul>
        </section>
    );
};
