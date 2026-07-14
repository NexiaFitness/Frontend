/**
 * AthleteRunReferenceCardSkeleton — Shimmer mientras carga referencia (F6-UX-01).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_RUN_REFERENCE_CARD,
    ATHLETE_RUN_REFERENCE_SKELETON_BAR,
    ATHLETE_RUN_REFERENCE_SKELETON_LABEL,
} from "./athleteRunPresentation";

export const AthleteRunReferenceCardSkeleton: React.FC = () => (
    <div className={ATHLETE_RUN_REFERENCE_CARD} aria-busy="true" aria-label="Cargando referencia">
        <NexiaGlassAccentRim />
        <div className="relative z-[1] space-y-3">
            <div className={ATHLETE_RUN_REFERENCE_SKELETON_LABEL} />
            <div className={ATHLETE_RUN_REFERENCE_SKELETON_BAR} />
            <div className="h-3 w-24 rounded-md bg-surface-2/70 motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>
    </div>
);
