/**
 * AthletePlanActiveHero.tsx — Bloque activo mes/semana + anillos (V08).
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import type { AthletePlanActiveBlockCopy } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import { formatAthletePercent } from "@nexia/shared/utils/athlete/athletePlanViewUtils";
import { ATHLETE_PLAN_HERO } from "./athletePlanPresentation";
import { AthletePlanLoadBar } from "./AthletePlanLoadBar";
import { AthletePlanRingMetric } from "./AthletePlanRingMetric";

export interface AthletePlanActiveHeroProps {
    active: AthletePlanActiveBlockCopy;
    sessionsCompleted: number;
    sessionsPlanned: number;
}

export const AthletePlanActiveHero: React.FC<AthletePlanActiveHeroProps> = ({
    active,
    sessionsCompleted,
    sessionsPlanned,
}) => {
    return (
        <section className={ATHLETE_PLAN_HERO} aria-label="Bloque activo del plan">
            <NexiaGlassAccentRim />

            <div className="relative space-y-1">
                <p className="text-sm font-semibold capitalize text-foreground">{active.monthLabel}</p>
                {active.weekLabel && (
                    <p className="text-xs text-muted-foreground">{active.weekLabel}</p>
                )}
            </div>

            <div className="relative flex items-start justify-around gap-3">
                <AthletePlanRingMetric
                    label="Adherencia"
                    value={active.adherencePercent}
                    tone="success"
                    displayValue={formatAthletePercent(active.adherencePercent)}
                />
                <AthletePlanRingMetric
                    label="Coherencia"
                    value={active.coherencePercent ?? 0}
                    displayValue={
                        active.coherencePercent != null
                            ? formatAthletePercent(active.coherencePercent)
                            : "—"
                    }
                />
            </div>

            <p className="relative text-center text-xs text-muted-foreground tabular-nums">
                {sessionsCompleted} / {sessionsPlanned} sesiones este año
            </p>

            <div className="relative space-y-4 border-t border-border/60 pt-4">
                <AthletePlanLoadBar label="Volumen planificado" level={active.volumeLevel} />
                <AthletePlanLoadBar
                    label="Intensidad planificada"
                    level={active.intensityLevel}
                    tone="warning"
                />
            </div>
        </section>
    );
};
