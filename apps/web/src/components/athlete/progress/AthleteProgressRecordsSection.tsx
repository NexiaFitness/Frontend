/**
 * AthleteProgressRecordsSection.tsx — Marcas personales (fila entera pulsable).
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { Trophy } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AthleteSectionHeading } from "@/components/athlete/AthleteSectionHeading";
import type { RecentRecordRow } from "@nexia/shared/utils/athlete/athleteProgressUtils";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import {
    addLocalDateDays,
    athleteDayKey,
} from "@nexia/shared/utils/athlete/athleteProgressPeriod";
import {
    ATHLETE_PROGRESS_LIST_ROW,
    ATHLETE_PROGRESS_RECORD_ROW,
    ATHLETE_TROPHY_ICON,
} from "./athleteProgressViewPresentation";
import { cn } from "@/lib/utils";

export interface AthleteProgressRecordsSectionProps {
    records: RecentRecordRow[];
    onSelectExercise: (record: RecentRecordRow) => void;
}

function formatRecordWhen(isoDate: string): string {
    const key = isoDate.slice(0, 10);
    const today = athleteDayKey();
    if (key === today) return "Hoy";
    if (key === addLocalDateDays(today, -1)) return "Ayer";
    return formatAthleteDateLong(isoDate);
}

export const AthleteProgressRecordsSection: React.FC<AthleteProgressRecordsSectionProps> = ({
    records,
    onSelectExercise,
}) => {
    if (records.length === 0) return null;

    return (
        <section className="space-y-3" aria-label="Marcas personales">
            <AthleteSectionHeading
                title="Marcas personales"
                icon={<Trophy className="size-3.5 text-warning" aria-hidden />}
            />
            <ul className="space-y-2">
                {records.map((rec) => {
                    const gain =
                        rec.maxWeight != null && rec.previousMaxWeight != null
                            ? Math.round((rec.maxWeight - rec.previousMaxWeight) * 10) / 10
                            : null;
                    return (
                        <li key={`${rec.exerciseId}-${rec.trackingDate}`}>
                            <button
                                type="button"
                                className={cn(
                                    ATHLETE_PROGRESS_RECORD_ROW,
                                    ATHLETE_PROGRESS_LIST_ROW,
                                    "w-full"
                                )}
                                onClick={() => onSelectExercise(rec)}
                            >
                                <NexiaGlassAccentRim />
                                <div className={`relative ${ATHLETE_TROPHY_ICON}`}>
                                    <Trophy className="size-4" aria-hidden />
                                </div>
                                <div className="relative min-w-0 flex-1 text-left">
                                    <p className="font-semibold text-foreground">
                                        {rec.exerciseName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {rec.maxWeight != null ? `${rec.maxWeight} kg` : "—"}
                                        {gain != null ? ` · +${gain} kg` : ""}
                                        {" · "}
                                        {formatRecordWhen(rec.trackingDate)}
                                    </p>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
