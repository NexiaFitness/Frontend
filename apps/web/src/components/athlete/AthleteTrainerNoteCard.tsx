/**
 * AthleteTrainerNoteCard.tsx — Bloque “Del entrenador” en inicio (V01 F2).
 */

import React from "react";
import { MessageSquareQuote } from "lucide-react";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";

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
            className="rounded-lg border border-primary/20 bg-primary/5 p-4"
        >
            <div className="mb-2 flex items-center gap-2">
                <MessageSquareQuote className="size-4 text-primary" aria-hidden />
                <h2 className="text-sm font-semibold text-foreground">Del entrenador</h2>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{note}</p>
            <p className="mt-2 text-caption text-muted-foreground">
                {session.session_name}
                {session.session_date ? ` · ${formatAthleteDateLong(session.session_date)}` : ""}
            </p>
        </section>
    );
};
