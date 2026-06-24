/**
 * AthleteRunReferenceEmptyState — Sin historial contextual (F6-UX-02).
 */

import React from "react";
import { History } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_RUN_REFERENCE_CARD,
    ATHLETE_RUN_REFERENCE_EMPTY,
    ATHLETE_RUN_REFERENCE_SECTION_LABEL,
} from "./athleteRunPresentation";

export const AthleteRunReferenceEmptyState: React.FC = () => (
    <div className={ATHLETE_RUN_REFERENCE_CARD}>
        <NexiaGlassAccentRim />
        <div className="relative z-[1] flex items-start gap-2">
            <History className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
            <div className="space-y-1">
                <p className={ATHLETE_RUN_REFERENCE_SECTION_LABEL}>Referencia</p>
                <p className={ATHLETE_RUN_REFERENCE_EMPTY}>Sin historial en este contexto</p>
            </div>
        </div>
    </div>
);
