/**
 * AthleteTrainerNoteCard.tsx — Bloque “Del entrenador” en inicio (V01 F2).
 */

import React from "react";
import { MessageSquareQuote } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import {
    ATHLETE_SECTION_LABEL,
    ATHLETE_SETTINGS_CARD,
    ATHLETE_TRAINER_QUOTE_BLOCK,
    ATHLETE_TRAINER_QUOTE_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { cn } from "@/lib/utils";

export interface AthleteTrainerNoteCardProps {
    session: TrainingSession;
    note: string;
}

export const AthleteTrainerNoteCard: React.FC<AthleteTrainerNoteCardProps> = ({
    session,
    note,
}) => {
    return (
        <section
            aria-label="Del entrenador"
            className={cn(ATHLETE_SETTINGS_CARD, "relative space-y-3 p-4 pt-5")}
        >
            <NexiaGlassAccentRim />
            <div className="relative flex items-center gap-2">
                <MessageSquareQuote className="size-4 text-primary" aria-hidden />
                <h2 className={ATHLETE_SECTION_LABEL}>Del entrenador</h2>
            </div>
            <div className={cn(ATHLETE_TRAINER_QUOTE_BLOCK, "relative")}>
                <p className={ATHLETE_TRAINER_QUOTE_LABEL}>Nota de sesión</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{note}</p>
            </div>
            <p className="relative text-caption text-muted-foreground">
                {session.session_name}
                {session.session_date ? ` · ${formatAthleteDateLong(session.session_date)}` : ""}
            </p>
        </section>
    );
};
